import './styles.css';
import './auth.css';

type View = 'login' | 'dashboard' | 'change-password';
interface AuthenticatedUser { id: number; companyId: number; name: string; email: string; mustChangePassword: boolean; }
let currentView: View = 'login';
let user: AuthenticatedUser | null = null;

function loginTemplate(): string {
  return `<main class="login-page"><section class="brand-panel"><div class="brand-mark">PM</div><p class="eyebrow">GESTÃO INTELIGENTE</p><h1>PDV Master</h1><p>Seu negócio em uma visão simples, rápida e segura.</p></section><section class="login-card"><button class="theme-toggle" aria-label="Alternar tema">◐</button><p class="eyebrow">BEM-VINDO</p><h2>Entrar na plataforma</h2><form id="login-form"><label>E-mail<input name="email" required type="email" autocomplete="username" placeholder="voce@empresa.com" /></label><label>Senha<input name="password" required type="password" autocomplete="current-password" placeholder="••••••••" /></label><p id="auth-error" class="auth-error" role="alert"></p><button class="primary" type="submit">Entrar <span>→</span></button></form><p class="footer">Ambiente seguro · PDV Master</p></section></main>`;
}
function changePasswordTemplate(): string {
  return `<main class="login-page"><section class="brand-panel"><div class="brand-mark">PM</div><p class="eyebrow">SEGURANÇA</p><h1>Primeiro acesso</h1><p>Defina uma senha pessoal antes de continuar.</p></section><section class="login-card"><p class="eyebrow">ALTERAR SENHA</p><h2>Crie sua nova senha</h2><form id="change-password-form"><label>Senha atual<input name="currentPassword" required type="password" autocomplete="current-password" /></label><label>Nova senha<input name="newPassword" required minlength="12" type="password" autocomplete="new-password" /></label><p id="auth-error" class="auth-error" role="alert"></p><button class="primary" type="submit">Salvar e continuar <span>→</span></button></form></section></main>`;
}
function dashboardTemplate(): string {
  const name = user?.name ?? 'Usuário';
  return `<main class="shell"><aside class="sidebar" id="sidebar"><div class="side-brand"><div class="brand-mark small">PM</div>PDV Master<button id="close-menu">×</button></div><nav><button class="nav active"><span>▦</span>Visão geral</button><button class="nav"><span>▣</span>Vendas</button><button class="nav"><span>◫</span>Produtos</button><button class="nav"><span>♙</span>Clientes</button></nav><button class="profile" id="logout-button"><b>${name.slice(0, 2).toUpperCase()}</b><span><strong>${name}</strong><small>Sair da sessão</small></span></button></aside><section class="dashboard"><header><button id="open-menu" class="hamburger">☰</button><div><p class="eyebrow">PAINEL PRINCIPAL</p><h1>Olá, ${name} <span>✦</span></h1><p>Acompanhe os principais indicadores do seu negócio.</p></div><div class="actions"><span id="db-status">● Banco conectado</span><button class="theme-toggle">◐</button></div></header><section class="metrics"><article class="metric"><i>↗</i><p>Vendas hoje</p><strong>R$ 0,00</strong><small>Aguardando movimentações</small></article><article class="metric"><i>◫</i><p>Produtos cadastrados</p><strong>0</strong><small>Cadastre seu primeiro produto</small></article><article class="metric"><i>♙</i><p>Clientes ativos</p><strong>0</strong><small>Base ainda não iniciada</small></article></section></section></main>`;
}
function showError(message?: string): void { const target = document.querySelector('#auth-error'); if (target) target.textContent = message ?? ''; }
function render(): void { const root = document.querySelector('#app'); if (!root) return; root.innerHTML = currentView === 'login' ? loginTemplate() : currentView === 'change-password' ? changePasswordTemplate() : dashboardTemplate(); bind(); }
function bind(): void {
  document.querySelectorAll<HTMLButtonElement>('.theme-toggle').forEach((element) => element.addEventListener('click', () => document.body.classList.toggle('dark')));
  document.querySelector<HTMLFormElement>('#login-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const response = await window.pdvMaster.auth.login(String(form.get('email') ?? ''), String(form.get('password') ?? '')); if (!response.success || !response.data) return showError(response.error?.message); user = response.data; currentView = user.mustChangePassword ? 'change-password' : 'dashboard'; render(); });
  document.querySelector<HTMLFormElement>('#change-password-form')?.addEventListener('submit', async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget as HTMLFormElement); const response = await window.pdvMaster.auth.changePassword(String(form.get('currentPassword') ?? ''), String(form.get('newPassword') ?? '')); if (!response.success || !response.data) return showError(response.error?.message); user = response.data; currentView = 'dashboard'; render(); });
  document.querySelector('#logout-button')?.addEventListener('click', async () => { await window.pdvMaster.auth.logout(); user = null; currentView = 'login'; render(); });
  document.querySelector('#open-menu')?.addEventListener('click', () => document.querySelector('#sidebar')?.classList.add('open'));
  document.querySelector('#close-menu')?.addEventListener('click', () => document.querySelector('#sidebar')?.classList.remove('open'));
}
async function bootstrap(): Promise<void> { const response = await window.pdvMaster.auth.session(); if (response.success && response.data) { user = response.data; currentView = user.mustChangePassword ? 'change-password' : 'dashboard'; } render(); }
void bootstrap();
