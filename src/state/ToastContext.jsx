import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const push = useCallback((toast) => {
    const id = nextId++;
    const item = {
      id,
      tone: toast.tone || 'info', // info | success | error
      title: toast.title || null,
      message: toast.message || '',
      duration: toast.duration ?? 4500,
      action: toast.action || null, // { label, onClick }
    };
    setToasts(prev => [...prev, item]);
    if (item.duration > 0) {
      timersRef.current[id] = setTimeout(() => dismiss(id), item.duration);
    }
    return id;
  }, [dismiss]);

  const value = {
    push, dismiss,
    info: (msg, opts) => push({ ...opts, tone: 'info', message: msg }),
    success: (msg, opts) => push({ ...opts, tone: 'success', message: msg }),
    error: (msg, opts) => push({ ...opts, tone: 'error', message: msg }),
    toasts,
  };

  return <ToastCtx.Provider value={value}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast outside provider');
  return ctx;
}
