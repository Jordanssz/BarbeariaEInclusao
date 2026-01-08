import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginBarbeariaPageRoutingModule } from './login-barbearia-routing.module';

import { LoginBarbeariaPage } from './login-barbearia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginBarbeariaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [LoginBarbeariaPage]
})
export class LoginBarbeariaPageModule {}
