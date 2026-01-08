import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginBarbeariaPage } from './login-barbearia.page';

const routes: Routes = [
  {
    path: '',
    component: LoginBarbeariaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginBarbeariaPageRoutingModule {}
