import { createCowSwapWidget } from '@cowprotocol/widget-lib'
import { getBaseWidgetParams } from './widgetConfig'

const DEFAULT_WIDTH = 420
const MIN_WIDTH = 320
const DEFAULT_HEIGHT = 640

function resolveContainer(target) {
  if (typeof target === 'string') {
    return document.querySelector(target)
  }

  return target
}

function getInjectedProvider() {
  if (typeof window === 'undefined') return undefined
  return window.ethereum
}

function watchInjectedProvider(onProvider, timeoutMs = 5000) {
  if (typeof window === 'undefined') return () => {}

  let stopped = false
  let pollId
  let timeoutId

  function stop() {
    if (stopped) return
    stopped = true
    window.removeEventListener('ethereum#initialized', tryEmitProvider)
    window.removeEventListener('eip6963:announceProvider', tryEmitProvider)
    if (pollId) window.clearInterval(pollId)
    if (timeoutId) window.clearTimeout(timeoutId)
  }

  function tryEmitProvider() {
    const provider = getInjectedProvider()
    if (!provider) return
    onProvider(provider)
    stop()
  }

  window.addEventListener('ethereum#initialized', tryEmitProvider, { once: true })
  window.addEventListener('eip6963:announceProvider', tryEmitProvider)

  pollId = window.setInterval(tryEmitProvider, 250)
  timeoutId = window.setTimeout(stop, timeoutMs)

  tryEmitProvider()

  return stop
}

function shouldUseInjectedProvider(options) {
  if (options.useInjectedProvider === true) return true
  if (options.useInjectedProvider === false) return false

  // Mirror the working root app: if an injected wallet provider is available,
  // hand it to the CoW widget instead of forcing a standalone wallet flow.
  return Boolean(getInjectedProvider())
}

function resolveStandaloneMode(options) {
  if (typeof options.standaloneMode === 'boolean') {
    return options.standaloneMode
  }

  return true
}

function getAvailableHeight() {
  if (typeof window === 'undefined') return DEFAULT_HEIGHT

  const isMobileViewport = window.innerWidth <= 640

  if (!isMobileViewport) return DEFAULT_HEIGHT

  const viewportHeight = window.innerHeight || DEFAULT_HEIGHT
  const verticalPadding = 24

  return Math.max(DEFAULT_HEIGHT, viewportHeight - verticalPadding)
}

function getAvailableWidth(container) {
  if (typeof window === 'undefined') return DEFAULT_WIDTH

  const viewportWidth = window.innerWidth || DEFAULT_WIDTH
  const horizontalPadding = 32
  const viewportSafeWidth = Math.max(
    MIN_WIDTH,
    Math.min(DEFAULT_WIDTH, viewportWidth - horizontalPadding),
  )
  const containerWidth = container?.clientWidth || 0

  if (!containerWidth) return viewportSafeWidth

  return Math.max(MIN_WIDTH, Math.min(containerWidth, viewportSafeWidth, DEFAULT_WIDTH))
}

function resolveWidth(container, requestedWidth) {
  if (requestedWidth == null) {
    return `${getAvailableWidth(container)}px`
  }

  if (typeof requestedWidth === 'number' && Number.isFinite(requestedWidth)) {
    return `${Math.min(requestedWidth, getAvailableWidth(container))}px`
  }

  if (typeof requestedWidth === 'string' && requestedWidth.trim()) {
    const parsed = parseInt(requestedWidth, 10)
    if (Number.isFinite(parsed)) {
      return `${Math.min(parsed, getAvailableWidth(container))}px`
    }

    return requestedWidth
  }

  return `${getAvailableWidth(container)}px`
}

function resolveHeight(requestedHeight) {
  const availableHeight = getAvailableHeight()

  if (requestedHeight == null) {
    return `${availableHeight}px`
  }

  if (typeof requestedHeight === 'number' && Number.isFinite(requestedHeight)) {
    return `${Math.max(requestedHeight, availableHeight)}px`
  }

  if (typeof requestedHeight === 'string' && requestedHeight.trim()) {
    const parsed = parseInt(requestedHeight, 10)
    if (Number.isFinite(parsed)) {
      return `${Math.max(parsed, availableHeight)}px`
    }

    return requestedHeight
  }

  return `${availableHeight}px`
}

export function createMbtcSwapWidget(target, options = {}) {
  const container = resolveContainer(target)

  if (!container) {
    throw new Error('MBTC widget target container was not found.')
  }

  const width = resolveWidth(container, options.width)
  const height = resolveHeight(options.height)

  container.style.width = width
  container.style.maxWidth = '100%'
  container.style.height = height

  const provider =
    options.provider ?? (shouldUseInjectedProvider(options) ? getInjectedProvider() : undefined)
  const params = {
    ...getBaseWidgetParams(width, height),
    maxHeight: height,
    standaloneMode: resolveStandaloneMode(options),
  }

  let mountedWidget = null
  let destroyed = false
  let pendingParams = null
  let pendingListeners = options.listeners
  let pendingProvider = provider

  const stopWatchingProvider =
    options.provider || provider || options.useInjectedProvider === false
      ? () => {}
      : watchInjectedProvider((nextProvider) => {
          pendingProvider = nextProvider
          mountedWidget?.updateProvider(nextProvider)
        })

  function mount() {
    if (destroyed || mountedWidget) return

    mountedWidget = createCowSwapWidget(container, {
      params: pendingParams ?? params,
      provider: pendingProvider,
      listeners: pendingListeners,
    })
  }

  window.setTimeout(mount, 0)

  return {
    updateParams(nextParams) {
      pendingParams = nextParams
      mountedWidget?.updateParams(nextParams)
    },
    updateListeners(nextListeners) {
      pendingListeners = nextListeners
      mountedWidget?.updateListeners(nextListeners)
    },
    updateProvider(nextProvider) {
      pendingProvider = nextProvider
      mountedWidget?.updateProvider(nextProvider)
    },
    destroy() {
      destroyed = true
      stopWatchingProvider()
      mountedWidget?.destroy()
      mountedWidget = null
    },
  }
}

if (typeof window !== 'undefined') {
  window.createMbtcSwapWidget = createMbtcSwapWidget
}
