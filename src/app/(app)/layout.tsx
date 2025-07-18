import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Navbar from '@/components/Navbar';
// import { Toaster } from '@/components/ui/toaster';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mystery Messager',
  description: 'Real feedback from real people.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" >

        <body className={inter.className}>
          
          {children}
        </body>

    </html>
  );
}
