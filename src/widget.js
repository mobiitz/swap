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

function getInjectedProvider() {
  if (typeof window === 'undefined') return undefined
  return window.ethereum
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

  const provider = options.provider ?? getInjectedProvider()
  const params = {
    ...getBaseWidgetParams(width, height),
    standaloneMode: !provider,
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
