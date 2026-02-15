import './globals.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RFP Copilot SaaS',
  description: 'MVP for RFP response drafting workflows'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      primary: '#1d4fd7',
                      'primary-hover': '#163ba3',
                      'background-light': '#f6f6f8',
                      'background-dark': '#111521',
                      'surface-light': '#ffffff',
                      'surface-dark': '#1a202e'
                    },
                    fontFamily: { display: ['Inter', 'sans-serif'] },
                    borderRadius: { DEFAULT: '0.5rem', lg: '1rem', xl: '1.5rem', full: '9999px' }
                  }
                }
              }
            `
          }}
        />
      </head>
      <body className={`${inter.className} bg-background-light text-slate-800 antialiased`}>{children}</body>
    </html>
  );
}
