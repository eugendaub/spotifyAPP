import { Component } from '@angular/core';
// import Swiper core and required modules
import SwiperCore from 'swiper';
import softDrinks from '../../assets/mockdata/softDrinkCollections.json';
import sakeDrinks from '../../assets/mockdata/sakeCollections.json';
import beerDrinks from '../../assets/mockdata/beerCollections.json';
import {Router} from "@angular/router";



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  slideOpts = {
    initialSlide: 1,
    speed: 400
  };

  softDrinkCollections = [
    {
      title: 'Soft Drinks',
      albums: softDrinks
    }
  ];
  sakeCollections = [
    {
      title: 'Sake',
      albums: sakeDrinks
    }
  ];
  beerCollections = [
    {
      title: 'Beer',
      albums: beerDrinks
    }
  ];


  constructor( private router: Router) {}

  onSwiper([swiper]) {
    console.log(swiper);
  }
  onSlideChange() {
    console.log('slide change');
  }

  // Helper function for image names
  // eslint-disable-next-line id-blacklist
  dasherize(string) {
    // eslint-disable-next-line id-blacklist,prefer-arrow/prefer-arrow-functions
    return string.replace(/[A-Z]/g, function(char, index) {
      return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
  };
  openAlbum(album) {
    const titleEscaped = encodeURIComponent(album.title);
    console.log('titleEscape ', titleEscaped);
    this.router.navigateByUrl(`/tabs/tab1/${titleEscaped}`);
  }

}
