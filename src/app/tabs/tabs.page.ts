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


  constructor(private navCtrl: NavController, private router: Router, private tab4Page: Tab4Page,
              private authService: AuthService , private dataService: DataService, private uiService: UiService,
              private storage: Storage ) {

    this.uiService
      .getActiveTabs()
      .pipe(filter((tabs) => !!tabs))
      .subscribe((tabs) => {
        this.selectedTabs = tabs;
      });

    this.authService.ngInit();
    this.loadSettings();

    this.dataService.restaurantFabButtonStatus$.subscribe( status => {
      this.restaurantFabButtonStatus = status;
      //console.log('this.restaurantFabButtonStatus', this.restaurantFabButtonStatus );
    });
    //console.log('TABS COSNTRUKTOR');

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
  }

  async loadSettings() {
    this.allTabs = await this.uiService.getAvailableTabs();
    this.getTime();
    this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonHidden');
    //console.log('load Tabs ',this.allTabs);
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
    const time = this.dataService.getWaitTime().then(data =>{
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
      console.log(this.dataService.getRestaurantFabButtonStatus());
      this.router.navigateByUrl('/tabs/tab3');
    }else if(tabPath==='tab4'){
      this. checkRestaurantFabButtonStatus();
      this.tab4Page.loadDates();
    }
  }
  //Diese funktion hat nur einen zweck den Restaurant Fab-Button in der Küche zu deaktivieren
  checkRestaurantFabButtonStatus(){

    this.dataService.timeStatus$.subscribe( status => {
      console.log('TIMER ', status);
      this.timerOnOff = status;
    });

    this.dataService.totalOrderQuantityARound$.subscribe( status => {
      this.orderStatus = status;
      console.log('Status: ', this.orderStatus);
    });

    if (this.orderStatus  === 'orderRoundFull' && this.timerOnOff === 'off') {
      console.log('restaurantFabButtonFull');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonFull');
    }
    if (this.orderStatus  === 'orderRoundNotFull' || this.orderStatus  === 1  && this.timerOnOff === 'off') {
      console.log('restaurantFabButtonNormal');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonNormal');
    }
    if (this.orderStatus  === 'orderRoundFull' && this.timerOnOff === 'on') {
      console.log('restaurantFabButtonCountDown');
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
