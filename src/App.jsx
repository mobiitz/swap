import React, { useEffect, useRef, useState } from 'react'
import { getBaseWidgetParams } from './widgetConfig'

const DEFAULT_WIDGET_WIDTH = 420
const MIN_WIDGET_WIDTH = 320
const DEFAULT_WIDGET_HEIGHT = 640

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

export default function App() {
  const containerRef = useRef(null)
  const [widgetWidth, setWidgetWidth] = useState(getWidgetWidth)
  const [widgetHeight, setWidgetHeight] = useState(getWidgetHeight)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleResize() {
      setWidgetWidth(getWidgetWidth())
      setWidgetHeight(getWidgetHeight())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return undefined

    let cancelled = false
    let widget

    setError('')
    containerRef.current.innerHTML = ''

    async function mountWidget() {
      try {
        const { createCowSwapWidget } = await import('@cowprotocol/widget-lib')

        if (cancelled || !containerRef.current) return

        const provider = getInjectedProvider()

        widget = createCowSwapWidget(containerRef.current, {
          params: getBaseWidgetParams(`${widgetWidth}px`, widgetHeight),
          provider,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load CoW widget.')
        }
      }
    }

    mountWidget()

    return () => {
      cancelled = true

      try {
        if (typeof widget?.destroy === 'function') {
          widget.destroy()
        }
      } catch {
        // Ignore cleanup errors from the third-party widget during remounts.
      } finally {
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }
      }
    }
  }, [widgetWidth])

  return (
    <main className="page-shell">
      <section className="widget-card">
        <h1>Swap into MBTC</h1>
        <p className="intro">
          Here you can use Paypal ($PYUSD), ETH, or your favorite token to buy MBTC! Just
          Connect your wallet and enter the amount!
        </p>
        {error ? <p className="error-message">{error}</p> : null}
        <div
          ref={containerRef}
          className="widget-host"
          style={{ width: `${widgetWidth}px`, height: widgetHeight }}
        />
      </section>
    </main>
  )
}
