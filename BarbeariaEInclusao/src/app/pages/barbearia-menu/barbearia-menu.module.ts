import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarbeariaMenuPageRoutingModule } from './barbearia-menu-routing.module';

import { BarbeariaMenuPage } from './barbearia-menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarbeariaMenuPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BarbeariaMenuPage]
})
export class BarbeariaMenuPageModule {}
