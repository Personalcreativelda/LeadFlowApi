import { Button } from './ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white"
    >
      {/* Subtle Grid Pattern Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-100"></div>
      
      {/* Gradient Orbs for modern look */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-full px-4 py-2 mb-8 hover:shadow-md transition-shadow">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700 font-medium">Confiado por mais de 10.000 empresas</span>
          </div>

          {/* Main Headline - Extra Large */}
          <h1 className="text-gray-900 mb-6 leading-[1.1] font-bold">
            <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
              Transforme
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              seus leads
            </span>
            <span className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight">
              em clientes
            </span>
          </h1>

          {/* Subtitle - Large and Clear */}
          <p className="text-gray-600 mb-10 text-xl sm:text-2xl leading-relaxed max-w-3xl mx-auto font-normal">
            Automatize seu funil de vendas, acompanhe cada interação e converta mais leads com
            o poder da inteligência artificial.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-6 font-semibold"
            >
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-lg px-8 py-6 font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Assistir Demo
            </Button>
          </div>

          {/* Stats - Modern Style */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl sm:text-4xl text-gray-900 mb-1 font-bold">10k+</div>
              <div className="text-gray-600 font-medium">Clientes</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl text-gray-900 mb-1 font-bold">95%</div>
              <div className="text-gray-600 font-medium">Satisfação</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl text-gray-900 mb-1 font-bold">24/7</div>
              <div className="text-gray-600 font-medium">Suporte</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}