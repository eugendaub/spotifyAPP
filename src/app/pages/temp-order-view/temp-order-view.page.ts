import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';
import {NavController} from '@ionic/angular';

@Component({
  selector: 'app-temp-order-view',
  templateUrl: './temp-order-view.page.html',
  styleUrls: ['./temp-order-view.page.scss'],
})
export class TempOrderViewPage implements OnInit {
  allTempOrders = [];

  constructor(private dataService: DataService, private navCtrl: NavController) {
    //Get All Temporary Orders now
      this.allTempOrders = this.dataService.getTemporaraOrder();
  }

  ngOnInit() {
  }
  placeAnOrder(){
    this.dataService.addTempOrderToDB();
    this.dataService.deleteCompleteTempOrder();
    this.openTab1();
  }

  deleteOneOrder(order){
    console.log('ID :', order.tempId);
    this.dataService.deleteTempOrder(order.tempId);
  }

  openTab1(){
    this.navCtrl.navigateRoot('/tabs/tab1');
  }

}
