/**
 * Computed-style smoke for the sidebar catalog.
 *
 * Builds `sidebar-demo`, then boots a fresh `vite preview` on
 * http://localhost:5173/. It does not reuse an already-running `pnpm dev`.
 * Requires `google-chrome` or `CHROME_PATH`. Pass `--negative=font` or
 * `--negative=concat` to assert the gate fails. GitHub Actions sets `CI=true`;
 * that (or `CHROME_NO_SANDBOX=1`) adds `--no-sandbox` because ubuntu-latest
 * cannot use Chromium's user-namespace sandbox.
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const demoDir = resolve(root, 'examples/sidebar-demo')
const DEMO_URL = 'http://localhost:5173/'
const negative = process.argv
  .find(arg => arg.startsWith('--negative='))
  ?.slice('--negative='.length)

const wait = ms => new Promise(resolveWait => setTimeout(resolveWait, ms))

const run = (command, args, options = {}) =>
  new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    })
    child.on('error', reject)
    child.on('exit', code => {
      if (code === 0) resolveRun()
      else reject(new Error(`${command} ${args.join(' ')} exited ${code}`))
    })
  })

const portFree = (port, host) =>
  new Promise(resolveFree => {
    const server = createServer()
    server.once('error', () => resolveFree(false))
    server.listen(port, host, () => {
      server.close(() => resolveFree(true))
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

const startPreview = async () => {
  if (!(await portFree(5173, '127.0.0.1')) || !(await portFree(5173, '::1'))) {
    throw new Error(
      'Port 5173 is already in use. Stop the other process before pnpm check:demo so the gate serves the just-built preview.',
    )
  }
  const child = spawn(
    'pnpm',
    [
      'exec',
      'vite',
      'preview',
      '--host',
      'localhost',
      '--port',
      '5173',
      '--strictPort',
    ],
    { cwd: demoDir, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let output = ''
  child.stdout.on('data', chunk => {
    output += chunk.toString()
  })
  child.stderr.on('data', chunk => {
    output += chunk.toString()
  })
  const exited = new Promise((_, reject) => {
    child.on('exit', code => {
      if (code !== 0 && code !== null) {
        reject(new Error(`vite preview exited ${code}\n${output}`))
      }
    })
  })
  await Promise.race([waitForUrl(DEMO_URL), exited])
  return child
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
    `--user-data-dir=/tmp/foldstryx-demo-smoke-chrome-${process.pid}-${Date.now()}`,
    '--remote-debugging-port=0',
  ]
  if (chromeNeedsNoSandbox()) {
    args.push('--no-sandbox', '--disable-setuid-sandbox')
  }
  return args
}

const withChrome = async (evaluate, mode) => {
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
    const { targetId } = await send('Target.createTarget', { url: DEMO_URL })
    const { sessionId } = await send('Target.attachToTarget', {
      targetId,
      flatten: true,
    })
    const sessionSend = (method, params = {}) =>
      new Promise((resolvePending, rejectPending) => {
        const id = nextId++
        pending.set(id, { resolvePending, rejectPending })
        ws.send(
          JSON.stringify({
            id,
            method,
            sessionId,
            params,
          }),
        )
      })
    await sessionSend('Page.enable')
    await sessionSend('Runtime.enable')
    await sessionSend('Page.navigate', { url: DEMO_URL })
    const readyStarted = Date.now()
    while (Date.now() - readyStarted < 20_000) {
      const ready = await sessionSend('Runtime.evaluate', {
        expression:
          'document.readyState === "complete" && document.body.innerText.includes("Stack and Row")',
        returnByValue: true,
      })
      if (ready.result?.value === true) break
      await wait(100)
    }
    const result = await sessionSend('Runtime.evaluate', {
      expression: `(${evaluate})(${JSON.stringify(mode ?? null)})`,
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

const pageProbe = `(negative) => {
  const failures = []
  const body = document.body
  const h1 = document.querySelector('h1')
  if (h1 === null) failures.push('missing h1')
  const bodyFont = getComputedStyle(body).fontFamily
  const headingFont = h1 === null ? '' : getComputedStyle(h1).fontFamily
  const tokenFont = getComputedStyle(body).getPropertyValue('--font-family-body')
  if (negative === 'font') {
    body.style.fontFamily = '"Times New Roman", Times, serif'
    if (h1) h1.style.fontFamily = '"Times New Roman", Times, serif'
  }
  const bodyAfter = getComputedStyle(body).fontFamily
  const headingAfter = h1 === null ? '' : getComputedStyle(h1).fontFamily
  const looksLikeTimes = value =>
    /times new roman/i.test(value) || /^\\s*times\\b/i.test(value)
  const looksLikeUi = value =>
    /segoe ui/i.test(value) ||
    /-apple-system/i.test(value) ||
    /blinkmacsystemfont/i.test(value)
  if (looksLikeTimes(bodyAfter)) failures.push('body font is Times')
  if (looksLikeTimes(headingAfter)) failures.push('h1 font is Times')
  if (
    !looksLikeUi(bodyAfter) &&
    !looksLikeUi(tokenFont) &&
    !/segoe ui|-apple-system|blinkmacsystemfont/i.test(bodyFont + headingFont)
  ) {
    failures.push('body/h1 font does not match token stack: ' + bodyAfter)
  }
  const buttons = [...document.querySelectorAll('button')]
  const labeled = buttons.filter(button =>
    /primary|secondary|ghost|danger|small|disabled/i.test(button.textContent ?? ''),
  )
  const sample = labeled.length >= 2 ? labeled : buttons
  if (sample.length < 2) failures.push('need at least two buttons')
  const fonts = new Set(sample.map(button => getComputedStyle(button).fontFamily))
  if (fonts.size > 1) failures.push('buttons do not share a UI font: ' + [...fonts].join(' | '))
  const disabled = buttons.find(button => button.disabled || button.getAttribute('aria-disabled') === 'true')
  const enabled = buttons.find(button => !button.disabled && button.getAttribute('aria-disabled') !== 'true')
  if (disabled === undefined || enabled === undefined) {
    failures.push('need enabled and disabled buttons')
  } else {
    const disabledOpacity = Number.parseFloat(getComputedStyle(disabled).opacity)
    if (!(disabledOpacity < 1)) {
      failures.push('disabled button opacity is not < 1: ' + disabledOpacity)
    }
  }
  const sidebar =
    document.querySelector('aside') ??
    document.querySelector('[aria-label="Sidebar"]')
  if (sidebar === null) failures.push('missing sidebar landmark')
  const stackHeading = [...document.querySelectorAll('div,p,h1,h2,h3')].find(
    node => (node.textContent ?? '').trim() === 'Stack and Row',
  )
  const stackCard =
    stackHeading?.parentElement ?? stackHeading ?? null
  if (stackCard === null) {
    failures.push('missing Stack and Row catalog')
  } else {
    const rows = [...stackCard.querySelectorAll('div')].filter(node => {
      const style = getComputedStyle(node)
      return style.display === 'flex' && node.children.length >= 2
    })
    if (rows.length === 0) {
      failures.push('catalog has no flex row/stack with two children')
    }
    if (negative === 'concat') {
      const first = rows[0]
      if (first) {
        first.replaceChildren(document.createTextNode('Row itemAnother item'))
      }
    }
    const concatenated = [...stackCard.querySelectorAll('div,p,span')].some(
      node => {
        const text =
          node.childNodes.length === 1 &&
          node.childNodes[0]?.nodeType === Node.TEXT_NODE
            ? (node.textContent ?? '')
            : ''
        return (
          text.includes('Row itemAnother item') ||
          text.includes('Stack itemAnother item')
        )
      },
    )
    if (concatenated) {
      failures.push('Row/Stack catalog concatenated item labels')
    }
  }
  return { failures, bodyFont: bodyAfter, headingFont: headingAfter }
}`

const main = async () => {
  const runProbe = async mode => {
    const result = await withChrome(pageProbe, mode)
    if (mode === 'font' || mode === 'concat') {
      if (result.failures.length === 0) {
        throw new Error(`expected negative=${mode} to fail`)
      }
      console.log(
        `check:demo negative=${mode} failed as expected: ${result.failures.join('; ')}`,
      )
      return result
    }
    if (result.failures.length > 0) {
      throw new Error(result.failures.join('\n'))
    }
    console.log(
      `check:demo OK (${DEMO_URL}) body=${result.bodyFont} h1=${result.headingFont}`,
    )
    return result
  }

  await run('pnpm', ['--filter', 'sidebar-demo', 'build'], { cwd: root })
  const preview = await startPreview()
  try {
    if (negative === 'font' || negative === 'concat') {
      await runProbe(negative)
      return
    }
    await runProbe(null)
    await runProbe('font')
    await runProbe('concat')
  } finally {
    preview?.kill('SIGTERM')
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
