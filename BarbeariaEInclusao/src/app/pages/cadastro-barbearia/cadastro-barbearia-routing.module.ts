import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastroBarbeariaPage } from './cadastro-barbearia.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroBarbeariaPage
  },
  {
    path: ':id',
    component: CadastroBarbeariaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastroBarbeariaPageRoutingModule {}
