import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ReduxProvider } from "@/components/redux-provider"

export const metadata: Metadata = {
  title: "Winnerspin",
  description: "Winnerspin is a platform to turn your savings into Amazing Gifts",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="overscroll-none h-full">
      <body
        className={`h-full overflow-y-auto overscroll-none bg-white-50 dark:bg-gray-900 font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
