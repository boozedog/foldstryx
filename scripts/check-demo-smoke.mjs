/**
 * Computed-style smoke for the sidebar catalog.
 *
 * Builds `sidebar-demo`, then boots a fresh `vite preview` on an ephemeral
 * port (`--port 0`) and drives Chrome against the reported URL. It never
 * reuses an already-running `pnpm dev` or a stale preview, so it works even
 * when the developer has a dev server on 5173. Requires `google-chrome` or
 * `CHROME_PATH`. Pass `--negative=font` or `--negative=concat` to assert the
 * gate fails. GitHub Actions sets `CI=true`; that (or `CHROME_NO_SANDBOX=1`)
 * adds `--no-sandbox` because ubuntu-latest cannot use Chromium's
 * user-namespace sandbox.
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const demoDir = resolve(root, 'examples/sidebar-demo')
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

// Strip ANSI escape sequences (SGR etc.). Vite colorizes its banner even when
// stdout is piped — e.g. in GitHub Actions it emits
// `\x1b[1mLocal\x1b[22m:` and `http://localhost:\x1b[1m34503\x1b[22m/` with
// the escape sequences interleaved inside the label and the port number. The
// log viewer renders those codes invisibly, but they break literal matching,
// so readiness detection must normalize the output first. A pipe chunk can
// also end mid-escape (`\x1b[22` with no final byte); a second pass strips
// that trailing incomplete sequence, otherwise the leftover digits would glue
// onto the port (e.g. `localhost:330692/`).
const stripAnsi = output =>
  output
    .replace(
      /[\x1b\x9b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      '',
    )
    .replace(/[\x1b\x9b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?$/g, '')

// Vite prints "➜  Local:   http://localhost:PORT/" once the preview server is
// listening. Parse that URL so the probe targets the exact ephemeral port.
const parsePreviewUrl = output => {
  const plain = stripAnsi(output)
  const local = plain.match(/Local:\s*(https?:\/\/[^\s]+)/)
  const candidate = local?.[1] ?? plain.match(/https?:\/\/localhost:\d+\//)?.[0]
  // Only a complete `http://localhost:<port>/` counts as ready, and the URL
  // must already carry its trailing slash: Vite writes the port and slash in
  // one write, so a buffer ending mid-digits yields a slash-less candidate
  // that is rejected, while glued digits from a split escape sequence fail
  // the shape check. The poll loop keeps the first non-null parse, so
  // accepting anything looser burns the whole waitForUrl budget.
  if (
    candidate === undefined ||
    !/^https?:\/\/localhost:\d+\/$/.test(candidate)
  ) {
    return null
  }
  return candidate
}

// Start a fresh `vite preview` on an ephemeral port (--port 0), wait for Vite
// to report the bound URL, and confirm it serves the built demo. The child is
// killed on any startup failure so nothing leaks.
const startPreview = async () => {
  const child = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--host', 'localhost', '--port', '0'],
    { cwd: demoDir, stdio: ['ignore', 'pipe', 'pipe'] },
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
  // Kill the child (if it is still alive) and await its exit so no preview
  // leaks on any startup failure.
  const fail = reason => {
    child.kill('SIGTERM')
    return exited.then(() => {
      const prefix =
        spawnError !== null ? `\nspawn error: ${spawnError.message}` : ''
      throw new Error(reason + prefix + `\n${output}`)
    })
  }
  // Wait for Vite to print the ephemeral URL.
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
    `--user-data-dir=/tmp/foldstryx-demo-smoke-chrome-${process.pid}-${Date.now()}`,
    '--remote-debugging-port=0',
  ]
  if (chromeNeedsNoSandbox()) {
    args.push('--no-sandbox', '--disable-setuid-sandbox')
  }
  return args
}

const withChrome = async (evaluate, mode, previewUrl) => {
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

const pageProbe = `async (negative) => {
  const failures = []
  const waitFor = (selector, ms = 1000) =>
    new Promise(resolve => {
      const start = performance.now()
      const check = () => {
        if (
          document.querySelector(selector) !== null ||
          performance.now() - start > ms
        ) {
          resolve()
        } else {
          requestAnimationFrame(check)
        }
      }
      check()
    })
  const waitForGone = (selector, ms = 1000) =>
    new Promise(resolve => {
      const start = performance.now()
      const check = () => {
        if (
          document.querySelector(selector) === null ||
          performance.now() - start > ms
        ) {
          resolve()
        } else {
          requestAnimationFrame(check)
        }
      }
      check()
    })
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
  const body = document.body
  const h1 = document.querySelector('h1')
  if (h1 === null) failures.push('missing h1')
  const initialH1 = h1?.textContent ?? ''
  if (!initialH1.includes('Foldstryx documentation')) {
    failures.push('initial route is not the overview page: ' + initialH1)
  }
  const tokenFont = getComputedStyle(body).getPropertyValue('--font-family-body')
  if (negative === 'font') {
    body.style.fontFamily = '"Times New Roman", Times, serif'
    if (h1) h1.style.fontFamily = '"Times New Roman", Times, serif'
  }
  const bodyAfter = getComputedStyle(body).fontFamily
  const headingAfter = h1 === null ? '' : getComputedStyle(h1).fontFamily
  const hasAtkinson = value => /atkinson hyperlegible next/i.test(value)
  if (!hasAtkinson(bodyAfter)) {
    failures.push('body font is not Atkinson Hyperlegible Next: ' + bodyAfter)
  }
  if (!hasAtkinson(headingAfter)) {
    failures.push('h1 font is not Atkinson Hyperlegible Next: ' + headingAfter)
  }
  if (!hasAtkinson(tokenFont)) {
    failures.push(
      '--font-family-body token is not Atkinson Hyperlegible Next: ' +
        tokenFont,
    )
  }
  // Fallback stacks must be preserved (issue #21: robust fallbacks).
  const headingToken = getComputedStyle(body).getPropertyValue(
    '--font-family-heading',
  )
  const codeToken = getComputedStyle(body).getPropertyValue(
    '--font-family-code',
  )
  if (!/-apple-system/i.test(tokenFont) || !/sans-serif/i.test(tokenFont)) {
    failures.push('--font-family-body lost its system fallback: ' + tokenFont)
  }
  if (
    !/-apple-system/i.test(headingToken) ||
    !/sans-serif/i.test(headingToken)
  ) {
    failures.push(
      '--font-family-heading lost its system fallback: ' + headingToken,
    )
  }
  if (!/"SF Mono"/i.test(codeToken) || !/monospace/i.test(codeToken)) {
    failures.push(
      '--font-family-code lost its monospace fallback: ' + codeToken,
    )
  }
  // Verify the intended fonts actually loaded (not just the CSS stack).
  await document.fonts.ready
  const atkLoaded = await document.fonts.load('16px "Atkinson Hyperlegible Next"')
  const mapleLoaded = await document.fonts.load('16px "Maple Mono NL NF"')
  if (atkLoaded.length === 0) {
    failures.push('Atkinson Hyperlegible Next did not load')
  }
  if (mapleLoaded.length === 0) {
    failures.push('Maple Mono NL NF did not load')
  }
  const sidebar =
    document.querySelector('aside') ??
    document.querySelector('[aria-label="Sidebar"]')
  if (sidebar === null) failures.push('missing sidebar landmark')
  const brandText = sidebar?.textContent ?? ''
  if (!/foldstryx/i.test(brandText)) {
    failures.push('missing foldstryx brand in the sidebar')
  }
  // Fill-mode scroll contract (issue #19): bounded viewport shell, independent
  // nav/main scroll, sticky rail and inset header.
  const docEl = document.documentElement
  if (docEl.scrollHeight > docEl.clientHeight) {
    failures.push(
      'document-level vertical scroll detected: ' +
        docEl.scrollHeight +
        ' > ' +
        docEl.clientHeight,
    )
  }
  const mainEl = document.querySelector('main')
  if (mainEl === null) {
    failures.push('missing main element')
  } else {
    const scrollCandidates = [...mainEl.querySelectorAll('div')].filter(node => {
      const style = getComputedStyle(node)
      return (
        style.overflowY === 'auto' &&
        node.scrollHeight > node.clientHeight
      )
    })
    if (scrollCandidates.length === 0) {
      failures.push('main region has no internal vertical scroll container')
    } else {
      const scrollEl = scrollCandidates[0]
      const header = mainEl.querySelector('header')
      if (header === null) {
        failures.push('missing inset header')
      } else {
        const headerTopBefore = header.getBoundingClientRect().top
        scrollEl.scrollTop = scrollEl.scrollHeight
        const headerTopAfter = header.getBoundingClientRect().top
        if (Math.abs(headerTopAfter - headerTopBefore) > 1) {
          failures.push('inset header moved while main content scrolled')
        }
        scrollEl.scrollTop = 0
      }
      if (sidebar !== null) {
        const railLeftBefore = sidebar.getBoundingClientRect().left
        const railTopBefore = sidebar.getBoundingClientRect().top
        scrollEl.scrollTop = scrollEl.scrollHeight
        const railLeftAfter = sidebar.getBoundingClientRect().left
        const railTopAfter = sidebar.getBoundingClientRect().top
        if (
          Math.abs(railLeftAfter - railLeftBefore) > 1 ||
          Math.abs(railTopAfter - railTopBefore) > 1
        ) {
          failures.push('left rail moved while main content scrolled')
        }
        scrollEl.scrollTop = 0
      }
    }
  }
  // Rail nav scroll contract: the nav region scrolls independently inside the
  // rail while the brand stays pinned and the rail container stays put.
  const navEl = document.querySelector('[role="navigation"]')
  if (navEl === null) {
    failures.push('missing navigation landmark')
  } else {
    const navStyle = getComputedStyle(navEl)
    if (navStyle.overflowY !== 'auto') {
      failures.push(
        'rail nav is not a vertical scroll container: ' + navStyle.overflowY,
      )
    } else if (navEl.scrollHeight <= navEl.clientHeight) {
      failures.push(
        'rail nav does not overflow its rail: ' +
          navEl.scrollHeight +
          ' <= ' +
          navEl.clientHeight,
      )
    } else {
      const brand = sidebar === null ? null : sidebar.querySelector('div')
      const brandTopBefore = brand?.getBoundingClientRect().top ?? null
      const navTopBefore = navEl.getBoundingClientRect().top
      navEl.scrollTop = navEl.scrollHeight
      const brandTopAfter = brand?.getBoundingClientRect().top ?? null
      const navTopAfter = navEl.getBoundingClientRect().top
      if (brandTopBefore !== null && Math.abs(brandTopAfter - brandTopBefore) > 1) {
        failures.push('rail brand moved while nav scrolled')
      }
      if (Math.abs(navTopAfter - navTopBefore) > 1) {
        failures.push('rail nav container moved while nav scrolled')
      }
      navEl.scrollTop = 0
    }
  }
  // Route transition: navigate from the overview page to the kitchen-sink
  // route and assert the shell re-renders the kitchen-sink catalog.
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
  // Code/monospace sample must use the intended code family.
  const monoEl = [...document.querySelectorAll('span,p,div,code,pre')].find(
    node => /maple mono nl nf/i.test(getComputedStyle(node).fontFamily),
  )
  if (monoEl === undefined) {
    failures.push('no element uses Maple Mono NL NF')
  }
  // Form controls must inherit the interface family.
  const formControl = document.querySelector('input, select, textarea')
  if (
    formControl !== null &&
    !hasAtkinson(getComputedStyle(formControl).fontFamily)
  ) {
    failures.push(
      'form control font is not Atkinson Hyperlegible Next: ' +
        getComputedStyle(formControl).fontFamily,
    )
  }
  const buttons = [...document.querySelectorAll('button')]
  const labeled = buttons.filter(button =>
    /primary|secondary|ghost|danger|small|disabled/i.test(button.textContent ?? ''),
  )
  const sample = labeled.length >= 2 ? labeled : buttons
  if (sample.length < 2) failures.push('need at least two buttons')
  const fonts = new Set(sample.map(button => getComputedStyle(button).fontFamily))
  if (fonts.size > 1) failures.push('buttons do not share a UI font: ' + [...fonts].join(' | '))
  if (sample.some(button => !hasAtkinson(getComputedStyle(button).fontFamily))) {
    failures.push('buttons do not use Atkinson Hyperlegible Next')
  }
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
  // Phase B catalog sections and key semantic roles (issue #15).
  const sectionHeadings = [
    'Typography',
    'Stack and Row',
    'Buttons',
    'Card',
    'Form',
    'Dense controls',
    'Badges',
    'Alerts',
    'Feedback',
    'Tooltip',
    'Data display',
  ]
  const bodyText = document.body.innerText ?? ''
  for (const heading of sectionHeadings) {
    if (!bodyText.includes(heading)) {
      failures.push('missing catalog section heading: ' + heading)
    }
  }
  if (document.querySelector('[role="alert"]') === null) {
    failures.push('missing role=alert banner')
  }
  if (document.querySelector('[role="switch"]') === null) {
    failures.push('missing role=switch control')
  }
  if (document.querySelector('[role="tooltip"]') === null) {
    failures.push('missing role=tooltip panel')
  }
  if (document.querySelector('table') === null) {
    failures.push('missing table element')
  }
  if (document.querySelector('[aria-label="Pagination"]') === null) {
    failures.push('missing aria-label=Pagination pagination')
  }
  // Phase D catalog sections and high-value roles (issue #17).
  const phaseDSections = ['Dialog', 'Tabs', 'Dropdown menu', 'Toast']
  for (const heading of phaseDSections) {
    if (!bodyText.includes(heading)) {
      failures.push('missing catalog section heading: ' + heading)
    }
  }
  if (document.querySelector('[role="tablist"]') === null) {
    failures.push('missing role=tablist tabs')
  }
  if (document.querySelector('[role="tab"]') === null) {
    failures.push('missing role=tab tab')
  }
  // Phase E catalog sections and high-value selectors (issue #18).
  const phaseESections = ['Page', 'Grid', 'Avatar']
  for (const heading of phaseESections) {
    if (!bodyText.includes(heading)) {
      failures.push('missing catalog section heading: ' + heading)
    }
  }
  if (!bodyText.includes('Page title')) {
    failures.push('missing Page title')
  }
  const gridEl = [...document.querySelectorAll('div')].find(
    node => getComputedStyle(node).display === 'grid',
  )
  if (gridEl === undefined) {
    failures.push('missing display:grid element')
  }
  if (document.querySelector('[role="img"]') === null) {
    failures.push('missing role=img avatar')
  }
  if (document.querySelector('img') === null) {
    failures.push('missing avatar image')
  }
  const openDialog = [...document.querySelectorAll('button')].find(
    button => (button.textContent ?? '').trim() === 'Open dialog',
  )
  if (openDialog === undefined) {
    failures.push('missing Open dialog button')
  } else {
    openDialog.click()
    await waitFor('dialog[open]')
    if (document.querySelector('dialog[open]') === null) {
      failures.push('missing open dialog element')
    }
    const closeDialog = [...document.querySelectorAll('button')].find(
      button => (button.textContent ?? '').trim() === 'Cancel',
    )
    if (closeDialog !== undefined) {
      closeDialog.click()
      await waitForGone('dialog[open]')
    }
  }
  const menuTrigger = [...document.querySelectorAll('button')].find(
    button => (button.textContent ?? '').trim() === 'Actions',
  )
  if (menuTrigger === undefined) {
    failures.push('missing Actions menu trigger')
  } else {
    menuTrigger.click()
    await waitFor('[role="menu"]')
    if (document.querySelector('[role="menu"]') === null) {
      failures.push('missing role=menu after opening')
    }
  }
  const infoButton = [...document.querySelectorAll('button')].find(
    button => (button.textContent ?? '').trim() === 'Info',
  )
  if (infoButton === undefined) {
    failures.push('missing Info toast trigger')
  } else {
    infoButton.click()
    await waitForText('A toast was shown.')
    if (!(document.body.innerText ?? '').includes('A toast was shown.')) {
      failures.push('missing toast after triggering Info')
    }
    if (document.querySelector('[role="status"]') === null) {
      failures.push('missing toast role=status after triggering Info')
    }
  }
  return { failures, bodyFont: bodyAfter, headingFont: headingAfter }
}`

const main = async () => {
  const runProbe = async (previewUrl, mode) => {
    const result = await withChrome(pageProbe, mode, previewUrl)
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
      `check:demo OK (${previewUrl}) body=${result.bodyFont} h1=${result.headingFont}`,
    )
    return result
  }

  await run('pnpm', ['--filter', 'sidebar-demo', 'build'], { cwd: root })
  const { child, url } = await startPreview()
  try {
    if (negative === 'font' || negative === 'concat') {
      await runProbe(url, negative)
      return
    }
    await runProbe(url, null)
    await runProbe(url, 'font')
    await runProbe(url, 'concat')
  } finally {
    child.kill('SIGTERM')
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
