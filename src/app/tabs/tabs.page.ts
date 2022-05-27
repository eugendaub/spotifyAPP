import {Component, ViewChild} from '@angular/core';
import {IonTabs, NavController} from '@ionic/angular';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild(IonTabs) tabs: IonTabs;
  selected = '';
  progress = 47;

  waiteTime = 100;
  timeLeft: number = this.waiteTime;
  interval;
  orderSet =false;
  selectedTab='';


  constructor(private navCtrl: NavController) {}

  setSelectedTab(){
      this.selected = this.tabs.getSelected();
  }

  async orderTimerPause() {
    this.orderSet = true;
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft = this.timeLeft-10;
      } else {
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
}
