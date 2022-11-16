import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import albums from '../../assets/mockdata/albums';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';
import {ToastController} from '@ionic/angular';
import {Vibration} from '@ionic-native/vibration/ngx';
import { Storage } from '@ionic/storage-angular';
import {Tab4Page} from '../tab4/tab4.page';
import {TabsPage} from '../tabs/tabs.page';


@Component({
  selector: 'app-album',
  templateUrl: './album.page.html',
  styleUrls: ['./album.page.scss'],
})
export class AlbumPage implements OnInit {
  data = null;
  oneRoundNumber = 2;
  userOrderCount = 0;
  orderButtonDisabled;
  events: any[] = [];


  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
              private dataService: DataService, private toastCtrl: ToastController,
              private vibration: Vibration, private storage: Storage,
              private tab4Page: Tab4Page , private tabsPage: TabsPage) {}

  ngOnInit() {
    const title = this.activatedRoute.snapshot.paramMap.get('title');
    const decodedTitle = decodeURIComponent(title);
    this.data = albums [decodedTitle];
    this.orderButtonDisabled = this.dataService.placeAnOrderButtonStatus();
    console.log('button', this.orderButtonDisabled);


  }



  // Helper function for image names
  dasherize(stri) {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    return stri.replace(/[A-Z]/g, function(char, index): string {
      return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
  };

  placeAnOrder(order){
    const logInUserEmail = this.authService.getUserEmail();
    const logInUserId= this.authService.getUserId();
    const usertTableNr = this.authService.getUserTableNr();
    const img= this.dasherize(order.image);
    /*
    if(this.userOrderCount !==0){
      this.orderToast();
      this.userOrderCount--;
      console.log('oneOrderTotalNumber', this.oneOrderTotalNumber);
      console.log('userOrderCount', this.userOrderCount);
    }else{
      this.orderFullToast();
    }*/
    this.orderToast();
    this.dataService.addOrderToUser(logInUserId, logInUserEmail,  order.title,  order.title , img, usertTableNr);
  }
  async placeAnOrderInStorage(order){
    const logInUserEmail = this.authService.getUserEmail();
    const logInUserId= this.authService.getUserId();
    const usertTableNr = this.authService.getUserTableNr();
    const img= this.dasherize(order.image);

   await this.dataService.addDate(logInUserId, logInUserEmail,  order.title,  order.title , img, usertTableNr);
    this.tab4Page.loadDates();
  }
  async loadDates() {
    console.log('loadData');
    this.events = await this.dataService.getData();
  }

  placeAnOrderTemp(order){
    const logInUserEmail = this.authService.getUserEmail();
    const logInUserId= this.authService.getUserId();
    const usertTableNr = this.authService.getUserTableNr();
    const img= this.dasherize(order.image);
    //this.countOrders();
    this.orderButtonDisabled=this.dataService.addUpUserOrder();
    console.log('orderButtonDisabled:', this.orderButtonDisabled);

    this.dataService.addTempOrder(logInUserId, logInUserEmail,  order.title,  order.title , img, usertTableNr);
    this.tabsPage.tempOrederButtonEnDis(this.orderButtonDisabled);
  }

  countOrders(){
    const userOrderCount = this.authService.getGuestsNumber();
    const oneOrderTotalNumber = userOrderCount * this.oneRoundNumber -1;
    if( oneOrderTotalNumber > this.userOrderCount){
      this.orderToast();
      this.userOrderCount++;
      console.log('user order count', this.userOrderCount);
    }else{
      this.userOrderCount=0;
      this.orderFullToast();
      this.orderButtonDisabled=true;

    }
  }
  orderButtonEnable(set: boolean){
    this.orderButtonDisabled= set;
  }

  orderToast() {
    this.vibration.vibrate(75);
    this.toastCtrl.create({
      message: 'Added order!',
      position: 'top',
      duration: 800,
      cssClass: 'toast-custom-class-order',

    }).then((toast) => {
      toast.present();
    });
  }
  orderFullToast() {
    this.vibration.vibrate(75);
    this.toastCtrl.create({
      message: 'Order Full!',
      position: 'top',
      duration: 2500,
      cssClass: 'toast-custom-class',

    }).then((toast) => {
      toast.present();
    });
   // this.userOrderCount = this.authService.getGuestsNumber();

  }



}
