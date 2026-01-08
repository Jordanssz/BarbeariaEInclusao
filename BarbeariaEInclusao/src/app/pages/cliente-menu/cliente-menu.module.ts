import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClienteMenuPageRoutingModule } from './cliente-menu-routing.module';

import { ClienteMenuPage } from './cliente-menu.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClienteMenuPageRoutingModule
  ],
  declarations: [ClienteMenuPage]
})
export class ClienteMenuPageModule {}
