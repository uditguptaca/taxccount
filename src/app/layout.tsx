import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.abidebylaw.com'),
  title: { default: 'AbideByLaw: find the compliances that apply to you, with due dates and official sources', template: '%s | AbideByLaw' },
  description: 'Pick your country, state and kind of business, answer a few questions, and see every filing that applies to you: tax and non-tax, with its due date, the penalty for missing it and the government page it comes from. Free to check. Track everything in one place.',
  openGraph: { type: 'website', siteName: 'AbideByLaw', url: 'https://www.abidebylaw.com', title: 'Find the compliances that apply to you', description: 'Every filing that applies to you, with its due date, penalty and official government source. Canada, United States, India, UAE.' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#6366f1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
