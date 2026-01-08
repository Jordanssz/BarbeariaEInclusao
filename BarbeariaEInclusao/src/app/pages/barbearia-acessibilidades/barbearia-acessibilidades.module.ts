import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarbeariaAcessibilidadesPageRoutingModule } from './barbearia-acessibilidades-routing.module';

import { BarbeariaAcessibilidadesPage } from './barbearia-acessibilidades.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarbeariaAcessibilidadesPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BarbeariaAcessibilidadesPage]
})
export class BarbeariaAcessibilidadesPageModule {}
