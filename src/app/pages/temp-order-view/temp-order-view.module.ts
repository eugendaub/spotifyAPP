import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TempOrderViewPageRoutingModule } from './temp-order-view-routing.module';

import { TempOrderViewPage } from './temp-order-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TempOrderViewPageRoutingModule
  ],
  declarations: [TempOrderViewPage]
})
export class TempOrderViewPageModule {}
