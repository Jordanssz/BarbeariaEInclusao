import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AcessibilidadeClientePageRoutingModule } from './acessibilidade-cliente-routing.module';

import { AcessibilidadeClientePage } from './acessibilidade-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AcessibilidadeClientePageRoutingModule
  ],
  declarations: [AcessibilidadeClientePage]
})
export class AcessibilidadeClientePageModule {}
