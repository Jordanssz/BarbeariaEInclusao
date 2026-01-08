import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BarbeiroTagPageRoutingModule } from './barbeiro-tag-routing.module';

import { BarbeiroTagPage } from './barbeiro-tag.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BarbeiroTagPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BarbeiroTagPage]
})
export class BarbeiroTagPageModule {}
