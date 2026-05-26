'use client'
import { useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase'

interface Notification {
  id: string
  title: string
  body: string | null
  read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Non authentifié')
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        setNotifications(data ?? [])
      } catch (err) {
        toast.error('Erreur lors du chargement des notifications')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  async function markAsRead(id: string) {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
      if (error) throw error
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
      toast.success('Notification marquée comme lue')
    } catch (err) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  async function markAllAsRead() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
      if (error) throw error
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('Toutes les notifications ont été marquées comme lues')
    } catch (err) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-white/60">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.06] text-sm font-medium hover:bg-white/[0.08] transition"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60">Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition ${
                  notif.read
                    ? 'bg-white/[0.03] border-white/[0.04]'
                    : 'bg-white/[0.05] backdrop-blur-xl border-white/[0.06]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{notif.title}</h3>
                    <p className="text-sm text-white/60">{notif.body}</p>
                    <p className="text-xs text-white/40 mt-2">{new Date(notif.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.06] hover:bg-white/[0.08] transition"
                      aria-label="Marquer comme lu"
                    >
                      <Check className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                  {notif.read && <CheckCheck className="w-4 h-4 text-white/40 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
