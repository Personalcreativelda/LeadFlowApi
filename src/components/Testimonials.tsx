import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Ana Carolina Silva',
    role: 'Diretora de Vendas',
    company: 'TechSolutions',
    image: 'professional woman',
    rating: 5,
    content:
      'LeadFlow CRM transformou completamente nossa operação comercial. Aumentamos nossa taxa de conversão em 40% nos primeiros 3 meses. A interface é intuitiva e os relatórios são extremamente úteis.',
  },
  {
    name: 'Ricardo Mendes',
    role: 'CEO',
    company: 'StartHub',
    image: 'business man',
    rating: 5,
    content:
      'Testamos diversos CRMs antes de encontrar o LeadFlow. A diferença está na simplicidade e na automação inteligente. Nossa equipe adotou a ferramenta em menos de uma semana.',
  },
  {
    name: 'Juliana Costa',
    role: 'Gerente de Marketing',
    company: 'Growth Agency',
    image: 'professional woman smiling',
    rating: 5,
    content:
      'O que mais me impressiona é a qualidade do suporte e as atualizações constantes. Cada novo recurso realmente resolve problemas reais que enfrentamos no dia a dia.',
  },
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">Depoimentos</span>
          </div>
          <h2 className="text-gray-900 mb-4">
            Mais de 10.000 clientes satisfeitos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Veja o que nossos clientes estão dizendo sobre o LeadFlow CRM
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="w-16 h-16 text-blue-600" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-blue-600 mb-2">10.000+</p>
            <p className="text-sm text-gray-600">Clientes Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-blue-600 mb-2">4.9/5</p>
            <p className="text-sm text-gray-600">Avaliação Média</p>
          </div>
          <div className="text-center">
            <p className="text-blue-600 mb-2">98%</p>
            <p className="text-sm text-gray-600">Satisfação</p>
          </div>
          <div className="text-center">
            <p className="text-blue-600 mb-2">24/7</p>
            <p className="text-sm text-gray-600">Suporte</p>
          </div>
        </div>
      </div>
    </section>
  );
}
