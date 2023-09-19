import './globals.css';
import './prism-duotone-dark.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
