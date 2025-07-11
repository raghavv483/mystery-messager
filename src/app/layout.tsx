import type { Metadata } from 'next';
import { Inter } from 'next/font/google';


import './globals.css'
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import AuthProvider from '@/context/AuthProvider';
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
      <AuthProvider>
        <body className={inter.className}>
          <Navbar/>
          {children}
          <Toaster/>



          
        </body>
      </AuthProvider>
    </html>
  );
}
