import React, { useEffect, useRef, useState } from 'react'
import { getBaseWidgetParams } from './widgetConfig'

function getWidgetWidth() {
  if (typeof window === 'undefined') return 420
  return Math.min(420, Math.max(320, window.innerWidth - 48))
}

export default function App() {
  const containerRef = useRef(null)
  const [widgetWidth, setWidgetWidth] = useState(getWidgetWidth)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleResize() {
      setWidgetWidth(getWidgetWidth())
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

        widget = createCowSwapWidget(containerRef.current, {
          params: getBaseWidgetParams(`${widgetWidth}px`, '640px'),
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
          style={{ width: `${widgetWidth}px`, height: '640px' }}
        />
      </section>
    </main>
  )
}
