import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuarioAcessibilidadePage } from './usuario-acessibilidade.page';

const routes: Routes = [
  {
    path: '',
    component: UsuarioAcessibilidadePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuarioAcessibilidadePageRoutingModule {}
