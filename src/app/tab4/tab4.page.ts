import { Component, OnInit } from '@angular/core';
import {DataService} from '../services/data.service';
import {Storage} from '@ionic/storage-angular';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  allUserOrders: any = [];
  events: any[] = [];
  orderPrice: number = null;
  orderPriceToFixed: any = null;

  constructor(private dataService: DataService, private storage: Storage,   private alertCtrl: AlertController) {}

  ngOnInit() {
    this.storageCreate();
    this.getUserOrders();
  }

  getUserOrders(){
    this.orderPrice=0;
    this.dataService.getTableOrdersForUser().subscribe(res => {
      this.allUserOrders = res.userOrders;
      console.log('this.allUserOrders ', this.allUserOrders);
      for(const orderId of this.allUserOrders){
        console.log('price: ', orderId.price);
        this.orderPrice = this.orderPrice + orderId.price;
      }
      this.orderPriceToFixed = this.orderPrice.toFixed(2);
    });
  }

  async loadDates() {
    this.events = await this.dataService.getLocalTableOrders();
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
