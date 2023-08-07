import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {NavController} from '@ionic/angular';
import {AlbumPage} from '../../album/album.page';
import {TabsPage} from '../../tabs/tabs.page';
import {Tab4Page} from '../../tab4/tab4.page';
import {Router} from '@angular/router';


@Component({
  selector: 'app-temp-order-view',
  templateUrl: './temp-order-view.page.html',
  styleUrls: ['./temp-order-view.page.scss'],
})
export class TempOrderViewPage  {
  allTempOrders = [];
  waiteTime = 100;
  timeLeft: number = this.waiteTime;
  timeLeftSubject;
  interval;
  orderNowButtonOnOff;

  constructor(private dataService: DataService, private navCtrl: NavController, private albumPage: AlbumPage,
              private tabsPage: TabsPage, private tab4Page: Tab4Page, private router: Router) {
    //Get All Temporary Orders now
      this.allTempOrders = this.dataService.getTemporaraOrder();

    this.dataService.timer$.subscribe(status => {
      this.timeLeftSubject = status;
    });

    this.dataService.orderButton$.subscribe(status => {
      this.orderNowButtonOnOff = status;
    });
  }


  async placeAnOrder(){
    this.orderNowButtonOnOff=true;
    this.orderTimerPause();
    this.startProcessBar('start');
    this.dataService.addTempOrderToDB();
    this.dataService.deleteCompleteTempOrder();
    this.tabsPage.startExpiryTimer();
    this.openTab1();
    //this.tab4Page.getUserOrders();
    this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonCountDown');
    //this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonNormal');

  }
  startProcessBar(status) {
      this.dataService.updateProcessBarStatus(status);
  }


  async orderTimerPause() {
    console.log('PAUSE overview temp order'   );
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        console.log('time: ', this.timeLeft);
        this.timeLeft = this.timeLeft-10;
        this.dataService.updateTimerStatus(this.timeLeft);
        this.dataService.updateOrderButtonStatus('orderNowButtonOff');
      } else {
        console.log('else Pause');
        this.pauseOrderTimer();
      }
    },1000);
  }


  pauseOrderTimer() {
    //this.timeLeft = this.waiteTime;
    this.dataService.updateTimerStatus(this.waiteTime);
    this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonNormal');
    this.dataService.updateOrderButtonStatus('orderNowButtonOn');
    clearInterval(this.interval);
  }

  deleteOneOrder(order){
    console.log('ID :', order.tempId);
    this.dataService.deleteTempOrder(order.tempId);
    this.dataService.oneOrderDeleteMinusCount();
    this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonNormal');
  }

  openTab1(){
    //this.orderTimerPause();
    //this.tabsPage.orderTimerPause();
    //this.navCtrl.navigateRoot('/tabs/tab1');
    this.router.navigate(['/tabs']);
  }


}
