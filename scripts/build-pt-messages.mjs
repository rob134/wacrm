import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '..', 'messages');

const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf8'));
const existingPt = JSON.parse(readFileSync(join(messagesDir, 'pt.json'), 'utf8'));

/** @type {Record<string, string>} */
const T = {
  // LoginPage - keep existing
  'LoginPage.titleAccept': 'Entrar para aceitar',
  'LoginPage.titleWelcome': 'Bem-vindo de volta',
  'LoginPage.descAccept': 'Faça login e vamos levá-lo ao convite.',
  'LoginPage.descWelcome': 'Entre na sua conta',
  'LoginPage.emailLabel': 'E-mail',
  'LoginPage.emailPlaceholder': 'voce@exemplo.com',
  'LoginPage.passwordLabel': 'Senha',
  'LoginPage.forgotPassword': 'Esqueceu a senha?',
  'LoginPage.passwordPlaceholder': 'Digite sua senha',
  'LoginPage.signingIn': 'Entrando...',
  'LoginPage.signIn': 'Entrar',
  'LoginPage.noAccount': 'Não tem uma conta?',
  'LoginPage.createAccount': 'Criar conta',

  // Sidebar - keep existing
  'Sidebar.title': 'CRM Template para WhatsApp',
  'Sidebar.dashboard': 'Painel',
  'Sidebar.inbox': 'Caixa de entrada',
  'Sidebar.notifications': 'Notificações',
  'Sidebar.contacts': 'Contatos',
  'Sidebar.pipelines': 'Pipelines',
  'Sidebar.broadcasts': 'Envios',
  'Sidebar.automations': 'Automatizações',
  'Sidebar.flows': 'Fluxos',
  'Sidebar.aiAgents': 'Agentes de IA',
  'Sidebar.settings': 'Configurações',
  'Sidebar.beta': 'Beta',
  'Sidebar.unreadConversations': '{count} não lida {count, plural, =1 {conversa} other {conversas}}',
  'Sidebar.unreadNotifications': '{count} não lida {count, plural, =1 {notificação} other {notificações}}',
  'Sidebar.roleOwner': 'Proprietário',
  'Sidebar.roleAdmin': 'Administrador',
  'Sidebar.roleAgent': 'Agente',
  'Sidebar.roleViewer': 'Visualizador',
  'Sidebar.closeMenu': 'Fechar menu',
  'Sidebar.defaultUser': 'Usuário',
  'Sidebar.defaultAvatar': 'Avatar',
  'Sidebar.menuProfile': 'Perfil',
  'Sidebar.menuSettings': 'Configurações',
  'Sidebar.menuSignOut': 'Sair',

  // Header
  'Header.dashboard': 'Painel',
  'Header.inbox': 'Caixa de entrada',
  'Header.notifications': 'Notificações',
  'Header.contacts': 'Contatos',
  'Header.pipelines': 'Pipelines',
  'Header.broadcasts': 'Envios',
  'Header.automations': 'Automatizações',
  'Header.settings': 'Configurações',
  'Header.openMenu': 'Abrir menu',
  'Header.openAccountMenu': 'Abrir menu da conta',
  'Header.defaultUser': 'Usuário',
  'Header.defaultAvatar': 'Avatar',
  'Header.menuProfile': 'Perfil',
  'Header.menuSettings': 'Configurações',
  'Header.menuSignOut': 'Sair',

  // ModeToggle
  'ModeToggle.switchMode': 'Alternar para o modo {mode}',

  // AccountAccess
  'AccountAccess.unlinkedTitle': 'Este usuário não está vinculado a uma conta',
  'AccountAccess.unlinkedBody': 'Nada do que você alterar será salvo enquanto isso não for resolvido — o banco de dados rejeita toda gravação de um usuário sem conta ou função. Se você foi convidado para uma equipe, peça ao proprietário para reenviar o convite. Em uma instalação self-hosted, verifique se a migration de bootstrap da conta foi executada para este usuário.',
  'AccountAccess.errorTitle': 'Não foi possível carregar suas permissões',
  'AccountAccess.errorBody': 'Sua função na conta não foi carregada, então todas as ações são tratadas como somente leitura e as alterações não serão salvas. Verifique sua conexão e tente novamente.',
  'AccountAccess.retry': 'Tentar novamente',

  // Dashboard.page
  'Dashboard.page.title': 'Painel',
  'Dashboard.page.description': 'Análises em tempo real de conversas, contatos, negócios, envios e automatizações.',
  'Dashboard.page.activeConversations': 'Conversas ativas',
  'Dashboard.page.newContactsToday': 'Novos contatos hoje',
  'Dashboard.page.openDealsValue': 'Valor de negócios abertos',
  'Dashboard.page.messagesSentToday': 'Mensagens enviadas hoje',
  'Dashboard.page.newTodayVsYesterday': 'novos hoje vs ontem',
  'Dashboard.page.vsYesterday': 'vs ontem',
  'Dashboard.page.openDeals': '{count} {count, plural, =1 {negócio aberto} other {negócios abertos}}',
  'Dashboard.page.noChange': 'Sem alteração {suffix}',

  'Dashboard.quickActions.newContact': 'Novo contato',
  'Dashboard.quickActions.newDeal': 'Novo negócio',
  'Dashboard.quickActions.newBroadcast': 'Novo envio',
  'Dashboard.quickActions.newAutomation': 'Nova automatização',

  'Dashboard.activityFeed.title': 'Atividade recente',
  'Dashboard.activityFeed.viewAll': 'Ver tudo →',
  'Dashboard.activityFeed.noActivity': 'Nenhuma atividade ainda',
  'Dashboard.activityFeed.noActivityHint': 'Atividades de mensagens, negócios, envios e automatizações aparecerão aqui.',
  'Dashboard.activityFeed.showingOf': 'Mostrando {visible} de {totalLoaded}{plus}',
  'Dashboard.activityFeed.show': 'Mostrar',
  'Dashboard.activityFeed.timeS': 'há {sec}s',
  'Dashboard.activityFeed.timeM': 'há {min}min',
  'Dashboard.activityFeed.timeH': 'há {hr}h',
  'Dashboard.activityFeed.timeD': 'há {day}d',

  'Dashboard.conversationsChart.title': 'Conversas ao longo do tempo',
  'Dashboard.conversationsChart.description': 'Volume diário de mensagens por direção',
  'Dashboard.conversationsChart.days': '{count} dias',
  'Dashboard.conversationsChart.noActivity': 'Nenhuma atividade de mensagens neste período',
  'Dashboard.conversationsChart.noActivityHint': 'Envie ou receba mensagens para começar a preencher este gráfico.',
  'Dashboard.conversationsChart.incoming': 'Recebidas',
  'Dashboard.conversationsChart.outgoing': 'Enviadas',
  'Dashboard.conversationsChart.tooltipIncoming': '{count} recebidas',
  'Dashboard.conversationsChart.tooltipOutgoing': '{count} enviadas',
  'Dashboard.conversationsChart.ariaLabel': 'Conversas por dia',

  'Dashboard.pipelineDonut.title': 'Valor do pipeline',
  'Dashboard.pipelineDonut.description': 'Negócios abertos por etapa',
  'Dashboard.pipelineDonut.noOpenDeals': 'Nenhum negócio aberto ainda',
  'Dashboard.pipelineDonut.noOpenDealsHint': 'Crie negócios em Pipelines para ver a divisão por etapa aqui.',
  'Dashboard.pipelineDonut.dealCount': '{count} {count, plural, =1 {negócio} other {negócios}}',
  'Dashboard.pipelineDonut.total': 'Total',
  'Dashboard.pipelineDonut.ariaLabel': 'Valor do pipeline por etapa',

  'Dashboard.responseTimeChart.title': 'Tempo médio da primeira resposta',
  'Dashboard.responseTimeChart.description': 'Minutos para responder à primeira mensagem não respondida do cliente, por dia da semana',
  'Dashboard.responseTimeChart.target': 'meta {minutes}min',
  'Dashboard.responseTimeChart.thisWeek': 'Esta semana:',
  'Dashboard.responseTimeChart.lastWeek': 'Semana passada:',
  'Dashboard.responseTimeChart.noReplies': 'Nenhuma resposta registrada ainda',
  'Dashboard.responseTimeChart.noRepliesHint': 'Este gráfico será preenchido conforme você responder às mensagens dos clientes.',

  'Dashboard.emptyState.title': 'Dados insuficientes ainda',
};

