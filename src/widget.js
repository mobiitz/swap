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
    options.provider ?? (options.useInjectedProvider === true ? getInjectedProvider() : undefined)
  const params = {
    ...getBaseWidgetParams(width, height),
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
