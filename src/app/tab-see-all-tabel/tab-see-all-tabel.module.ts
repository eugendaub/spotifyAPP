import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabSeeAllTabelPageRoutingModule } from './tab-see-all-tabel-routing.module';

import { TabSeeAllTabelPage } from './tab-see-all-tabel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabSeeAllTabelPageRoutingModule
  ],
  declarations: [TabSeeAllTabelPage]
})
export class TabSeeAllTabelPageModule {}
