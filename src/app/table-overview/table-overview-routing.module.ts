import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TableOverviewPage } from './table-overview.page';

const routes: Routes = [
  {
    path: '',
    component: TableOverviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableOverviewPageRoutingModule {}
