import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TableOverviewPageRoutingModule } from './table-overview-routing.module';

import { TableOverviewPage } from './table-overview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TableOverviewPageRoutingModule
  ],
  declarations: [TableOverviewPage]
})
export class TableOverviewPageModule {}
