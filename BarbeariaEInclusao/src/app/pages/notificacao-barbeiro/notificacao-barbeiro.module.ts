import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificacaoBarbeiroPageRoutingModule } from './notificacao-barbeiro-routing.module';

import { NotificacaoBarbeiroPage } from './notificacao-barbeiro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificacaoBarbeiroPageRoutingModule
  ],
  declarations: [NotificacaoBarbeiroPage]
})
export class NotificacaoBarbeiroPageModule {}
