import { PlanType, SUPPORT_SLA } from '@/types/support'
import { Clock, Zap, Crown, Star } from 'lucide-react'
import Link from 'next/link'

interface PlanSupportInfoProps {
  plan: PlanType
  className?: string
}

export function PlanSupportInfo({ plan, className = '' }: PlanSupportInfoProps) {
  const sla = SUPPORT_SLA[plan]

  const planConfig: Record<PlanType, { color: string; icon: React.ReactNode; bg: string; upgrade?: boolean }> = {
    free: {
      color: 'text-gray-700',
      bg: 'bg-gray-50 border-gray-200',
      icon: <Clock className="w-4 h-4" />,
      upgrade: true,
    },
    pro: {
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      icon: <Zap className="w-4 h-4" />,
    },
    standard: {
      color: 'text-purple-700',
      bg: 'bg-purple-50 border-purple-200',
      icon: <Star className="w-4 h-4" />,
    },
    custom: {
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      icon: <Crown className="w-4 h-4" />,
    },
  }

  const config = planConfig[plan]

  return (
    <div className={`rounded-xl border-2 p-4 ${config.bg} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0 ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.color} mb-1`}>
            Your Support Level: {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {sla.label}
          </p>
          {config.upgrade && (
            <Link
              href="/pricing"
              className="text-sm text-[#0a66c2] hover:underline font-medium inline-flex items-center gap-1"
            >
              Upgrade for faster support
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
