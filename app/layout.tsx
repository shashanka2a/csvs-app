import type { Metadata } from 'next'
import { Poppins, Lora } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
})


const description =
  'The official portal of Chattada Sri Vaishnava Sangham — connecting community members, celebrating culture, and helping families find ideal life partners through trusted matrimony services.'

export const metadata: Metadata = {
  title: {
    default: 'CSVS – Chattada Sri Vaishnava Sangham',
    template: '%s | CSVS',
  },
  description,
  keywords: [
    'Chattada Sri Vaishnava Sangham',
    'CSVS',
    'matrimony',
    'community',
    'Telangana',
    'Hyderabad',
    'Sri Vaishnava',
  ],
  openGraph: {
    title: 'CSVS – Matrimony & Community',
    description,
    type: 'website',
    locale: 'en_IN',
    siteName: 'CSVS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CSVS – Matrimony & Community',
    description,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.variable} ${lora.variable} font-sans text-brand-dark antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
