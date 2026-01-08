import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NavegarBarbeariasPageRoutingModule } from './navegar-barbearias-routing.module';

import { NavegarBarbeariasPage } from './navegar-barbearias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NavegarBarbeariasPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [NavegarBarbeariasPage]
})
export class NavegarBarbeariasPageModule {}
