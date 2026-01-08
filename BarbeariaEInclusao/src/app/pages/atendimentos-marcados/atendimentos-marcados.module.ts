import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AtendimentosMarcadosPageRoutingModule } from './atendimentos-marcados-routing.module';

import { AtendimentosMarcadosPage } from './atendimentos-marcados.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AtendimentosMarcadosPageRoutingModule
  ],
  declarations: [AtendimentosMarcadosPage]
})
export class AtendimentosMarcadosPageModule {}
