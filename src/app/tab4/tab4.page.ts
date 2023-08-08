import { Component, OnInit } from '@angular/core';
import {DataService} from '../services/data.service';
import {Storage} from '@ionic/storage-angular';
const STORAGE_KEY = 'mylist';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  allUserOrders: any = [];
  events: any[] = [];


  constructor(private dataService: DataService, private storage: Storage) {
   // console.log('constructor tab 4 allUserOrders: ', this.allUserOrders );
    //this.loadDates();
  }

  ngOnInit() {
    //console.log('ngOnInit TAB 4', this.dataService.getRestaurantFubButtonStatus());
    this.storageCreate();
  }

  getUserOrders(){
    this.dataService.getAllUserOrders().subscribe(res => {
      this.allUserOrders = res;
      //console.log('Get User:', this.allUserOrders);
    });
  }
  async loadDates() {
   // console.log('tab 4 loadDates');
    this.events = await this.dataService.getData();
  }

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

  resetLocalStorage(){
    this.storage.clear();
    this.storage.get(STORAGE_KEY);
    this.loadDates();
  }

}
