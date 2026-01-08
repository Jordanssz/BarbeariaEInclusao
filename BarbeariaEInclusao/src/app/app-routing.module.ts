import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

// Removidas as importações diretas de páginas, pois agora todas as páginas serão carregadas de forma preguiçosa (lazy loading).
// import { AddServicoPage } from './pages/add-servico/add-servico.page';
// import { BarbeariaMenuPage } from './pages/barbearia-menu/barbearia-menu.page';

const routes: Routes = [
  {
    // Redirecionamento de raiz principal.
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'login-cliente',
    loadChildren: () => import('./pages/login-cliente/login-cliente.module').then( m => m.LoginClientePageModule)
  },
  {
    path: 'login-barbearia',
    loadChildren: () => import('./pages/login-barbearia/login-barbearia.module').then( m => m.LoginBarbeariaPageModule)
  },
  {
    path: 'cadastro-cliente',
    loadChildren: () => import('./pages/cadastro-cliente/cadastro-cliente.module').then( m => m.CadastroClientePageModule)
  },
  {
    path: 'cadastro-barbearia',
    loadChildren: () => import('./pages/cadastro-barbearia/cadastro-barbearia.module').then( m => m.CadastroBarbeariaPageModule)
  },
  {
    path: 'login-profissional',
    loadChildren: () => import('./pages/login-profissional/login-profissional.module').then( m => m.LoginProfissionalPageModule)
  },
  // Rota do menu da barbearia (apenas lazy loading).
  {
    path: 'barbearia-menu',
    loadChildren: () => import('./pages/barbearia-menu/barbearia-menu.module').then( m => m.BarbeariaMenuPageModule)
  },
  // Rota de adicionar serviço (base - apenas lazy loading).
  {
    path: 'add-servico',
    loadChildren: () => import('./pages/add-servico/add-servico.module').then( m => m.AddServicoPageModule)
  },
  // Rota de adicionar serviço (com parâmetro :id, também apontando para o módulo lazy).
  {
    path: 'add-servico/:id',
    loadChildren: () => import('./pages/add-servico/add-servico.module').then( m => m.AddServicoPageModule)
  },
  // Rota de cadastro de profissional (base - apenas lazy loading).
  {
    path: 'cadastro-profissional',
    loadChildren: () => import('./pages/cadastro-profissional/cadastro-profissional.module').then( m => m.CadastroProfissionalPageModule)
  },
  // Rota de cadastro de profissional (com parâmetro :id, também apontando para o módulo lazy).
  {
    path: 'cadastro-profissional/:id',
    loadChildren: () => import('./pages/cadastro-profissional/cadastro-profissional.module').then(m => m.CadastroProfissionalPageModule)
  },
  {
    path: 'barbearia-acessibilidades',
    loadChildren: () => import('./pages/barbearia-acessibilidades/barbearia-acessibilidades.module').then( m => m.BarbeariaAcessibilidadesPageModule)
  },
  {
    path: 'barbeiro-menu',
    loadChildren: () => import('./pages/barbeiro-menu/barbeiro-menu.module').then( m => m.BarbeiroMenuPageModule)
  },
  {
    path: 'barbeiro-tag',
    loadChildren: () => import('./pages/barbeiro-tag/barbeiro-tag.module').then( m => m.BarbeiroTagPageModule)
  },
  {
    path: 'navegar-barbearias',
    loadChildren: () => import('./pages/navegar-barbearias/navegar-barbearias.module').then( m => m.NavegarBarbeariasPageModule)
  },
  {
    path: 'usuario-menu',
    loadChildren: () => import('./pages/usuario-menu/usuario-menu.module').then( m => m.UsuarioMenuPageModule)
  },
  {
    path: 'usuario-acessibilidade',
    loadChildren: () => import('./pages/usuario-acessibilidade/usuario-acessibilidade.module').then( m => m.UsuarioAcessibilidadePageModule)
  },
  {
    path: 'ver-barbearia',
    loadChildren: () => import('./pages/ver-barbearia/ver-barbearia.module').then( m => m.VerBarbeariaPageModule)
  },
  {
    path: 'ver-barbearia/:id',
    loadChildren: () => import('./pages/ver-barbearia/ver-barbearia.module').then(m => m.VerBarbeariaPageModule)
  },
  {
    path: 'marcar-agendamento',
    loadChildren: () => import('./pages/marcar-agendamento/marcar-agendamento.module').then( m => m.MarcarAgendamentoPageModule)
  },
  {
    path: 'marcar-agendamento/:idServico',
    loadChildren: () => import('./pages/marcar-agendamento/marcar-agendamento.module').then( m => m.MarcarAgendamentoPageModule)
  },
  {
    path: 'atendimentos-marcados',
    loadChildren: () => import('./pages/atendimentos-marcados/atendimentos-marcados.module').then( m => m.AtendimentosMarcadosPageModule)
  },
  {
    path: 'cliente-menu',
    loadChildren: () => import('./pages/cliente-menu/cliente-menu.module').then( m => m.ClienteMenuPageModule)
  },
  {
    path: 'acessibilidade-cliente',
    loadChildren: () => import('./pages/acessibilidade-cliente/acessibilidade-cliente.module').then( m => m.AcessibilidadeClientePageModule)
  },
  {
    path: 'agenda-barbearia',
    loadChildren: () => import('./pages/agenda-barbearia/agenda-barbearia.module').then( m => m.AgendaBarbeariaPageModule)
  },
  {
    path: 'agenda-barbeiro',
    loadChildren: () => import('./pages/agenda-barbeiro/agenda-barbeiro.module').then( m => m.AgendaBarbeiroPageModule)
  },
  {
    path: 'notificacao-barbeiro',
    loadChildren: () => import('./pages/notificacao-barbeiro/notificacao-barbeiro.module').then( m => m.NotificacaoBarbeiroPageModule)
  },
  {
    path: 'avaliacao',
    loadChildren: () => import('./pages/avaliacao/avaliacao.module').then( m => m.AvaliacaoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
