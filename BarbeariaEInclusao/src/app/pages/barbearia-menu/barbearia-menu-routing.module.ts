import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BarbeariaMenuPage } from './barbearia-menu.page';

const routes: Routes = [
  {
    path: '',
    component: BarbeariaMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BarbeariaMenuPageRoutingModule {}
