import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vizinho PB - Empréstimo entre Vizinhos",
  description: "Conectando vizinhos para empréstimo de objetos e serviços locais em João Pessoa e região.",
  keywords: ["vizinho", "empréstimo", "comunidade", "João Pessoa", "Paraíba", "colaborativo"],
  authors: [{ name: "Vizinho PB" }],
  openGraph: {
    title: "Vizinho PB - Empréstimo entre Vizinhos",
    description: "Conectando vizinhos para empréstimo de objetos e serviços locais.",
    type: "website",
    locale: "pt_BR",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4f46e5",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground selection:bg-primary selection:text-white`}>
        {children}
      </body>
    </html>
  )
}
