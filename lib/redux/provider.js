"use client"

import { Provider } from 'react-redux'
import { store } from './store'
import { ToastProvider } from '@/lib/hooks/use-toast'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  )
}