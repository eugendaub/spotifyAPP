import {Component, ViewChild} from '@angular/core';
import {IonTabs} from '@ionic/angular';


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




  constructor() {}

  setSelectedTab(){
      console.log('CALLED');
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
}
