'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentRequests } from '@/components/dashboard/RecentRequests'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const { data: statusCards } = useQuery({
    queryKey: ['reports', 'status-cards'],
    queryFn: async () => {
      const response = await api.get('/reports/status-cards')
      return response.data
    },
  })

  const { data: recentRequests } = useQuery({
    queryKey: ['rate-requests', 'recent'],
    queryFn: async () => {
      const response = await api.get('/rates/requests?mine=true')
      return response.data.slice(0, 5)
    },
  })

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        <StatsCards data={statusCards} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentRequests data={recentRequests} />
          <QuickActions userRole={user.role} />
        </div>
      </div>
    </DashboardLayout>
  )
}