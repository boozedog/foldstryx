/**
 * Packed-artifact consumer smoke for the Foldstryx external boundary.
 *
 * Packs the five external-consumer packages (`@foldstryx/tokens`, `styles`,
 * `foldkit`, `kitchen-sink`, `docs`) into a temporary directory, scaffolds a
 * throwaway Vite consumer that installs those tarballs (never workspace
 * links), builds it, boots a fresh `vite preview` on an ephemeral port, and
 * drives Chrome to assert the docs shell renders, a route transition works,
 * and the Atkinson Hyperlegible Next / Maple Mono NL NF fonts load from the
 * packed `@foldstryx/styles` assets.
 *
 * Requires `google-chrome` or `CHROME_PATH`. GitHub Actions sets `CI=true`;
 * that (or `CHROME_NO_SANDBOX=1`) adds `--no-sandbox`.
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const fixtureDir = resolve(here, 'fixtures/packed-consumer')

const PACKAGES = [
  '@foldstryx/tokens',
  '@foldstryx/styles',
  '@foldstryx/foldkit',
  '@foldstryx/kitchen-sink',
  '@foldstryx/docs',
]

const wait = ms => new Promise(resolveWait => setTimeout(resolveWait, ms))

const run = (command, args, options = {}) =>
  new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolveRun()
      else reject(new Error(`${command} ${args.join(' ')} exited ${code}`))
    })
  })

const runCapture = (command, args, options = {}) =>
  new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    })
    let output = ''
    child.stdout.on('data', chunk => {
      output += chunk.toString()
    })
    child.stderr.on('data', chunk => {
      output += chunk.toString()
    })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolveRun(output)
      else
        reject(
          new Error(`${command} ${args.join(' ')} exited ${code}\n${output}`),
        )
    })
  })

const waitForUrl = async (url, timeoutMs = 30_000) => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // preview not ready
    }
    await wait(200)
  }
  throw new Error(`Timed out waiting for ${url}`)
}

// Assert the consumer build emitted StyleX CSS (hashed `x…` class rules).
// This proves the packed `.stylex.js` modules were compiled by the consumer's
// `@stylexjs/unplugin` rather than silently skipped.
const assertStylexCss = async consumerDir => {
  const assetsDir = join(consumerDir, 'dist', 'assets')
  const files = await readdir(assetsDir)
  const cssFile = files.find(file => file.endsWith('.css'))
  if (cssFile === undefined) {
    throw new Error('consumer build produced no CSS asset')
  }
  const css = await readFile(join(assetsDir, cssFile), 'utf8')
  const stylexRules = css.match(/\.x[0-9a-z]{6,8}[^{]*\{/g) ?? []
  if (stylexRules.length === 0) {
    throw new Error(
      'consumer build CSS contains no StyleX rules; packed .stylex.js modules were not compiled',
    )
  }
  return { cssFile, stylexRules: stylexRules.length }
}

const parsePreviewUrl = output => {
  const local = output.match(/Local:\s*(https?:\/\/[^\s]+)/)
  const url = local?.[1] ?? output.match(/https?:\/\/localhost:\d+/)?.[0]
  if (url === undefined) return null
  return url.endsWith('/') ? url : `${url}/`
}

const startPreview = async cwd => {
  const child = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--host', 'localhost', '--port', '0'],
    { cwd, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let output = ''
  child.stdout.on('data', chunk => {
    output += chunk.toString()
  })
  child.stderr.on('data', chunk => {
    output += chunk.toString()
  })
  let exitInfo = null
  let spawnError = null
  const exited = new Promise(resolveExit => {
    child.on('error', error => {
      spawnError = error
      resolveExit()
    })
    child.on('exit', (code, signal) => {
      exitInfo = { code, signal }
      resolveExit()
    })
  })
  const fail = reason => {
    child.kill('SIGTERM')
    return exited.then(() => {
      const prefix =
        spawnError !== null ? `\nspawn error: ${spawnError.message}` : ''
      throw new Error(reason + prefix + `\n${output}`)
    })
  }
  const start = Date.now()
  let url = null
  while (
    Date.now() - start < 30_000 &&
    exitInfo === null &&
    spawnError === null
  ) {
    url = parsePreviewUrl(output)
    if (url !== null) break
    await wait(100)
  }
  if (url === null) {
    return fail(
      `vite preview did not report a URL${
        exitInfo !== null ? ` (exited code=${exitInfo.code})` : ''
      }`,
    )
  }
  try {
    await Promise.race([waitForUrl(url), exited])
  } catch {
    return fail(`vite preview never served ${url}`)
  }
  if (exitInfo !== null) {
    return fail(
      `vite preview exited before becoming ready (code=${exitInfo.code} signal=${exitInfo.signal})`,
    )
  }
  return { child, url }
}

const chromePath = () => {
  const fromEnv = process.env.CHROME_PATH
  if (fromEnv) return fromEnv
  return 'google-chrome'
}

const chromeNeedsNoSandbox = () =>
  process.env.CI === 'true' || process.env.CHROME_NO_SANDBOX === '1'

const chromeArgs = () => {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=/tmp/foldstryx-packed-smoke-chrome-${process.pid}-${Date.now()}`,
    '--remote-debugging-port=0',
  ]
  if (chromeNeedsNoSandbox()) {
    args.push('--no-sandbox', '--disable-setuid-sandbox')
  }
  return args
}

const withChrome = async (evaluate, previewUrl) => {
  const chrome = spawn(chromePath(), chromeArgs(), {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stderr = ''
  chrome.stderr.on('data', chunk => {
    stderr += chunk.toString()
  })
  const started = Date.now()
  let wsUrl
  while (Date.now() - started < 15_000) {
    const match = stderr.match(/ws:\/\/[^\s]+/)
    if (match) {
      wsUrl = match[0]
      break
    }
    await wait(50)
  }
  if (wsUrl === undefined) {
    chrome.kill('SIGTERM')
    throw new Error(`Could not find Chrome DevTools websocket.\n${stderr}`)
  }
  const version = await fetch(
    'http://127.0.0.1:' + new URL(wsUrl).port + '/json/version',
  )
  const info = await version.json()
  const browserWs = info.webSocketDebuggerUrl
  const ws = new WebSocket(browserWs)
  await once(ws, 'open')
  let nextId = 1
  const pending = new Map()
  ws.addEventListener('message', event => {
    const message = JSON.parse(String(event.data))
    if (message.id !== undefined && pending.has(message.id)) {
      const { resolvePending, rejectPending } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) rejectPending(new Error(JSON.stringify(message.error)))
      else resolvePending(message.result)
    }
  })
  const send = (method, params = {}) =>
    new Promise((resolvePending, rejectPending) => {
      const id = nextId++
      pending.set(id, { resolvePending, rejectPending })
      ws.send(JSON.stringify({ id, method, params }))
    })
  try {
    const { targetId } = await send('Target.createTarget', { url: previewUrl })
    const { sessionId } = await send('Target.attachToTarget', {
      targetId,
      flatten: true,
    })
    const sessionSend = (method, params = {}) =>
      new Promise((resolvePending, rejectPending) => {
        const id = nextId++
        pending.set(id, { resolvePending, rejectPending })
        ws.send(JSON.stringify({ id, method, params, sessionId }))
      })
    await sessionSend('Page.enable')
    await sessionSend('Runtime.enable')
    await sessionSend('Page.navigate', { url: previewUrl })
    const readyStarted = Date.now()
    while (Date.now() - readyStarted < 20_000) {
      const ready = await sessionSend('Runtime.evaluate', {
        expression:
          'document.readyState === "complete" && document.body.innerText.includes("Foldstryx documentation")',
        returnByValue: true,
      })
      if (ready.result?.value === true) break
      await wait(100)
    }
    const result = await sessionSend('Runtime.evaluate', {
      expression: `(${evaluate})()`,
      returnByValue: true,
      awaitPromise: true,
    })
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.text ?? JSON.stringify(result.exceptionDetails),
      )
    }
    if (result.result?.value === undefined || result.result.value === null) {
      throw new Error(`evaluate returned empty: ${JSON.stringify(result)}`)
    }
    return result.result.value
  } finally {
    ws.close()
    chrome.kill('SIGTERM')
  }
}

const pageProbe = `async () => {
  const failures = []
  const waitForText = (text, ms = 1500) =>
    new Promise(resolve => {
      const start = performance.now()
      const check = () => {
        if (
          (document.body.innerText ?? '').includes(text) ||
          performance.now() - start > ms
        ) {
          resolve()
        } else {
          requestAnimationFrame(check)
        }
      }
      check()
    })
  const h1 = document.querySelector('h1')
  if (h1 === null) failures.push('missing h1')
  const initialH1 = h1?.textContent ?? ''
  if (!initialH1.includes('Foldstryx documentation')) {
    failures.push('initial route is not the overview page: ' + initialH1)
  }
  const body = document.body
  const bodyFont = getComputedStyle(body).fontFamily
  if (!/atkinson hyperlegible next/i.test(bodyFont)) {
    failures.push('body font is not Atkinson Hyperlegible Next: ' + bodyFont)
  }
  await document.fonts.ready
  const atkLoaded = await document.fonts.load('16px "Atkinson Hyperlegible Next"')
  const mapleLoaded = await document.fonts.load('16px "Maple Mono NL NF"')
  if (atkLoaded.length === 0) {
    failures.push('Atkinson Hyperlegible Next did not load from package assets')
  }
  if (mapleLoaded.length === 0) {
    failures.push('Maple Mono NL NF did not load from package assets')
  }
  const sidebar =
    document.querySelector('aside') ??
    document.querySelector('[aria-label="Sidebar"]')
  if (sidebar === null) failures.push('missing sidebar landmark')
  const kitchenSinkButton = [...document.querySelectorAll('button')].find(
    button => (button.getAttribute('aria-label') ?? '') === 'Kitchen sink',
  )
  if (kitchenSinkButton === undefined) {
    failures.push('missing Kitchen sink nav item')
  } else {
    kitchenSinkButton.click()
    await waitForText('Foldstryx catalog')
    if (!(document.body.innerText ?? '').includes('Foldstryx catalog')) {
      failures.push('kitchen-sink route did not render after navigation')
    }
    if ((kitchenSinkButton.getAttribute('aria-current') ?? '') !== 'page') {
      failures.push(
        'Kitchen sink nav item is not marked active after navigation',
      )
    }
  }
  return { failures, bodyFont }
}`

const consumerPackageJson = tarballs => ({
  name: 'foldstryx-packed-consumer',
  private: true,
  version: '0.0.0',
  type: 'module',
  scripts: {
    build: 'vite build',
    typecheck: 'tsc --noEmit',
  },
  dependencies: {
    '@foldstryx/docs': `file:${tarballs['@foldstryx/docs']}`,
    '@foldstryx/foldkit': `file:${tarballs['@foldstryx/foldkit']}`,
    '@foldstryx/kitchen-sink': `file:${tarballs['@foldstryx/kitchen-sink']}`,
    '@foldstryx/styles': `file:${tarballs['@foldstryx/styles']}`,
    '@foldstryx/tokens': `file:${tarballs['@foldstryx/tokens']}`,
    '@foldkit/ui': '^0.113.0',
    '@stylexjs/stylex': '^0.19.0',
    effect: '4.0.0-beta.83',
    foldkit: '^0.113.0',
  },
  devDependencies: {
    '@foldkit/vite-plugin': '^0.9.0',
    '@stylexjs/unplugin': '^0.19.0',
    lightningcss: '^1.32.0',
    typescript: '^7.0.2',
    vite: '^8.0.16',
  },
  pnpm: {
    overrides: {
      '@foldstryx/docs': `file:${tarballs['@foldstryx/docs']}`,
      '@foldstryx/foldkit': `file:${tarballs['@foldstryx/foldkit']}`,
      '@foldstryx/kitchen-sink': `file:${tarballs['@foldstryx/kitchen-sink']}`,
      '@foldstryx/styles': `file:${tarballs['@foldstryx/styles']}`,
      '@foldstryx/tokens': `file:${tarballs['@foldstryx/tokens']}`,
    },
  },
})

const main = async () => {
  const work = await mkdtemp(join(tmpdir(), 'foldstryx-packed-'))
  const packDir = join(work, 'pack')
  const consumerDir = join(work, 'consumer')
  await mkdir(packDir, { recursive: true })
  await mkdir(consumerDir, { recursive: true })
  try {
    // 0. Build the external-consumer packages to dist/ so the packed artifacts
    //    carry built JavaScript + declarations. (pnpm pack does not run
    //    `prepack`.) Scope to the consumer packages only: a root `pnpm build`
    //    also rebuilds the oxlint-plugin, which races with the `lint` step's
    //    plugin build when this runs as part of the parallel pre-push gate.
    await run(
      'pnpm',
      [
        '-r',
        ...PACKAGES.flatMap(pkg => ['--filter', pkg]),
        '--if-present',
        'build',
      ],
      { cwd: root },
    )

    // 1. Pack every external-consumer package.
    const tarballs = {}
    for (const pkg of PACKAGES) {
      const out = await runCapture(
        'pnpm',
        ['--filter', pkg, 'pack', '--pack-destination', packDir],
        { cwd: root },
      )
      const match = out.match(/([^/\s]+\.tgz)/)
      if (match === null) {
        throw new Error(`Could not determine tarball name for ${pkg}:\n${out}`)
      }
      tarballs[pkg] = join(packDir, match[1])
    }

    // 2. Scaffold the consumer from the fixture.
    await cp(fixtureDir, consumerDir, { recursive: true })
    await writeFile(
      join(consumerDir, 'package.json'),
      JSON.stringify(consumerPackageJson(tarballs), null, 2) + '\n',
    )

    // 3. Install packed artifacts (no workspace links).
    await run('pnpm', ['install', '--no-frozen-lockfile'], { cwd: consumerDir })

    // 4. Typecheck + build the consumer against the packed artifacts.
    await run('pnpm', ['typecheck'], { cwd: consumerDir })
    await run('pnpm', ['build'], { cwd: consumerDir })
    const { cssFile, stylexRules } = await assertStylexCss(consumerDir)

    // 5. Preview and drive Chrome.
    const { child, url } = await startPreview(consumerDir)
    try {
      const result = await withChrome(pageProbe, url)
      if (result.failures.length > 0) {
        throw new Error(result.failures.join('\n'))
      }
      console.log(
        `check:packed OK (${url}) body=${result.bodyFont} tarballs=${Object.keys(tarballs).length} css=${cssFile} stylexRules=${stylexRules}`,
      )
    } finally {
      child.kill('SIGTERM')
    }
  } finally {
    await rm(work, { recursive: true, force: true })
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
