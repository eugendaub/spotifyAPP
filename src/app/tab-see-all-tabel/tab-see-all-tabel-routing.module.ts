import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabSeeAllTabelPage } from './tab-see-all-tabel.page';

const routes: Routes = [
  {
    path: '',
    component: TabSeeAllTabelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabSeeAllTabelPageRoutingModule {}
