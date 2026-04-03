const RUNTIME_READY_EVENT = 'mbtc-widget-runtime-ready'
const RUNTIME_ERROR_EVENT = 'mbtc-widget-runtime-error'

let runtimePromise
let runtimeFactory

function getRuntimeUrl() {
  if (typeof document === 'undefined') {
    throw new Error('MBTC widget loader requires a browser environment.')
  }

  const currentScript = document.currentScript

  if (currentScript?.src) {
    return new URL('widget-runtime.js', currentScript.src).href
  }

  return new URL('widget-runtime.js', document.baseURI).href
}

function createDeferredHandler() {
  let widget = null
  let destroyed = false
  const queuedCalls = []

  function flush() {
    if (!widget || destroyed) return

    while (queuedCalls.length > 0) {
      const [method, args] = queuedCalls.shift()
      widget[method](...args)
    }
  }

  return {
    attach(nextWidget) {
      widget = nextWidget

      if (destroyed) {
        widget.destroy()
        widget = null
        return
      }

      flush()
    },
    api: {
      updateParams(...args) {
        if (widget) {
          widget.updateParams(...args)
          return
        }

        queuedCalls.push(['updateParams', args])
      },
      updateListeners(...args) {
        if (widget) {
          widget.updateListeners(...args)
          return
        }

        queuedCalls.push(['updateListeners', args])
      },
      updateProvider(...args) {
        if (widget) {
          widget.updateProvider(...args)
          return
        }

        queuedCalls.push(['updateProvider', args])
      },
      destroy() {
        destroyed = true

        if (widget) {
          widget.destroy()
          widget = null
        }
      },
    },
  }
}

function loadRuntime() {
  if (runtimeFactory) {
    return Promise.resolve(runtimeFactory)
  }

  if (!runtimePromise) {
    runtimePromise = import(/* @vite-ignore */ getRuntimeUrl())
      .then((mod) => {
        if (typeof mod.createMbtcSwapWidget !== 'function') {
          throw new Error('MBTC widget runtime did not export createMbtcSwapWidget.')
        }

        runtimeFactory = mod.createMbtcSwapWidget
        window.dispatchEvent(new CustomEvent(RUNTIME_READY_EVENT))
        return runtimeFactory
      })
      .catch((error) => {
        runtimePromise = undefined
        window.dispatchEvent(new CustomEvent(RUNTIME_ERROR_EVENT, { detail: error }))
        throw error
      })
  }

  return runtimePromise
}

export function createMbtcSwapWidget(...args) {
  if (runtimeFactory) {
    return runtimeFactory(...args)
  }

  const deferredHandler = createDeferredHandler()

  loadRuntime()
    .then((factory) => {
      deferredHandler.attach(factory(...args))
    })
    .catch((error) => {
      console.error('Failed to load MBTC widget runtime.', error)
    })

  return deferredHandler.api
}

if (typeof window !== 'undefined') {
  window.createMbtcSwapWidget = createMbtcSwapWidget
  window.MbtcSwapWidget = window.MbtcSwapWidget || {}
  window.MbtcSwapWidget.createMbtcSwapWidget = createMbtcSwapWidget
  loadRuntime().catch(() => {})
}
