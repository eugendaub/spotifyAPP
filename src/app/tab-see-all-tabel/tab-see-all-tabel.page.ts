import { Component, OnInit } from '@angular/core';
import {DataService} from '../services/data.service';
import {Storage} from '@ionic/storage-angular';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-tab-see-all-tabel',
  templateUrl: './tab-see-all-tabel.page.html',
  styleUrls: ['./tab-see-all-tabel.page.scss'],
})
export class TabSeeAllTabelPage implements OnInit {
  allTabel = [];

  constructor( private dataService: DataService,  private storage: Storage,
               private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.storageCreate();
    this.dataService.getAllTables().subscribe(res => {
      this.allTabel = res;
      console.log(this.allTabel);
    });
  }

  async storageCreate() {
    console.log('create Storage');
    await this.storage.create();
    //console.log('create Storage end');
  }


  openTableOrder(table) {
    const titleEscaped = encodeURIComponent(table.email);
    //console.log('titleEscape ', titleEscaped);
    this.router.navigateByUrl(`/tabs/tab2/${titleEscaped}`);
  }

  // Lösche einen Tisch komplett
  deleteTable(tableId){
    console.log(tableId.id);
   // this.authService.deleteUser();
    this.dataService.deleteUserDocument(tableId.id);
  }


  deleteUser(){
    this.dataService.deleteCompleteTempOrder();
    this.storage.clear();
    const userId = this.authService.getUserId();
    this.authService.deleteUser();
    this.dataService.deleteUserDocument(userId);
  }
}
