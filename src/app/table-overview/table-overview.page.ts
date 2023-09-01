import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../services/data.service';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-table-overview',
  templateUrl: './table-overview.page.html',
  styleUrls: ['./table-overview.page.scss'],
})
export class TableOverviewPage implements OnInit {
  tableId = null;
  allTableOrders: any = [];
  showTableOrder: any=[];
  orderPrice: number = null;
  orderPriceToFixed: any = null;

  constructor(private router: Router, private dataService: DataService, private route: ActivatedRoute,
              private alertCtrl: AlertController) {
    this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonHidden');
  }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id');
    console.log(this.tableId);
    this.getTableOrders(this.tableId);
  }

  back(){
    this.router.navigateByUrl('/tabs/tabSeeAllTabel');
  }

  getTableOrders(tableId){
    this.orderPrice = 0;
    this.dataService.getTableOrders2(tableId).subscribe(res => {
      this.allTableOrders = res.userOrders;
      console.log(' this.allTableOrders ', this.allTableOrders );
      for(const orderId of this.allTableOrders){
        console.log('price: ', orderId.price);
        this.orderPrice = this.orderPrice + orderId.price;
        this.orderPriceToFixed = this.orderPrice.toFixed(2);
        }
    });
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
