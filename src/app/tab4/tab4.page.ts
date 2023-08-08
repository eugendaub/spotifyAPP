import { Component, OnInit } from '@angular/core';
import {DataService} from '../services/data.service';
import {Storage} from '@ionic/storage-angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  allUserOrders: any = [];
  events: any[] = [];

  constructor(private dataService: DataService, private storage: Storage) {}

  ngOnInit() {
    this.storageCreate();
  }

  getUserOrders(){
    this.dataService.getAllUserOrders().subscribe(res => {
      this.allUserOrders = res;
    });
  }

  async loadDates() {
    this.events = await this.dataService.getData();
  }

  // Löscht eine Bestellung (wird zur Testzweken benötigt)
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

}
