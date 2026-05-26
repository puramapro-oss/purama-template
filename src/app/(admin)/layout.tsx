import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="bg-black border-b border-[#FFD700]/20 px-6 py-4">
        <h1 className="text-sm font-semibold text-[#FFD700]">
          Admin — God Mode
        </h1>
      </div>
      {children}
    </div>
  )
}
