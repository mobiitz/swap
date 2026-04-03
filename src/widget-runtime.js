import { getBaseWidgetParams } from './widgetConfig'

const DEFAULT_WIDGET_WIDTH = 420
const MIN_WIDGET_WIDTH = 320
const DEFAULT_WIDGET_HEIGHT = 640

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

function getWidgetWidth() {
  if (typeof window === 'undefined') return DEFAULT_WIDGET_WIDTH
  return Math.min(DEFAULT_WIDGET_WIDTH, Math.max(MIN_WIDGET_WIDTH, window.innerWidth - 48))
}

function getWidgetHeight() {
  if (typeof window === 'undefined') return `${DEFAULT_WIDGET_HEIGHT}px`

  const isMobileViewport = window.innerWidth <= 640

  if (!isMobileViewport) return `${DEFAULT_WIDGET_HEIGHT}px`

  const viewportHeight = window.innerHeight || DEFAULT_WIDGET_HEIGHT
  const reservedPageSpace = 180
  const mobileHeight = Math.max(DEFAULT_WIDGET_HEIGHT, viewportHeight - reservedPageSpace)

  return `${mobileHeight}px`
}

function normalizeRequestedWidth(requestedWidth) {
  if (requestedWidth == null) return null

  if (typeof requestedWidth === 'number' && Number.isFinite(requestedWidth)) {
    return requestedWidth
  }

  if (typeof requestedWidth === 'string' && requestedWidth.trim()) {
    const parsed = parseInt(requestedWidth, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function normalizeRequestedHeight(requestedHeight) {
  if (requestedHeight == null) return null

  if (typeof requestedHeight === 'number' && Number.isFinite(requestedHeight)) {
    return `${requestedHeight}px`
  }

  if (typeof requestedHeight === 'string' && requestedHeight.trim()) {
    return requestedHeight
  }

  return null
}

function getResolvedWidth(requestedWidth) {
  const normalizedWidth = normalizeRequestedWidth(requestedWidth)

  if (normalizedWidth == null) {
    return getWidgetWidth()
  }

  return Math.min(normalizedWidth, getWidgetWidth())
}

function getResolvedHeight(requestedHeight) {
  return normalizeRequestedHeight(requestedHeight) ?? getWidgetHeight()
}

function createNoopWidget() {
  return {
    updateParams() {},
    updateListeners() {},
    updateProvider() {},
    destroy() {},
  }
}

export function createMbtcSwapWidget(target, options = {}) {
  const container = resolveContainer(target)

  if (!container) {
    throw new Error('MBTC widget target container was not found.')
  }

  let destroyed = false
  let widget = null
  let requestedWidth = options.width
  let requestedHeight = options.height
  let listeners = options.listeners
  let provider = options.provider ?? getInjectedProvider()
  let widgetWidth = getResolvedWidth(requestedWidth)
  let widgetHeight = getResolvedHeight(requestedHeight)
  let widgetModulePromise = null
  const autoResize = options.autoResize === true

  function applyContainerSize() {
    container.style.width = `${widgetWidth}px`
    container.style.maxWidth = '100%'
    container.style.height = widgetHeight
  }

  function destroyWidget() {
    try {
      if (typeof widget?.destroy === 'function') {
        widget.destroy()
      }
    } catch {
      // Ignore third-party cleanup issues during remounts.
    } finally {
      widget = null
      container.innerHTML = ''
    }
  }

  async function mountWidget() {
    if (destroyed) return

    applyContainerSize()
    container.innerHTML = ''

    widgetModulePromise ||= import('@cowprotocol/widget-lib')

    const { createCowSwapWidget } = await widgetModulePromise

    if (destroyed) return

    widget = createCowSwapWidget(container, {
      params: getBaseWidgetParams(`${widgetWidth}px`, widgetHeight),
      provider,
      listeners,
    })
  }

  function refreshMeasurements() {
    if (!autoResize) return

    const nextWidth = getResolvedWidth(requestedWidth)
    const nextHeight = getResolvedHeight(requestedHeight)
    const widthChanged = nextWidth !== widgetWidth

    widgetWidth = nextWidth
    widgetHeight = nextHeight
    applyContainerSize()

    if (widthChanged) {
      destroyWidget()
      mountWidget().catch((error) => {
        console.error('Failed to remount MBTC widget.', error)
      })
    }
  }

  function handleResize() {
    refreshMeasurements()
  }

  if (autoResize) {
    window.addEventListener('resize', handleResize)
  }

  mountWidget().catch((error) => {
    console.error('Failed to mount MBTC widget.', error)
  })

  return {
    updateParams(nextParams) {
      widget?.updateParams(nextParams)
    },
    updateListeners(nextListeners) {
      listeners = nextListeners
      widget?.updateListeners(nextListeners)
    },
    updateProvider(nextProvider) {
      provider = nextProvider
      widget?.updateProvider(nextProvider)
    },
    destroy() {
      destroyed = true
      if (autoResize) {
        window.removeEventListener('resize', handleResize)
      }
      destroyWidget()
    },
  }
}

if (typeof window !== 'undefined') {
  window.MbtcSwapWidget = window.MbtcSwapWidget || {}
  window.MbtcSwapWidget.createMbtcSwapWidget = createMbtcSwapWidget
}
