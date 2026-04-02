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

function normalizeDimension(value, fallback) {
  if (typeof value === 'number') return `${value}px`
  if (typeof value === 'string' && value.trim()) return value
  return fallback
}

function getNumericHeight(height, fallback = DEFAULT_HEIGHT) {
  if (typeof height === 'number' && Number.isFinite(height)) return height

  if (typeof height === 'string') {
    const parsed = parseInt(height, 10)
    if (Number.isFinite(parsed)) return parsed
  }

  return fallback
}

function getInjectedProvider() {
  if (typeof window === 'undefined') return undefined
  return window.ethereum
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

export function createMbtcSwapWidget(target, options = {}) {
  const container = resolveContainer(target)

  if (!container) {
    throw new Error('MBTC widget target container was not found.')
  }

  const width = resolveWidth(container, options.width)
  const height = normalizeDimension(options.height, `${DEFAULT_HEIGHT}px`)

  container.style.width = width
  container.style.maxWidth = '100%'
  container.style.height = height

  const provider =
    options.provider ?? (options.useInjectedProvider === true ? getInjectedProvider() : undefined)
  const params = {
    ...getBaseWidgetParams(width, height),
    maxHeight: getNumericHeight(height),
    standaloneMode: provider ? false : true,
  }

  return createCowSwapWidget(container, {
    params,
    provider,
    listeners: options.listeners,
  })
}

if (typeof window !== 'undefined') {
  window.createMbtcSwapWidget = createMbtcSwapWidget
}
