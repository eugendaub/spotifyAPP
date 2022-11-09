import {Component, ViewChild} from '@angular/core';
import {IonTabs, NavController} from '@ionic/angular';
import {Router} from '@angular/router';
import {Tab4Page} from '../tab4/tab4.page';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';
import {Storage} from '@ionic/storage-angular';
import {UiService} from '../services/ui.service';
import {filter} from 'rxjs/operators';



@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild(IonTabs) tabs: IonTabs;

  selectedTabs = [];

  selected = '';
  progress = 47;
  waiteTime = 100;
  timeLeft: number = this.waiteTime;
  interval;
  orderSet = false;
  selectedTab = '';

  constructor(private navCtrl: NavController, private router: Router, private tab4Page: Tab4Page,
              private authService: AuthService , private dataService: DataService, private uiService: UiService) {

    this.uiService
      .getActiveTabs()
      .pipe(filter((tabs) => !!tabs))
      .subscribe((tabs) => {
        this.selectedTabs = tabs;
      });

  }




  setSelectedTab(){
      this.selected = this.tabs.getSelected();
  }

  async orderTimerPause() {
    this.temOrderView();
    //console.log('PAUSE'   );
    this.orderSet = true;
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        //console.log('time: ', this.timeLeft);
        this.timeLeft = this.timeLeft-10;
      } else {
        //console.log('else Pause');
        this.pauseOrderTimer();
      }
    },1000);
  }


  pauseOrderTimer() {
    this.orderSet= false;
    this.timeLeft = this.waiteTime;
    clearInterval(this.interval);
  }

  openTab1(){
    this.navCtrl.navigateRoot('/tabs/tab1');
  }
  openTab2(){
    this.navCtrl.navigateRoot('/tabs/tab2');
  }
  temOrderView(){
    //this.orderSet=true;
      this.router.navigateByUrl(`/tempOrderView`);
  }
  openUserOrder(){
    console.log('Tab4');
      this.tab4Page.loadDates();
  }

}
