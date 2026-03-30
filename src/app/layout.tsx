import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taxccount — Tax & Accounting Firm Management",
  description: "Manage clients, compliance projects, documents, and team workflows for your Canadian tax and accounting firm.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(function(reg) {
                console.log('[PWA] Service Worker registered:', reg.scope);
              }).catch(function(err) {
                console.log('[PWA] SW registration failed:', err);
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}

