import React, { useEffect, useRef, useState } from 'react'

const MBTC_TOKEN = {
  chainId: 1,
  address: '0x3898257dD2Cd6d2A3b6e3435f73568A725262b9B',
  name: 'MAGA Bitcoin',
  symbol: 'MBTC',
  decimals: 18,
}

const APP_CODE = 'mbtc-swap'
const PARTNER_FEE = {
  bps: 10,
  recipient: '0xE7E2775f96F282a97Ba0Dbc2Bc2948bA16a701D0',
}
const WIDGET_THEME = {
  baseTheme: 'dark',
  primary: '#00ff85',
  background: '#0a0f14',
  paper: '#101820',
  text: '#f5fff8',
  warning: '#ffb700',
  alert: '#b8ffb2',
  success: '#19ff64',
}

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
          params: {
            appCode: APP_CODE,
            width: `${widgetWidth}px`,
            height: '640px',
            chainId: 1,
            sell: { asset: 'USDC' },
            buy: { asset: MBTC_TOKEN.address },
            theme: WIDGET_THEME,
            partnerFee: PARTNER_FEE,
            customTokens: [MBTC_TOKEN],
          },
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
