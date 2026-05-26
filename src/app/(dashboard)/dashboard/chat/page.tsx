export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/[0.06]">
        <h1 className="text-2xl font-bold">Chat</h1>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
            <p className="text-white/60 text-sm">Interface de chat à implémenter</p>
          </div>
        </div>
      </div>
      <div className="p-6 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Écrivez votre message..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition"
          />
        </div>
      </div>
    </div>
  )
}
