export const STATUS_MAP = {
  'Aguardando': {
    color: '#3B82F6', bg: '#EFF6FF', icon: '⏳',
    label: 'Aguardando Confirmação', eta: 'Em breve', passo: 0,
  },
  'Confirmado': {
    color: '#6366F1', bg: '#EEF2FF', icon: '✅',
    label: 'Pedido Confirmado', eta: 'Preparando', passo: 1,
  },
  'Em Preparação': {
    color: '#F59E0B', bg: '#FFFBEB', icon: '👨‍🍳',
    label: 'Em Preparação', eta: '~15-25 min', passo: 2,
  },
  'Em Trânsito': {
    color: '#8B5CF6', bg: '#F5F3FF', icon: '🛵',
    label: 'Saiu para Entrega', eta: '~5-15 min', passo: 3,
  },
  'Entregue': {
    color: '#10B981', bg: '#ECFDF5', icon: '✅',
    label: 'Pedido Entregue', eta: 'Finalizado', passo: 4,
  },
  'Cancelado': {
    color: '#EF4444', bg: '#FEF2F2', icon: '❌',
    label: 'Pedido Cancelado', eta: '—', passo: -1,
  },
};

export const STATUS_PASSOS = [
  { key: 'Aguardando', label: 'Pedido Recebido', hint: 'Aguardando confirmação do restaurante' },
  { key: 'Confirmado', label: 'Confirmado', hint: 'Restaurante confirmou seu pedido' },
  { key: 'Em Preparação', label: 'Preparando', hint: 'Seu pedido está sendo preparado' },
  { key: 'Em Trânsito', label: 'Saiu para Entrega', hint: 'Entregador a caminho' },
  { key: 'Entregue', label: 'Entregue', hint: 'Pedido entregue com sucesso' },
];