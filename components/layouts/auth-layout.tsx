'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold">Smartfolio</h1>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
        {' · '}
        <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
      </div>
    </div>
  )
}
