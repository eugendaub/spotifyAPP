import { Component } from '@angular/core';
import suggestedSushi from '../../assets/mockdata/suggestedSushi.json';
import nigiriSushi from '../../assets/mockdata/nigiriSushi.json';
import uraMaki from '../../assets/mockdata/uraMaki.json';
import specialRolls from '../../assets/mockdata/specialRolls.json';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

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

  constructor(private router: Router, private authService: AuthService, private dataService: DataService) {}

  openAlbum(album) {
    const titleEscaped = encodeURIComponent(album.title);
    console.log('titleEscape ', titleEscaped);
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
    this.authService.logout();
  }
  deleteUser(){
    const userId = this.authService.getUserId();
    this.authService.deleteUser();
    this.dataService.deleteUserDocument(userId);
  }
}
