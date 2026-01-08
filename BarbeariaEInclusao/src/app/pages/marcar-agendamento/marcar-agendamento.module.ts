import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarcarAgendamentoPageRoutingModule } from './marcar-agendamento-routing.module';

import { MarcarAgendamentoPage } from './marcar-agendamento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarcarAgendamentoPageRoutingModule
  ],
  declarations: [MarcarAgendamentoPage]
})
export class MarcarAgendamentoPageModule {}
