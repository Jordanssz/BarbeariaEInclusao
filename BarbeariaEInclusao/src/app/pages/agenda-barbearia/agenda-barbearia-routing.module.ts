import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgendaBarbeariaPage } from './agenda-barbearia.page';

const routes: Routes = [
  {
    path: '',
    component: AgendaBarbeariaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgendaBarbeariaPageRoutingModule {}
