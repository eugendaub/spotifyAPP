import {Component, OnInit} from '@angular/core';
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
  orderButtonDisabled;
  restaurantFabButtonStatus;
  timerOnOff;

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
              private dataService: DataService) {

    this.dataService.restaurantFabButtonStatus$.subscribe( status => {
      this.restaurantFabButtonStatus = status;
      this.onOffAddButton(this.restaurantFabButtonStatus);
      console.log('this.restaurantFabButtonStatus', this.restaurantFabButtonStatus );
    });

    this.dataService.timeStatus$.subscribe( status => {
      this.timerOnOff = status;
    });
  }

  // Aus-/Einschalter aktivieren/deaktivieren.
  onOffAddButton(status){
    console.log('on');
    if(status === 'restaurantFabButtonFull'){
      this.orderButtonDisabled='true';
    }else if(status === 'restaurantFabButtonNormal' ) {
      this.orderButtonDisabled = 'false';
    }
  }

  ngOnInit() {
    const title = this.activatedRoute.snapshot.paramMap.get('title');
    const decodedTitle = decodeURIComponent(title);
    this.data = albums [decodedTitle];
  }

  // Helper function for image names
  dasherize(stri) {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    return stri.replace(/[A-Z]/g, function(char, index): string {
      return (index !== 0 ? '-' : '') + char.toLowerCase();
    });
  };

  placeAnOrderTemp(order) {
    const logInUserEmail = this.authService.getUserEmail();
    const logInUserId = this.authService.getUserId();
    const userTableNr = this.authService.getUserTableNr();
    const img = this.dasherize(order.image);
    this.dataService.addTempOrder(logInUserId, logInUserEmail, order.title, order.title, img, userTableNr);
    this.orderButtonDisabled = this.dataService.addUpUserOrder();
    if (this.orderButtonDisabled === true && this.timerOnOff === 'off') {
      console.log('FUll');
      this.dataService.updateRestaurantFabButtonStatus('restaurantFabButtonFull');
    }
  }

}
