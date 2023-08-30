import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'tempOrderView',
    loadChildren: () => import('./pages/temp-order-view/temp-order-view.module').then( m => m.TempOrderViewPageModule)
  },
  {
    path: 'tableOverview',
    loadChildren: () => import('./table-overview/table-overview.module').then( m => m.TableOverviewPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

//'tabs/tableOverview/bU5Urhf1sxRqKJz3LWlH1KjSnR82'
