import { Component} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AlertController, NavController} from '@ionic/angular';
import {AlbumPage} from '../../album/album.page';
import {TabsPage} from '../../tabs/tabs.page';
import {Tab4Page} from '../../tab4/tab4.page';
import {Router} from '@angular/router';
import {BehaviorSubject, Subscription, timer} from 'rxjs';


@Component({
  selector: 'app-temp-order-view',
  templateUrl: './temp-order-view.page.html',
  styleUrls: ['./temp-order-view.page.scss'],
})
export class TempOrderViewPage  {
  allTempOrders = [];
  waiteTime = this.dataService.aRoundTime;
  timeLeft: number = this.waiteTime;
  timeLeftSubject;
  interval;
  orderNowButtonOnOff;
  totalOrderQuantityARound;
  countdownTimer = new BehaviorSubject(0);

  timeLeftFormatted: string;
  private timerSubscription: Subscription;

  constructor(private dataService: DataService, private navCtrl: NavController, private albumPage: AlbumPage,
              private tabsPage: TabsPage, private tab4Page: Tab4Page, private router: Router,
              private alertCtrl: AlertController) {
    //Get All Temporary Orders now
      this.allTempOrders = this.dataService.getTemporaraOrder();

    this.dataService.runningTime$.subscribe(status => {
      this.timeLeftSubject = status;
      // Umwandlung in "mm:ss"-Format
      const minutes = Math.floor(this.timeLeftSubject / 60);
      const seconds = this.timeLeftSubject % 60;
      this.timeLeftFormatted = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
      //console.log('timeLeftSubject; ', this.timeLeftFormatted);
    });

    this.dataService.orderButton$.subscribe(status => {
      this.orderNowButtonOnOff = status;
    });

    this.dataService.totalOrderQuantityARound$.subscribe(status => {
      this.totalOrderQuantityARound = status;
    });
  }

   padZero(num: number): string {
    return (num < 10) ? `0${num}` : `${num}`;
  }

  newTimer(){
    this.timerSubscription = timer(0, 1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;


        this.dataService.updateRunningTime(this.timeLeft);
        this.dataService.updateOrderButtonStatus('orderNowButtonOff');
        this.dataService.updateTimerStatus('on');
      } else {
        //this.timerSubscription.unsubscribe();
        this.pauseOrderTimer();
      }
    });
  }

  pauseOrderTimer() {
    this.timerSubscription.unsubscribe();
    this.dataService.getWaitTime().then(data =>{
      //console.log(data);
      this.dataService.updateRunningTime(data);
    });
    //console.log('this.countdownTimer : ', this.countdownTimer);
    this.dataService.updateTimerStatus('off');
    this.dataService.updateOrderButtonStatus('orderNowButtonOn');
    clearInterval(this.interval);
    if(this.totalOrderQuantityARound === 'orderRoundFull') {
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonFull');
    }else{
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonNormal');
    }
  }

  async placeAnOrder(){
    console.log('placeAnOrder ',this.totalOrderQuantityARound );
    // Wenn eine oder volle Bestellugnen in Temp-Order sind dann bestellung aufgeben.
    if(this.totalOrderQuantityARound >= 1 || this.totalOrderQuantityARound === 'orderRoundFull' ) {
      this.orderNowButtonOnOff = true;
      this.newTimer();
      this.dataService.addTempOrderToDB();
      this.dataService.deleteCompleteTempOrder();
      this.openTab1();
      this.dataService.updateTotalOrderQuantityARound('orderRoundNotFull');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonCountDown');
    }else{
      const alert = await this.alertCtrl.create({
        cssClass: 'alt my-custom-class',
        header: 'Order not Complete',
        message: `You have not selected anything to order`,
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
            cssClass: 'danger',
            handler: () => {
            }
          }
        ]
      });
      await alert.present();
    }
  }

  deleteOneOrder(order){
    console.log('ID :', order.tempId);
    this.dataService.deleteTempOrder(order.tempId);
    this.dataService.oneOrderDeleteMinusCount();
    this.dataService.updateTotalOrderQuantityARound('orderRoundNotFull');
    this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonNormal');
  }

  openTab1(){
    this.router.navigate(['/tabs']);
  }
}
