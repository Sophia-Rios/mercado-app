import type { Metadata, Viewport } from "next";
import { Sora, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";
import ToastProvider from "@/components/ToastProvider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Mercado.App — Domus",
  description: "Lista de compras, estoque e histórico de preço do mercado",
  manifest: "/manifest.json",
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

// sem isso, o celular renderiza a página como se fosse desktop (viewport
// de 980px) e só depois encolhe pra caber na tela — daí o efeito de "dá
// um zoom" ao abrir. Não trava o zoom do usuário (maximumScale de
// propósito ausente): isso quebraria acessibilidade pra quem precisa
// ampliar a tela.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link id="app-favicon" rel="icon" type="image/svg+xml" href="/favicon-light.svg" />
        <ThemeScript />
      </head>
      <body className={`${sora.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
