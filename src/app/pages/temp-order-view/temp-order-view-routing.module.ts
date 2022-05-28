import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TempOrderViewPage } from './temp-order-view.page';

const routes: Routes = [
  {
    path: '',
    component: TempOrderViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TempOrderViewPageRoutingModule {}