// Load translations from external JSON file if present
const translationsPath = join(__dirname, 'pt-translations.json');
let externalT = {};
try {
  externalT = JSON.parse(readFileSync(translationsPath, 'utf8'));
} catch {
  // file may not exist yet
}

Object.assign(T, externalT);

function walk(enNode, ptNode, path = '') {
  for (const [key, val] of Object.entries(enNode)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (!ptNode[key]) ptNode[key] = {};
      walk(val, ptNode[key], fullPath);
    } else {
      ptNode[key] = T[fullPath] ?? val;
    }
  }
}

const pt = {};
walk(en, pt);

writeFileSync(join(messagesDir, 'pt.json'), JSON.stringify(pt, null, 2) + '\n', 'utf8');

function keys(o, p = '') {
  const k = [];
  for (const [key, val] of Object.entries(o)) {
    const path = p ? `${p}.${key}` : key;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      k.push(...keys(val, path));
    } else {
      k.push(path);
    }
  }
  return k;
}

const enK = keys(en).sort();
const ptK = keys(pt).sort();
const missing = enK.filter((k) => !ptK.includes(k));
const untranslated = enK.filter((k) => ptK.includes(k) && JSON.stringify(en) && T[k] === undefined);

function getVal(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

const stillEnglish = enK.filter((k) => {
  const enVal = getVal(en, k);
  const ptVal = getVal(pt, k);
  return enVal === ptVal && !T[k];
});

console.log('en keys:', enK.length);
console.log('pt keys:', ptK.length);
console.log('missing:', missing.length);
console.log('still English (need translation):', stillEnglish.length);
if (stillEnglish.length > 0 && stillEnglish.length <= 20) {
  console.log(stillEnglish);
}
