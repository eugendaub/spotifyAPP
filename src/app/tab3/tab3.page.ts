import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../services/data.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy{
  allOrders = [];
  allOrdersByTime = [];

  items = [
    { name: 'Item 1', timestamp: Date.now() - 10000, expired: false, status: 'active' }, // Initialize expired status
    { name: 'Item 2', timestamp: Date.now() - 20000, expired: false, status: 'active' }, // Initialize expired status
    // ... other items
  ];
  private subscription: Subscription;

  constructor(private dataService: DataService) {

    //Get All Order ID
    this.dataService.getAllOrderId().subscribe(res => {
      this.allOrders = res;
    });

    //Get All orders sort by order time
    this.dataService.getOrderByCreatedTime().subscribe(res =>{
      this.allOrdersByTime = res;
      this.updateExpiryTime();
    });
  }
  ngOnInit() {
    this.subscription = interval(60000).subscribe(() => {
      // Call a method to update the expired status of items
      this.updateExpiredStatus();
      this.updateExpiryTime();
    });
  }


  updateExpiredStatus() {
    const currentTime = Date.now();
    this.items.forEach(item => {
      const timeDifference = (currentTime - item.timestamp) / 1000; // Convert to seconds
      if (timeDifference > 30) {
        item.status = 'expired';
      } else {
        item.status = 'active';
      }
    });
  }

  updateExpiryTime() {

    const currentTime = Date.now();
    const currentTimeCutString = currentTime.toString();
    const timeCut = currentTimeCutString.slice(0,-3);
    const currenTimeCutNumber = parseInt(timeCut,10);
    //console.log('currentTime :' , currenTimeCutNumber);
    for(const allOrders of this.allOrdersByTime) {
      //console.log('all', allOrders);
      // eslint-disable-next-line @typescript-eslint/no-shadow
      this.allOrdersByTime.forEach(allOrders => {
        //console.log('Date ', allOrders.createdAt);
        const date = new Date(allOrders.timeExpired);
        const timestampSeconds = Math.floor(date.getTime() / 1000);
       // console.log('timestampSeconds '+timestampSeconds);

       const timeDifference = (currenTimeCutNumber - timestampSeconds); // Convert to seconds
        //console.log('timeDifference ' +timeDifference);
        if( timeDifference > 120){
          allOrders.expired = 'expired';
        }else if(timeDifference > 60){
          allOrders.expired = 'medium';
        }else {
          allOrders.expired = 'active';
        }
       // console.log('all:', allOrders.expired);
        //console.log('GIVEN: ', allOrders);
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  deleteOrder(order){
    this.dataService.deleteOrderAndUserOrders(order);
  }

  // löscht alle Bestellugen.
  deleteAllUserOrders(){
    this.dataService.deleteAllUserOrdersFromDB();
  }
}
