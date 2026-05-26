'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user) throw authErr
        setEmail(user.email ?? '')
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        if (profile?.full_name) setFullName(profile.full_name)
      } catch (err) {
        toast.error('Erreur lors du chargement du profil')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  async function handleSave() {
    if (!fullName.trim()) {
      toast.error('Le nom ne peut pas être vide')
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { error: dbErr } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
      if (dbErr) throw dbErr
      await supabase.auth.updateUser({ data: { full_name: fullName } })
      toast.success('Profil mis à jour')
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  const initials = getInitials(email)

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-sm text-white/60">Avatar</p>
              <p className="text-xs text-white/40">Les initiales sont générées automatiquement</p>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 cursor-not-allowed"
            />
            <p className="text-xs text-white/40 mt-1">L'email ne peut pas être modifié</p>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Votre nom"
              className="w-full h-11 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] focus:border-[#7C3AED] transition outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
