import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerBarbeariaPageRoutingModule } from './ver-barbearia-routing.module';

import { VerBarbeariaPage } from './ver-barbearia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerBarbeariaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [VerBarbeariaPage]
})
export class VerBarbeariaPageModule {}
