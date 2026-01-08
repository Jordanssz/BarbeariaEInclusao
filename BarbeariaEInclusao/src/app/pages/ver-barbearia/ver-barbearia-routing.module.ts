import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerBarbeariaPage } from './ver-barbearia.page';

const routes: Routes = [
  {
    path: '',
    component: VerBarbeariaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerBarbeariaPageRoutingModule {}
