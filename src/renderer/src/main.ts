import './styles.css';

type View = 'login' | 'dashboard';
let currentView: View = 'login';
const menuItems = [['▦', 'Visão geral'], ['▣', 'Vendas'], ['◫', 'Produtos'], ['♙', 'Clientes'], ['▤', 'Relatórios']];
const metric = (icon: string, label: string, value: string, detail: string) => `<article class="metric"><i>${icon}</i><p>${label}</p><strong>${value}</strong><small>${detail}</small></article>`;

function login(): string {
  return `<main class="login-page"><section class="brand-panel"><div class="brand-mark">PM</div><p class="eyebrow">GESTÃO INTELIGENTE</p><h1>PDV Master</h1><p>Seu negócio em uma visão simples, rápida e segura.</p></section><section class="login-card"><button class="theme-toggle" aria-label="Alternar tema">◐</button><p class="eyebrow">BEM-VINDO</p><h2>Entrar na plataforma</h2><form id="login-form"><label>E-mail<input required type="email" placeholder="voce@empresa.com" /></label><label>Senha<input required type="password" placeholder="••••••••" /></label><div class="form-row"><label class="remember"><input type="checkbox" /> Lembrar acesso</label><a href="#">Esqueci minha senha</a></div><button class="primary" type="submit">Entrar <span>→</span></button></form><p class="footer">Ambiente seguro · PDV Master</p></section></main>`;
}
function dashboard(): string {
  return `<main class="shell"><aside class="sidebar" id="sidebar"><div class="side-brand"><div class="brand-mark small">PM</div>PDV Master<button id="close-menu">×</button></div><nav>${menuItems.map(([icon, name], index) => `<button class="nav ${index === 0 ? 'active' : ''}"><span>${icon}</span>${name}</button>`).join('')}</nav><button class="profile"><b>AD</b><span><strong>Administrador</strong><small>Conta principal</small></span></button></aside><section class="dashboard"><header><button id="open-menu" class="hamburger">☰</button><div><p class="eyebrow">PAINEL PRINCIPAL</p><h1>Olá, Administrador <span>✦</span></h1><p>Acompanhe os principais indicadores do seu negócio.</p></div><div class="actions"><span id="db-status">● Banco conectado</span><button class="theme-toggle">◐</button></div></header><section class="metrics">${metric('↗', 'Vendas hoje', 'R$ 0,00', 'Aguardando movimentações')}${metric('◫', 'Produtos cadastrados', '0', 'Cadastre seu primeiro produto')}${metric('♙', 'Clientes ativos', '0', 'Base ainda não iniciada')}</section><section class="content"><article class="panel chart"><div class="panel-title"><div><h2>Vendas da semana</h2><p>Visão consolidada dos últimos 7 dias</p></div><button>Semana ▾</button></div><div class="empty"><span>⌁</span><strong>Sem dados para exibir</strong><p>As vendas aparecerão aqui quando o negócio começar a operar.</p></div></article><article class="panel quick"><h2>Ações rápidas</h2><p>Atalhos para começar.</p><button>＋ Nova venda</button><button>＋ Cadastrar produto</button><button>＋ Cadastrar cliente</button></article></section></section></main>`;
}
function bind(): void {
  document.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach((element) => element.addEventListener('click', () => document.body.classList.toggle('dark')));
  document.querySelector<HTMLFormElement>('#login-form')?.addEventListener('submit', (event) => { event.preventDefault(); currentView = 'dashboard'; render(); window.pdvMaster.getAppStatus().then((response) => { if (!response.data?.databaseReady) document.querySelector('#db-status')!.textContent = '● Banco indisponível'; }); });
  document.querySelector('#open-menu')?.addEventListener('click', () => document.querySelector('#sidebar')?.classList.add('open'));
  document.querySelector('#close-menu')?.addEventListener('click', () => document.querySelector('#sidebar')?.classList.remove('open'));
}
function render(): void { const root = document.querySelector('#app'); if (!root) return; root.innerHTML = currentView === 'login' ? login() : dashboard(); bind(); }
render();
