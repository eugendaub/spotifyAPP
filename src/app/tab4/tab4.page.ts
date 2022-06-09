import { Component, OnInit } from '@angular/core';
import {DataService} from '../services/data.service';


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  allUserOrders: any = [];
  events: any[] = [];


  constructor(private dataService: DataService) {
    console.log('constructor tab 4 allUserOrders: ', this.allUserOrders );
    //this.loadDates();
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.loadDates();
  }

  getUserOrders(){
    this.dataService.getAllUserOrders().subscribe(res => {
      this.allUserOrders = res;
      console.log('Get User:', this.allUserOrders);
    });
  }
  async loadDates() {
    console.log('tab 4 loadDates');
    this.events = await this.dataService.getData();
  }

  async removeItem(index) {
    this.dataService.remvoveItem(index);
    this.events.splice(index, 1);
  }

}
