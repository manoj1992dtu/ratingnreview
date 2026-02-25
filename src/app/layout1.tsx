import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import AppWrapper from '../App'
import '../styles/globals.css'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Modern Company Review Platform',
  description: 'Anonymous reviews from real employees to help you make informed career decisions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {/* <AppWrapper> */}
          {children}
        {/* </AppWrapper> */}
        {/* </Header> */}
      </body>
    </html>
  )
}