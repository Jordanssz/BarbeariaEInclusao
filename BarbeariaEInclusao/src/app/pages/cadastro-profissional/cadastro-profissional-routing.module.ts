import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastroProfissionalPage } from './cadastro-profissional.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroProfissionalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastroProfissionalPageRoutingModule {}
