import { createCowSwapWidget } from '@cowprotocol/widget-lib'
import { getBaseWidgetParams } from './widgetConfig'

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

export function createMbtcSwapWidget(target, options = {}) {
  const container = resolveContainer(target)

  if (!container) {
    throw new Error('MBTC widget target container was not found.')
  }

  const width = normalizeDimension(options.width, '420px')
  const height = normalizeDimension(options.height, '640px')

  container.style.width = width
  container.style.maxWidth = '100%'
  container.style.height = height

  return createCowSwapWidget(container, {
    params: getBaseWidgetParams(width, height),
    provider: options.provider,
    listeners: options.listeners,
  })
}

if (typeof window !== 'undefined') {
  window.createMbtcSwapWidget = createMbtcSwapWidget
}
