import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToasterContext = createContext(null)

export function AppToasterProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((toast) => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())
    const t = {
      id,
      type: toast?.type || 'info',
      title: toast?.title || '',
      message: toast?.message || '',
      timeoutMs: typeof toast?.timeoutMs === 'number' ? toast.timeoutMs : 4000
    }
    setToasts((prev) => [...prev, t])
    if (t.timeoutMs > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id))
      }, t.timeoutMs)
    }
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const api = useMemo(() => ({ push, remove }), [push, remove])

  return (
    <ToasterContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'rounded-xl border bg-white p-4 shadow-soft',
              t.type === 'success' ? 'border-emerald-200' : '',
              t.type === 'error' ? 'border-rose-200' : '',
              t.type === 'warning' ? 'border-amber-200' : '',
              t.type === 'info' ? 'border-slate-200' : ''
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
                {t.message ? <div className="mt-0.5 text-sm text-slate-600">{t.message}</div> : null}
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  )
}

export function useToaster() {
  const ctx = useContext(ToasterContext)
  if (!ctx) throw new Error('useToaster must be used within AppToasterProvider')
  return ctx
}

