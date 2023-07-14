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
export class TempOrderViewPage implements OnInit {
  allTempOrders = [];
  waiteTime = 100;
  timeLeft: number = this.waiteTime;
  interval;
  orderNowButtonOnOff=false;

  constructor(private dataService: DataService, private navCtrl: NavController, private albumPage: AlbumPage,
              private tabsPage: TabsPage, private tab4Page: Tab4Page, private router: Router) {
    //Get All Temporary Orders now
      this.allTempOrders = this.dataService.getTemporaraOrder();
  }

  ngOnInit() {
  }
  async placeAnOrder(){
    //this.orderTimerPause();
    this.startProcessBar('start');
    this.dataService.addTempOrderToDB();
    this.dataService.deleteCompleteTempOrder();
    this.tabsPage.startExpiryTimer();
    //this.openTab1();
    //this.tab4Page.getUserOrders();
  }
  startProcessBar(status) {
      this.dataService.updateProcessBarStatus(status);
  }

  setOrderNowButtonOnOff(onOff: boolean){
    if(this.orderNowButtonOnOff===onOff){
      this.orderNowButtonOnOff=true;
    }else{
      this.orderNowButtonOnOff=false;
    }
  }

  async orderTimerPause() {
    console.log('PAUSE overview temp order'   );
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
    //this.orderTimerPause();
    //this.tabsPage.orderTimerPause();
    //this.navCtrl.navigateRoot('/tabs/tab1');
    this.router.navigate(['/tabs/tab1']);
  }


}
