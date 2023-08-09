import { Component } from '@angular/core';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  allOrders = [];
  allOrdersByTime = [];

  constructor(private dataService: DataService) {

    //Get All Order ID
    this.dataService.getAllOrderId().subscribe(res => {
      this.allOrders = res;
    });

    //Get All orders sort by order time
    this.dataService.getOrderByCreatedTime().subscribe(res =>{
      this.allOrdersByTime = res;
    });
  }

  deleteOrder(order){
    this.dataService.deleteOrderAndUserOrders(order);
  }

  // löscht alle Bestellugen.
  deleteAllUserOrders(){
    this.dataService.deleteAllUserOrdersFromDB();
  }
}
