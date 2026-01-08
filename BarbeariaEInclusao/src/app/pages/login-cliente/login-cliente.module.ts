import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginClientePageRoutingModule } from './login-cliente-routing.module';

import { LoginClientePage } from './login-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginClientePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [LoginClientePage]
})
export class LoginClientePageModule {}
