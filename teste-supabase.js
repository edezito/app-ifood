const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zusjxzywbcaezqqmoyfq.supabase.co';
const supabaseKey = 'sb_publishable_nhTVhyXWdVFiiJAH3S07Gw_R-JfYPBF';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarPedidos() {
  // ID do cliente que fez os pedidos
  const clienteId = 'ee1d51a0-fe57-45d9-9262-e94b204fa8de';
  
  console.log('🔍 Buscando pedidos do cliente:', clienteId);
  
  // Busca sem ordem específica primeiro
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('cliente_id', clienteId);
  
  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log(`✅ Encontrados ${data?.length || 0} pedidos`);
    if (data && data.length > 0) {
      console.log('Primeiro pedido:', JSON.stringify(data[0], null, 2));
      console.log('\nColunas disponíveis:', Object.keys(data[0]));
    }
  }
}

verificarPedidos();