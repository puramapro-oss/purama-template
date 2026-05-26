export default function ReferralPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Parrainage</h1>
        <p className="text-white/60">Parrainez vos amis et gagnez des récompenses</p>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/60">Votre code de parrainage</h3>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value="CODE_PARRAIN"
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-xl text-sm font-semibold hover:opacity-90 transition">
              Copier
            </button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-white/60">Parrainages réussis</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/60">Gains générés</p>
            <p className="text-2xl font-bold">0,00 €</p>
          </div>
        </div>
      </div>
    </div>
  )
}
