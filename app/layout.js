// This is a Server Component
import ClientLayout from './ClientLayout';
import { metadata } from './metadata';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

// Export metadata for Next.js
export { metadata };