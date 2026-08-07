'use client'

import { useEffect, useState } from 'react'
import { Activity, Database, Brain, CreditCard } from 'lucide-react'

interface ServiceStatus {
  api: boolean
  db: boolean
  ai: boolean
  payments: boolean
}

export default function StatusPage() {
  const [status, setStatus] = useState<ServiceStatus>({
    api: false,
    db: false,
    ai: false,
    payments: false,
  })
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        setStatus({
          api: true,
          db: true,
          ai: true,
          payments: true,
        })
      } else {
        setStatus({
          api: false,
          db: false,
          ai: false,
          payments: false,
        })
      }
    } catch (error) {
      setStatus({
        api: false,
        db: false,
        ai: false,
        payments: false,
      })
    } finally {
      setLastCheck(new Date())
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => checkStatus())

    const interval = setInterval(() => {
      queueMicrotask(() => checkStatus())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const services = [
    {
      name: 'API',
      icon: Activity,
      status: status.api,
      description: 'Serveur principal',
    },
    {
      name: 'Base de données',
      icon: Database,
      status: status.db,
      description: 'PostgreSQL',
    },
    {
      name: 'IA',
      icon: Brain,
      status: status.ai,
      description: 'Claude & OpenAI',
    },
    {
      name: 'Paiements',
      icon: CreditCard,
      status: status.payments,
      description: 'Stripe',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F5FA]">
            Statut des services
          </h1>
          <p className="mt-2 text-[#F5F5FA]/60">
            Surveillance en temps réel de nos systèmes
          </p>
          {lastCheck && (
            <p className="mt-1 text-sm text-[#F5F5FA]/40">
              Dernière vérification : {lastCheck.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl h-32 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {services.map((service) => {
              const Icon = service.icon

              return (
                <div
                  key={service.name}
                  className="bg-white/5 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white/5">
                        <Icon className="w-6 h-6 text-[#F5F5FA]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#F5F5FA]">
                          {service.name}
                        </h3>
                        <p className="mt-1 text-sm text-[#F5F5FA]/60">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          service.status ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          service.status ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {service.status ? 'Opérationnel' : 'Dégradé'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
