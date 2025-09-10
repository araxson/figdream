import { Header } from './header'
import { getCurrentUser } from '@/lib/api/dal/auth'

export async function HeaderProvider() {
  const user = await getCurrentUser()
  
  const userData = user ? {
    id: user.id,
    email: user.email || '',
    role: user.role as 'customer' | 'staff' | 'admin' | 'super_admin',
    name: user.email?.split('@')[0],
    avatar: undefined
  } : undefined

  return <Header user={userData} />
}