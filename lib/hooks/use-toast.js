"use client"

import { createContext, useContext, useEffect, useState } from "react"
import * as React from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Define action types
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

// State management
let listeners = []
let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    
    default:
      return state;
  }
}

// Toast function for global usage
function toast({ ...props }) {
  const id = genId()

  const update = (props) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })

  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

// Context API
const ToastContext = createContext({
  toasts: [],
  toast: () => null,
  dismiss: () => null,
})

export function ToastProvider({ children }) {
  const [state, setState] = useState(memoryState)

  useEffect(() => {
    listeners.push(setState)
    
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  // Auto-dismiss functionality
  useEffect(() => {
    const timeouts = new Map()
    
    state.toasts.forEach((toast) => {
      if (!toast.open || timeouts.has(toast.id)) return
      
      const timeout = setTimeout(() => {
        dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id })
        timeouts.delete(toast.id)
      }, toast.duration || TOAST_REMOVE_DELAY)
      
      timeouts.set(toast.id, timeout)
    })
    
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [state.toasts])

  const value = {
    toasts: state.toasts,
    toast: (props) => toast(props),
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
    remove: (toastId) => dispatch({ type: actionTypes.REMOVE_TOAST, toastId }),
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

// Hook
export function useToast() {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

// Also export the toast function for direct usage
export { toast }
