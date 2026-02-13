import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'RFP Copilot SaaS',
  description: 'MVP for RFP response drafting workflows'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
