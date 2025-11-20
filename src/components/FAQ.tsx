import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Como funciona o período de teste gratuito?',
    answer:
      'Você tem 7 dias para testar todos os recursos de qualquer plano gratuitamente, sem precisar cadastrar cartão de crédito. Ao final do período, você pode escolher assinar um plano pago ou continuar com a versão Gratuita.',
  },
  {
    question: 'Posso mudar de plano a qualquer momento?',
    answer:
      'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são processadas imediatamente e o valor é ajustado proporcionalmente na sua próxima cobrança.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos PayPal e todos os principais cartões de crédito (Visa, Mastercard, American Express). O PayPal oferece segurança adicional e facilidade no gerenciamento de suas assinaturas.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer:
      'Sim! Utilizamos criptografia de ponta a ponta, servidores em nuvem certificados e seguimos as melhores práticas de segurança. Somos totalmente compatíveis com LGPD e GDPR.',
  },
  {
    question: 'Posso integrar o LeadFlow com outras ferramentas?',
    answer:
      'Sim! Oferecemos integrações nativas com as principais ferramentas do mercado, incluindo WhatsApp, Evolution API, Facebook Ads, Google Ads, N8N e muito mais. Também disponibilizamos API REST e HTTP endpoint para integrações customizadas.',
  },
  {
    question: 'Como funciona o suporte ao cliente?',
    answer:
      'Oferecemos suporte por email e WhatsApp. O tempo de resposta varia de acordo com o plano: plano Gratuito tem suporte em até 48h, Business em até 4h, e Enterprise conta com suporte prioritário 24/7.',
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer:
      'Sim, você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais. Você continuará tendo acesso aos recursos do plano até o final do período pago.',
  },
  {
    question: 'Existe limite de leads ou mensagens?',
    answer:
      'O plano Gratuito permite até 100 leads/mês, 10 mensagens WhatsApp e 5 envios em massa. O plano Business oferece até 500 leads, 200 mensagens e 50 envios em massa. O plano Enterprise não tem limitações.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full mb-4">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">Perguntas Frequentes</span>
          </div>
          <h2 className="text-gray-900 mb-4">Tire suas dúvidas</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Não encontrou a resposta que procura? Entre em contato conosco pelo
            chat ou email.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-900 pr-8">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-600 bg-gray-50">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl max-w-2xl mx-auto">
          <h3 className="text-gray-900 mb-2">Ainda tem dúvidas?</h3>
          <p className="text-gray-600 mb-6">
            Nossa equipe está pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Falar com Suporte
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Ver Central de Ajuda
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}