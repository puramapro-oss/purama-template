export default function WalletPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Portefeuille</h1>
        <p className="text-white/60">Gérez vos gains et retraits</p>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-white/60">Solde disponible</p>
          <p className="text-4xl font-bold">0,00 €</p>
        </div>
        <button className="w-full px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-xl text-sm font-semibold hover:opacity-90 transition">
          Retirer mes gains
        </button>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Historique des transactions</h2>
        <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center">
          <p className="text-white/60 text-sm">Aucune transaction pour le moment</p>
        </div>
      </div>
    </div>
  )
}
