import { Component } from '@angular/core';
import suggestedSushi from '../../assets/mockdata/suggestedSushi.json';
import nigiriSushi from '../../assets/mockdata/nigiriSushi.json';
import uraMaki from '../../assets/mockdata/uraMaki.json';
import specialRolls from '../../assets/mockdata/specialRolls.json';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';
import {Storage} from '@ionic/storage-angular';
import {UiService} from '../services/ui.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  allTabs= [];
  data =[
    {
      title: 'Suggested Sushi',
      albums: suggestedSushi
    },
    {
      title: 'Nigiri Sushi',
      albums: nigiriSushi
    },
    {
      title: 'Ura Maki',
      albums: uraMaki
    },
    {
      title: 'Special Rolls',
      albums: specialRolls
    }
  ];
  // mehrere Bilder pro Seite darstellen
  optsHorizontalScroll= {
    slidesPerView: 2.4,
    slidesOffsetBefore: 20,
    spaceBetween: 20,
    freeMode: true
  };

  constructor(private router: Router, private authService: AuthService, private dataService: DataService,
              private storage: Storage, private uiService: UiService) {
    //console.log('TAB 1 Constructor:');
    this.authService.ngInit();
    this.loadSettings();
  }

  async loadSettings() {
    this.allTabs = await this.uiService.getAvailableTabs();
    //console.log('load Tabs ',this.allTabs);

  }

  saveTabSelection(){
    const selected = this.allTabs.filter((tab)=>tab.selected);
    this.uiService.setSelectedTabs(selected);
    //console.log('Save klick', selected);
  }

  openAlbum(album) {
    const titleEscaped = encodeURIComponent(album.title);
    //console.log('titleEscape ', titleEscaped);
    this.router.navigateByUrl(`/tabs/tab1/${titleEscaped}`);
  }

  // Helper function for image names
  // eslint-disable-next-line id-blacklist
  dasherize(string) {
    // eslint-disable-next-line id-blacklist,prefer-arrow/prefer-arrow-functions
    return string.replace(/[A-Z]/g, function(char, index) {
      return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
  };

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
