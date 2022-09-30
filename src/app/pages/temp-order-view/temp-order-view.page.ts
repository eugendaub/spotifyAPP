import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {NavController} from '@ionic/angular';
import {AlbumPage} from '../../album/album.page';
import {TabsPage} from '../../tabs/tabs.page';
import {Tab4Page} from '../../tab4/tab4.page';


@Component({
  selector: 'app-temp-order-view',
  templateUrl: './temp-order-view.page.html',
  styleUrls: ['./temp-order-view.page.scss'],
})
export class TempOrderViewPage implements OnInit {
  allTempOrders = [];
  waiteTime = 100;
  timeLeft: number = this.waiteTime;
  interval;

  constructor(private dataService: DataService, private navCtrl: NavController, private albumPage: AlbumPage,
              private tabsPage: TabsPage, private tab4Page: Tab4Page) {
    //Get All Temporary Orders now
      this.allTempOrders = this.dataService.getTemporaraOrder();
  }

  ngOnInit() {
  }
  placeAnOrder(){
    this.orderTimerPause();
    this.dataService.addTempOrderToDB();
    this.dataService.deleteCompleteTempOrder();
    //this.albumPage.orderButtonEnable(true);
    //this.openTab1();
    //this.tab4Page.getUserOrders();

  }

  async orderTimerPause() {
    console.log('PAUSE overview'   );
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        console.log('time: ', this.timeLeft);
        this.timeLeft = this.timeLeft-10;
      } else {
        console.log('else Pause');
        this.pauseOrderTimer();
      }
    },1000);
  }


  pauseOrderTimer() {

    this.timeLeft = this.waiteTime;
    clearInterval(this.interval);
  }

  deleteOneOrder(order){
    console.log('ID :', order.tempId);

    this.dataService.deleteTempOrder(order.tempId);
    this.dataService.oneOrderDeleteMinusCount();

  }

  openTab1(){
    //this.tabsPage.orderTimerPause();
    this.navCtrl.navigateRoot('/tabs/tab1');
  }


}
