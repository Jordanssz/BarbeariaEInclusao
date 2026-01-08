import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgendaBarbeariaPageRoutingModule } from './agenda-barbearia-routing.module';

import { AgendaBarbeariaPage } from './agenda-barbearia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgendaBarbeariaPageRoutingModule
  ],
  declarations: [AgendaBarbeariaPage]
})
export class AgendaBarbeariaPageModule {}
