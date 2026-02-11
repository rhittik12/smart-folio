'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth'

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Smartfolio</h1>
        </div>
        
        <nav className="px-4 space-y-1">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/portfolios">Portfolios</NavLink>
          <NavLink href="/builder">Builder</NavLink>
          <NavLink href="/analytics">Analytics</NavLink>
          <NavLink href="/billing">Billing</NavLink>
          <NavLink href="/settings">Settings</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Welcome, {user?.name || 'User'}</h2>
            <div className="flex items-center space-x-4">
              {/* User menu */}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
    >
      {children}
    </Link>
  )
}
