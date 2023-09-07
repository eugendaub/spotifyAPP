import { Component, OnInit } from '@angular/core';
import {DataService} from '../services/data.service';
import {Storage} from '@ionic/storage-angular';
import {AlertController} from '@ionic/angular';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  allUserOrders = [];
  events: any[] = [];
  orderPrice: number = null;
  orderPriceToFixed: any = null;
  userid: any = null;

  constructor(private dataService: DataService, private storage: Storage,
              private alertCtrl: AlertController,  private authService: AuthService)
  {
    this.storageCreate();
    //this.getUserOrders();
    //this.getUserOrdersFromOrder();
  }

  ngOnInit() {

  }

  getUserOrders(){
    this.orderPrice=0;
    this.orderPriceToFixed =0;
    this.dataService.getTableOrdersForUser().subscribe(res => {
      this.allUserOrders = res.userOrders;
      console.log('this.allUserOrders ', this.allUserOrders);
      for(const orderId of this.allUserOrders){
        console.log('price: ', orderId.price);
        this.orderPrice = this.orderPrice + orderId.price;
        console.log('Price zusammen ' ,this.orderPrice);
      }
      this.orderPriceToFixed = this.orderPrice.toFixed(2);
      console.log('price orderPriceToFixed:', this.orderPriceToFixed);
    });
  }

  getUserOrdersFromOrder(){
    console.log('getUserOrdersFromOrder');
    this.allUserOrders = [];
    this.orderPrice = 0;
    this.userid = this.authService.getUserId();
    this.dataService.getTableOrders(this.userid).subscribe( res =>{
      this.allUserOrders = res;
     // console.log('allUserOrders', res);
      for(const orderId of this.allUserOrders){
        //console.log('orderId: ', orderId.order.title);
        this.orderPrice = this.orderPrice + orderId.order.price;
        //console.log('Price zusammen ' ,this.orderPrice);
      }
      this.orderPriceToFixed = this.orderPrice.toFixed(2);
     // console.log('price orderPriceToFixed:', this.orderPriceToFixed);
    });
  }


  async loadDates() {
    //this.events = await this.dataService.getLocalTableOrders();
    console.log('loadData tab4');
    this.getUserOrdersFromOrder();
  }

  // Löscht eine Bestellung (wird zur Testzweken benötigt)
  async removeItem(index) {
    this.dataService.remvoveItem(index);
    this.events.splice(index, 1);
  }

  async ionViewWillEnter() {
    //console.log('ionViewWillEnter');
    this.loadDates();
  }

  async storageCreate() {
    await this.storage.create();
  }

  async callWaitress(){

    const alert = await this.alertCtrl.create({
      cssClass: 'alt my-custom-class',
      header: 'Call Waitress ',
      message: `Do you want to complete and pay for your order?`,
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
