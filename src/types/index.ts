// Tipos TypeScript para o CRM

export interface Lead {
  id?: string;
  nome: string;
  email?: string;
  telefone?: string;
  interesse?: string;
  origem?: string;
  status?: string;
  data?: string;
  createdAt?: string;
  agente_atual?: string;
  observacao?: string;
  observacoes?: string;
  marcado_email?: boolean;
}

export interface PlanoLimites {
  plano: 'gratuito' | 'basico' | 'profissional' | 'enterprise' | 'teste';
  envios_usados: number;
  envios_limite: number;
  importacoes_usadas: number;
  importacoes_limite: number;
  leads_usados: number;
  leads_limite: number;
  data_reset?: string;
}

export interface WebhookConfig {
  httpEndpoint?: string;
  metaPixelId?: string;
  googleAnalyticsId?: string;
  cadastrar?: string;
  editar?: string;
  deletar?: string;
  listar?: string;
  enviarMsg?: string;
  enviarMassa?: string;
}

export interface PeriodoTeste {
  email: string;
  dataCriacao: string;
  dataExpiracao: string;
  plano: string;
  status: string;
  diasTeste: number;
  diasRestantes?: number;
  expirado?: boolean;
}

export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  senha?: string;
}

export interface Sessao {
  usuario: string;
  userId?: string;
  timestamp: number;
}