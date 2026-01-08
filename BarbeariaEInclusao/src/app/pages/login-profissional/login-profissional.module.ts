import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginProfissionalPageRoutingModule } from './login-profissional-routing.module';

import { LoginProfissionalPage } from './login-profissional.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginProfissionalPageRoutingModule
  ],
  declarations: [LoginProfissionalPage]
})
export class LoginProfissionalPageModule {}
