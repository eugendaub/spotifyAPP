import { Component, OnInit } from '@angular/core';
import {DataService} from '../services/data.service';


@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  allUserOrders: any = [];


  constructor(private dataService: DataService) {
    console.log('constructor tab 4 allUserOrders: ', this.allUserOrders );
    //this.getUserOrders();
  }

  ngOnInit() {
  }

  getUserOrders(){
    this.dataService.getAllUserOrders().subscribe(res => {
      this.allUserOrders = res;
      console.log('Get User:', this.allUserOrders);
    });
  }

}
