import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AcessibilidadeClientePage } from './acessibilidade-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: AcessibilidadeClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcessibilidadeClientePageRoutingModule {}
