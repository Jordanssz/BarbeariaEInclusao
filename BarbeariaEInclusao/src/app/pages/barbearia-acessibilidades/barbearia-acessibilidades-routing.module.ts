import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BarbeariaAcessibilidadesPage } from './barbearia-acessibilidades.page';

const routes: Routes = [
  {
    path: '',
    component: BarbeariaAcessibilidadesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarbeariaAcessibilidadesPageRoutingModule {}
