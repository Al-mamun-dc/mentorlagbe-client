import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toast"
import "./globals.css"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"



const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
    >
      <body>
        <ThemeProvider>
          <Navbar />
          <main className="pt-24">
            
            {children}
            
            </main>
            <Toaster/>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
