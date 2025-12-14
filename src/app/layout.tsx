import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vizinho PB - Empréstimo entre Vizinhos",
  description: "Conectando vizinhos para empréstimo de objetos e serviços locais em João Pessoa e região.",
  keywords: ["vizinho", "empréstimo", "comunidade", "João Pessoa", "Paraíba", "colaborativo"],
  authors: [{ name: "Vizinho PB" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vizinho PB",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Vizinho PB - Empréstimo entre Vizinhos",
    description: "Conectando vizinhos para empréstimo de objetos e serviços locais.",
    type: "website",
    locale: "pt_BR",
    siteName: "Vizinho PB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vizinho PB - Empréstimo entre Vizinhos",
    description: "Conectando vizinhos para empréstimo de objetos e serviços locais.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f46e5" },
    { media: "(prefers-color-scheme: dark)", color: "#1e1b4b" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground selection:bg-primary selection:text-white`}>
        {children}

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('[App] SW registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('[App] SW registration failed:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}
