import type { Metadata } from "next";
import "./globals.css";
import { sofia, urbanist } from './fonts';
import { Toaster } from 'react-hot-toast';

// Métadonnées de l'application
export const metadata: Metadata = {
  title: "Chicken Nation",
  description: "Champion dans poulet",
};

 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${sofia.variable} ${urbanist.variable}`} suppressHydrationWarning>
      <head>
      </head>
      <body className="font-sofia" suppressHydrationWarning>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }} />
        {children}
      </body>
    </html>
  );
}
