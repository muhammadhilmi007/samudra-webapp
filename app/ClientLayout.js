'use client';

import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';
import { AuthProvider } from '@/lib/hooks/useAuth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({ children }) {
  return (
    <div className={inter.className}>
      <Provider store={store}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </Provider>
    </div>
  );
}