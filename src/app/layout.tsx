import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthProvider from '@/components/AuthProvider'

const outfit = Outfit({ subsets: ['latin'] })

// Use your actual brand name
export const metadata: Metadata = {
  // Title template with your brand
  title: {
    template: '%s | RatingNReviews',
    default: 'RatingNReviews - Real Workplace Insights from Anonymous Employees',
  },

  // Site description with brand name
  description: 'Uncover the truth about your next employer with RatingNReviews. Access verified anonymous employee ratings, salary insights, and culture reviews to make your best career move.',

  // Application name
  applicationName: 'RatingNReviews',

  // Authors
  authors: [{ name: 'RatingNReviews Team' }],

  // Keywords
  keywords: [
    'RatingNReviews',
    'company reviews',
    'employee reviews',
    'workplace ratings',
    'career advice',
    'job search',
    'anonymous reviews',
  ],

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  // Open Graph with brand
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RatingNReviews',
    title: 'RatingNReviews - Real Workplace Insights',
    description: 'Uncover the truth about your next employer with verified anonymous employee reviews.',
    images: [
      {
        url: 'https://ratingnreviews.com/og-default.png',
        width: 1200,
        height: 630,
        alt: 'RatingNReviews - Anonymous Employee Reviews',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'RatingNReviews - Real Workplace Insights',
    description: 'Verified anonymous employee reviews and culture insights.',
    images: ['https://ratingnreviews.com/og-default.png'],
  },

  // Metadata base URL
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ratingnreviews.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}