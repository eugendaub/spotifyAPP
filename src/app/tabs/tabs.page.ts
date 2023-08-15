import {Component, ViewChild} from '@angular/core';
import {IonTabs, NavController} from '@ionic/angular';
import {Router} from '@angular/router';
import {Tab4Page} from '../tab4/tab4.page';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';
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
  selectedTab = '';
  timeLeftProgressBar;
  timeLeftFormatted;
  runningTime;

  restaurantFabButtonStatus='restaurantFabButtonNormal';


  constructor(private navCtrl: NavController, private router: Router, private tab4Page: Tab4Page,
              private authService: AuthService , private dataService: DataService, private uiService: UiService) {

    this.uiService
      .getActiveTabs()
      .pipe(filter((tabs) => !!tabs))
      .subscribe((tabs) => {
        this.selectedTabs = tabs;
      });

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
      //console.log(this.runningTime);
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
    //console.log('TAB:',tabPath );
    if(tabPath==='tab1'){
      this.navCtrl.navigateRoot('/tabs/tab1');
    }else if(tabPath==='tab2'){
      this.navCtrl.navigateRoot('/tabs/tab2');
    }else if(tabPath==='tab3'){
      this.router.navigateByUrl('/tabs/tab3');
    }else if(tabPath==='tab4'){
      this.tab4Page.loadDates();
    }
  }
}
