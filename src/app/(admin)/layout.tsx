import { requireAdminAccess } from '@/lib/admin-server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminAccess()

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
