import { useState, useEffect } from 'react';
import { Check, Crown, Zap, Rocket } from 'lucide-react';
import { Button } from '../ui/button';
import { plansApi } from '../../utils/api';

interface PlanPageProps {
  user: any;
  onUpgrade: () => void;
}

export default function PlanPage({ user, onUpgrade }: PlanPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const currentPlan = user?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      color: 'from-gray-500 to-gray-600',
      price: { monthly: 0, annual: 0 },
      features: [
        '100 leads',
        '50 mensagens WhatsApp/mês',
        '5 envios em massa/mês',
        'Suporte básico',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      icon: Rocket,
      color: 'from-blue-500 to-blue-600',
      price: { monthly: 20, annual: 100 },
      features: [
        '1.000 leads',
        '500 mensagens WhatsApp/mês',
        '50 envios em massa/mês',
        'Suporte prioritário',
        'Integrações avançadas',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      price: { monthly: 59, annual: 200 },
      features: [
        'Leads ilimitados',
        'Mensagens WhatsApp ilimitadas',
        'Envios em massa ilimitados',
        'Suporte VIP 24/7',
        'API dedicada',
        'Gestor de conta',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Planos e Preços
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Escolha o plano ideal para o seu negócio
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'annual'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Anual
            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
              Economize
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const price = plan.price[billingPeriod];

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-900 rounded-xl border-2 transition-all ${
                isCurrentPlan
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Plano Atual
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /{billingPeriod === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <Button
                  onClick={onUpgrade}
                  disabled={isCurrentPlan}
                  className={`w-full ${
                    isCurrentPlan
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCurrentPlan ? 'Plano Atual' : 'Fazer Upgrade'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Plan Info */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Plano Atual:</strong> {plans.find(p => p.id === currentPlan)?.name || 'Free'}
        </p>
      </div>
    </div>
  );
}