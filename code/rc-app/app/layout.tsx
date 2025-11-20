import type { Metadata } from "next";
import { Inter, Open_Sans } from 'next/font/google';
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
});

const openSans = Open_Sans({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: "Repair Café",
  description: "Repair Café Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} ${openSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
