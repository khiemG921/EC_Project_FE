import type { Metadata } from "next";
import Script from 'next/script';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: "CleanNow",
  description: "Ứng dụng giúp việc nhà theo giờ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>

        <script src="https://cdn.tailwindcss.com"></script>

        {/* Google Font: Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />

        {/* Font Awesome Icons */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        <style>{`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}</style>

        {/* Goong CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css"
        />

        {/* Goong JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-white" suppressHydrationWarning={true}>
        <ClientProviders>
        {children}
        </ClientProviders>
      </body>
    </html>
  );
}

