import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavegarBarbeariasPage } from './navegar-barbearias.page';

const routes: Routes = [
  {
    path: '',
    component: NavegarBarbeariasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NavegarBarbeariasPageRoutingModule {}
