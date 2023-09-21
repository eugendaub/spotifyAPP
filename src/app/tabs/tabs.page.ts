import {Component, ViewChild} from '@angular/core';
import {IonTabs, NavController} from '@ionic/angular';
import {Router} from '@angular/router';
import {Tab4Page} from '../tab4/tab4.page';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';
import {UiService} from '../services/ui.service';
import {filter} from 'rxjs/operators';
import {Storage} from '@ionic/storage-angular';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild(IonTabs) tabs: IonTabs;

  selectedTabs = [];
  allTabs= [];
  newWaitTime;

  selected = '';
  selectedTab = '';
  timeLeftProgressBar;
  timeLeftFormatted;
  runningTime;
  actualWaitTime;
  timeInMin;
  timerOnOff;
  orderStatus;
  restaurantFabButtonStatus='restaurantFabButtonNormal';
  userOrderCountNumber = '0';
  tableNr;
  guestsNumber;
  images = [
    'assets/images/avatar.jpg',
    'assets/images/avatar2.jpg'
  ];
  currentImage: string = this.getRandomImage();



  constructor(private navCtrl: NavController, private router: Router, private tab4Page: Tab4Page,
              private authService: AuthService , private dataService: DataService, private uiService: UiService,
              private storage: Storage) {

    this.uiService
      .getActiveTabs()
      .pipe(filter((tabs) => !!tabs))
      .subscribe((tabs) => {
        this.selectedTabs = tabs;
      });

    this.authService.ngInit();
    this.loadSettings();

    this.dataService.restaurantFabButtonStatus$.subscribe( status => {
      //console.log('restaurantFabButtonStatus', status);
      this.restaurantFabButtonStatus = status;
      //console.log('this.restaurantFabButtonStatus', this.restaurantFabButtonStatus );
    });
    //console.log('TABS COSNTRUKTOR');

    /*this.authService.loginTableNumber$.subscribe( tableNr => {
      this.tableNr = tableNr;
    });*/



    this.dataService.runningTime$.subscribe(status => {
      const waitTime = this.dataService.aRoundTime;
      this.runningTime = status;

      // @ts-ignore
      this.timeLeftProgressBar = ( status / waitTime ) * 100 ;
      // Umwandlung in "mm:ss"-Format
      const minutes = Math.floor(this.runningTime / 60);
      const seconds = this.runningTime % 60;
      this.timeLeftFormatted = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
    });

    this.dataService.userOrderNumber$.subscribe( orderNumber => {
      this.userOrderCountNumber = orderNumber;
    });
  }

  async loadSettings() {
    //console.log('loadingSettings');
    this.allTabs = await this.uiService.getAvailableTabs();

    // Rufe die Funktion zum Abrufen der Zahl auf und abonniere das Observable
    this.authService.getActiveTable().subscribe(nr => {
      if (nr !== null) {
        // Hier kannst du die Zahl verwenden
        //console.log(`Die abgerufene Zahl ist: ${nr}`);
        this.tableNr = nr;
      } else {
        console.log('Es wurde keine Zahl abgerufen.');
      }
    });

    // Rufe die Funktion zum Abrufen der Zahl auf und abonniere das Observable
    this.authService.getActiveGuestsNumber().subscribe(nr => {
      if (nr !== null) {
        // Hier kannst du die Zahl verwenden
        //console.log(`Die abgerufene Zahl ist: ${nr}`);
        this.guestsNumber = nr;
      } else {
        console.log('Es wurde keine Zahl abgerufen.');
      }
    });
    this.getTime();
  }

  changeImage() {
    this.currentImage = this.getRandomImage();
  }

  getRandomImage(): string {
    const randomIndex = Math.floor(Math.random() * this.images.length);
    return this.images[randomIndex];
  }

  saveTabSelection(){
    const selected = this.allTabs.filter((tab)=>tab.selected);
    this.uiService.setSelectedTabs(selected);
    //console.log('Save klick', selected);
  }

  saveNewOrderWaitTime(){
    console.log( this.newWaitTime);
    this.dataService.setWaitTime(this.newWaitTime);
    this.getTime();
    this.formatTime(this.newWaitTime);
    this.newWaitTime='';
  }

  formatTime(time){
    // Umwandlung in "mm:ss"-Format
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    this.timeInMin = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  getTime(){
    this.dataService.getWaitTime().then(data =>{
      this.actualWaitTime = data;
      this.formatTime(data);
    });
  }

  padZero(num: number): string {
    return (num < 10) ? `0${num}` : `${num}`;
  }

  setSelectedTab(){
      this.selected = this.tabs.getSelected();
  }

  temOrderView(){
    //this.orderSet=true;
      this.router.navigateByUrl(`/tempOrderView`);
  }

  openTab(tabPath){


    if(tabPath==='tab1'){
      this. checkRestaurantFabButtonStatus();
      this.navCtrl.navigateRoot('/tabs/tab1');
    }else if(tabPath==='tab2'){
      this. checkRestaurantFabButtonStatus();
      this.navCtrl.navigateRoot('/tabs/tab2');
    }else if(tabPath==='tab3'){
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonHidden');
      //console.log(this.dataService.getRestaurantFabButtonStatus());
      this.router.navigateByUrl('/tabs/tab3');
    }else if(tabPath==='tab4'){
      this. checkRestaurantFabButtonStatus();
      this.tab4Page.loadDates();
    }else if(tabPath==='tabSeeAllTabel') {
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonHidden');
      this.navCtrl.navigateRoot('/tabs/tabSeeAllTabel');
    }
  }
  //Diese funktion hat nur einen zweck den Restaurant Fab-Button in der Küche zu deaktivieren
  checkRestaurantFabButtonStatus(){

    this.dataService.timeStatus$.subscribe( status => {
     // console.log('TIMER ', status);
      this.timerOnOff = status;
    });

    this.dataService.totalOrderQuantityARound$.subscribe( status => {
      this.orderStatus = status;
      //console.log('Status: ', this.orderStatus);
    });

    if (this.orderStatus  === 'orderRoundFull' && this.timerOnOff === 'off') {
      //console.log('restaurantFabButtonFull');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonFull');
    }
    if (this.orderStatus  === 'orderRoundNotFull' || this.orderStatus  >= 1  && this.timerOnOff === 'off') {
      //console.log('restaurantFabButtonNormal');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonNormal');
    }
    if (this.orderStatus  === 'orderRoundFull' && this.timerOnOff === 'on') {
      //console.log('restaurantFabButtonCountDown');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonCountDown');
    }
    if (this.orderStatus  === 'orderRoundNotFull' && this.timerOnOff === 'on') {
      //console.log('restaurantFabButtonCountDown');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonCountDown');
    }
  }

  logout(){
    this.storage.clear();
    this.dataService.deleteCompleteTempOrder();
    this.authService.logout();
  }

  deleteUser(){
    this.dataService.deleteCompleteTempOrder();
    this.storage.clear();
    const userId = this.authService.getUserId();
    this.authService.deleteUser();
    this.dataService.deleteUserDocument(userId);
  }
}
