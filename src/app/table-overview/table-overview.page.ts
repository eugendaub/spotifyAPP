import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../services/data.service';
import {AuthService} from '../services/auth.service';

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
  userid: any = null;

  constructor(private router: Router, private dataService: DataService,
              private route: ActivatedRoute, private authService: AuthService) {
    this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonHidden');
  }

  ngOnInit() {
    this.tableId = this.route.snapshot.paramMap.get('id');
   // console.log(this.tableId);
    this.getTableOrders(this.tableId);
  }

  back(){
    this.router.navigateByUrl('/tabs/tabSeeAllTabel');
  }

  getTableOrders(tableId){
   // console.log(tableId);
    this.orderPrice = 0;
    this.userid = this.authService.getUserId();
    this.dataService.getTableOrders(tableId).subscribe( res =>{
      this.allTableOrders = res;
      // console.log('allUserOrders', res);
      for(const orderId of this.allTableOrders){
        //console.log('orderId: ', orderId.order.title);
        this.orderPrice = this.orderPrice + orderId.order.price;
        //console.log('Price zusammen ' ,this.orderPrice);
      }
      this.orderPriceToFixed = this.orderPrice.toFixed(2);
      // console.log('price orderPriceToFixed:', this.orderPriceToFixed);
    });
  }

}
