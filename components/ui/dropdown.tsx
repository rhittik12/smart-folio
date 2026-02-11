'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'

export interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

export function Dropdown({ trigger, children, align = 'left' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-10 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export interface DropdownItemProps {
  onClick?: () => void
  children: ReactNode
  variant?: 'default' | 'danger'
}

export function DropdownItem({ onClick, children, variant = 'default' }: DropdownItemProps) {
  const variants = {
    default: 'text-gray-700 hover:bg-gray-100',
    danger: 'text-red-600 hover:bg-red-50',
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-2 text-sm
        ${variants[variant]}
      `}
    >
      {children}
    </button>
  )
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-gray-200" />
}
