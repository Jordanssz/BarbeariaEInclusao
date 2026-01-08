import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtendimentosMarcadosPage } from './atendimentos-marcados.page';

const routes: Routes = [
  {
    path: '',
    component: AtendimentosMarcadosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtendimentosMarcadosPageRoutingModule {}
