import { cookies } from 'next/headers'

export interface User {
  id: string
  name: string
  email: string
  role: string
  sbu?: {
    id: string
    name: string
  }
}

export interface Session {
  user: User
  accessToken: string
  refreshToken: string
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('access_token')?.value
  
  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const user = await response.json()
    
    return {
      user,
      accessToken: token,
      refreshToken: cookieStore.get('refresh_token')?.value || '',
    }
  } catch (error) {
    return null
  }
}
