'use client'

import Link from 'next/link'
import { Plus, FileText, DollarSign, Calendar, Users } from 'lucide-react'

interface QuickActionsProps {
  userRole: string
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const actions = [
    {
      name: 'New Rate Request',
      href: '/rate-requests/new',
      icon: Plus,
      roles: ['SALES'],
    },
    {
      name: 'View Predefined Rates',
      href: '/predefined-rates',
      icon: DollarSign,
      roles: ['SALES', 'PRICING'],
    },
    {
      name: 'Create Booking',
      href: '/booking-requests/new',
      icon: Calendar,
      roles: ['SALES'],
    },
    {
      name: 'Add Customer',
      href: '/customers/new',
      icon: Users,
      roles: ['SALES', 'CSE'],
    },
    {
      name: 'Create Itinerary',
      href: '/itineraries/new',
      icon: FileText,
      roles: ['SALES', 'CSE'],
    },
  ]

  const availableActions = actions.filter(action => 
    action.roles.includes(userRole)
  )

  return (
    <div className="card">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {availableActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <action.icon className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm font-medium text-gray-900">{action.name}</span>
          </Link>
        ))}
        {availableActions.length === 0 && (
          <p className="text-gray-500 text-sm">No quick actions available for your role</p>
        )}
      </div>
    </div>
  )
}