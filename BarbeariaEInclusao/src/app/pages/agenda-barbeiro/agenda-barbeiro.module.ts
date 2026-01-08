import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgendaBarbeiroPageRoutingModule } from './agenda-barbeiro-routing.module';

import { AgendaBarbeiroPage } from './agenda-barbeiro.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgendaBarbeiroPageRoutingModule
  ],
  declarations: [AgendaBarbeiroPage]
})
export class AgendaBarbeiroPageModule {}
