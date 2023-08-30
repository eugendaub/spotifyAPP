import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-table-overview',
  templateUrl: './table-overview.page.html',
  styleUrls: ['./table-overview.page.scss'],
})
export class TableOverviewPage implements OnInit {
  tableId = null;
  allTableOrders: any = [];
  showTableOrder: any=[];

  constructor(private router: Router, private dataService: DataService, private route: ActivatedRoute) {
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
    this.dataService.getTableOrders2(tableId).subscribe(res => {
      this.allTableOrders = res.userOrders;
      console.log(' this.allTableOrders ', this.allTableOrders );
      for(const orderId of this.allTableOrders){
        console.log(orderId);
        console.log(this.dataService.getOrderInfo(orderId));
        this.showTableOrder.push(this.dataService.getOrderInfo(orderId));
        console.log( this.showTableOrder);
        }
    });
  }

}
