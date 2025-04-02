"use client"

import { useState, useEffect, createContext, useContext } from "react"

const ToastContext = createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((toasts) => toasts.slice(1))
      }, toasts[0].duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [toasts])

  const toast = ({ title, description, variant, duration = 5000 }) => {
    const id = Math.random().toString(36).slice(2, 11)
    setToasts((toasts) => [...toasts, { id, title, description, variant, duration }])
    return id
  }

  const dismiss = (id) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }

  const value = {
    toasts,
    toast,
    dismiss,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}