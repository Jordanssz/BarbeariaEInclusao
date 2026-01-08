import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarbeiroMenuPageRoutingModule } from './barbeiro-menu-routing.module';

import { BarbeiroMenuPage } from './barbeiro-menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarbeiroMenuPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BarbeiroMenuPage]
})
export class BarbeiroMenuPageModule {}
