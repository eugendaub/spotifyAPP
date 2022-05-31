import {Component, ElementRef, ViewChild} from '@angular/core';
import {IonTabs, NavController} from '@ionic/angular';
import {Router} from '@angular/router';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild(IonTabs) tabs: IonTabs;
  @ViewChild('clip', {static: false, read: ElementRef})fab: ElementRef;
  selected = '';
  progress = 47;
  waiteTime = 100;
  timeLeft: number = this.waiteTime;
  interval;
  orderSet = false;
  selectedTab = '';

  constructor(private navCtrl: NavController, private router: Router) {}


  setSelectedTab(){
      this.selected = this.tabs.getSelected();
  }

  async orderTimerPause() {
    console.log('PAUSE'   );
    this.orderSet = true;
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        console.log('time: ', this.timeLeft);
        this.timeLeft = this.timeLeft-10;
      } else {
        console.log('else Pause');
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

}
