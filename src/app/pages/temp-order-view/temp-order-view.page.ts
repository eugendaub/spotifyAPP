import { Component, OnInit } from '@angular/core';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-temp-order-view',
  templateUrl: './temp-order-view.page.html',
  styleUrls: ['./temp-order-view.page.scss'],
})
export class TempOrderViewPage implements OnInit {
  allTempOrders = [];

  constructor(private dataService: DataService) {
    //Get All Temporary Orders now
      this.allTempOrders = this.dataService.getTemporaraOrder();
  }

  ngOnInit() {
  }

}
