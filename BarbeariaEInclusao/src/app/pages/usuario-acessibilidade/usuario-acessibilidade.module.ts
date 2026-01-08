import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioAcessibilidadePageRoutingModule } from './usuario-acessibilidade-routing.module';

import { UsuarioAcessibilidadePage } from './usuario-acessibilidade.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioAcessibilidadePageRoutingModule
  ],
  declarations: [UsuarioAcessibilidadePage]
})
export class UsuarioAcessibilidadePageModule {}
