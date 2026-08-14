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
