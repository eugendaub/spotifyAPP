import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import albums from '../../assets/mockdata/albums';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';

@Component({
  selector: 'app-album',
  templateUrl: './album.page.html',
  styleUrls: ['./album.page.scss'],
})
export class AlbumPage implements OnInit {
  data = null;
  sushiImageLink = '';

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService, private dataService: DataService) { }

  ngOnInit() {
    const title = this.activatedRoute.snapshot.paramMap.get('title');
    const decodedTitle = decodeURIComponent(title);
    this.data = albums [decodedTitle];
    console.log('this: ', decodedTitle);
  }

  // Helper function for image names
  dasherize(stri) {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    return stri.replace(/[A-Z]/g, function(char, index): string {
      return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
  };

  placeAnOrder(order){
    const logInUserEmail = this.authService.getUserEmail();
    const logInUserId= this.authService.getUserId();
    const titleEscaped = encodeURIComponent(order.title);
    console.log('titleEscape ', titleEscaped);;
    const img= this.dasherize(order.image);
    console.log('funktion IMF:', img);
    this.sushiImageLink = order.image;

    console.log('image Link: ', this.sushiImageLink);
    this.dataService.addOrderToUser(logInUserId, logInUserEmail,  order.title,  order.title , img);
  }

}
