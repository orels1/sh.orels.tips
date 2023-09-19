import { Metadata } from 'next';
import './globals.css';
import './prism-duotone-dark.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'orels\' Tips',
  description: 'My personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that',
  metadataBase: new URL('https://tips.orels.sh'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tips.orels.sh',
    description: 'My personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that',
    title: 'orels\' Tips',
    siteName: 'orels\' Tips',
    images: ['https://tips.orels.sh/orels-tips-splash.png'],
  },
  twitter: {
    site: '@orels1_',
    card: 'summary_large_image',
    description: 'My personal dumping ground for all the random pieces of knowledge I find and discover myself. I have always collected things like this, but they have become too spread out over the years. This place is meant to be an organized spot for that',
    title: 'orels\' Tips',
    images: ['https://tips.orels.sh/orels-tips-splash.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="relative flex gap-8">
            <div className="flex flex-shrink-0 items-center">
              <a href="/">
                <img
                  className="block h-8 w-auto"
                  src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                  alt="orels' Tips"
                />
              </a>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold">
                orels&lsquo; Tips
              </h1>
            </div>
          </div>
        </div>
        <div className="md:p-6 p-2 w-full mx-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
