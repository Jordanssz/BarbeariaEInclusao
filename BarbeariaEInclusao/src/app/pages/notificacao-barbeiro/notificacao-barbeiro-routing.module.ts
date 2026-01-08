import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificacaoBarbeiroPage } from './notificacao-barbeiro.page';

const routes: Routes = [
  {
    path: '',
    component: NotificacaoBarbeiroPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificacaoBarbeiroPageRoutingModule {}
