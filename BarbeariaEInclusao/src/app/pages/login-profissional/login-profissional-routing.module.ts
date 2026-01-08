import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginProfissionalPage } from './login-profissional.page';

const routes: Routes = [
  {
    path: '',
    component: LoginProfissionalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginProfissionalPageRoutingModule {}
