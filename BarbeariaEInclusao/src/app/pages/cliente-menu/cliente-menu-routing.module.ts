import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClienteMenuPage } from './cliente-menu.page';

const routes: Routes = [
  {
    path: '',
    component: ClienteMenuPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClienteMenuPageRoutingModule {}
