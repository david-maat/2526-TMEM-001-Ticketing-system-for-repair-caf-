import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
