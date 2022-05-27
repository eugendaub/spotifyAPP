import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import albums from '../../assets/mockdata/albums';
import {AuthService} from '../services/auth.service';
import {DataService} from '../services/data.service';
import {ToastController} from '@ionic/angular';
import {Vibration} from '@ionic-native/vibration/ngx';


@Component({
  selector: 'app-album',
  templateUrl: './album.page.html',
  styleUrls: ['./album.page.scss'],
})
export class AlbumPage implements OnInit {
  data = null;
  userOrderCount = this.authService.getGuestsNumber();


  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
              private dataService: DataService, private toastCtrl: ToastController,
              private vibration: Vibration) {
    console.log('album construktor ');
  }

  ngOnInit() {
    const title = this.activatedRoute.snapshot.paramMap.get('title');
    const decodedTitle = decodeURIComponent(title);
    this.data = albums [decodedTitle];
    console.log('album ngininit ');
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
    const usertTableNr = this.authService.getUserTableNr();
    const guestsNumber = this.authService.getGuestsNumber();
    const img= this.dasherize(order.image);
    if(this.userOrderCount !==0){
      this.orderToast();
      this.userOrderCount--;
      console.log('guestsNumber', guestsNumber);
      console.log('userOrderCount', this.userOrderCount);
    }else{
      this.orderFullToast();
    }


    this.dataService.addOrderToUser(logInUserId, logInUserEmail,  order.title,  order.title , img, usertTableNr);
  }

  orderToast() {
    this.vibration.vibrate(75);
    this.toastCtrl.create({
      message: 'Added order! still '+ this.userOrderCount,
      position: 'top',
      duration: 800,
      cssClass: 'toast-custom-class-order',

    }).then((toast) => {
      toast.present();
    });
  }
  orderFullToast() {
    this.vibration.vibrate(75);
    this.toastCtrl.create({
      message: 'Order Full!',
      position: 'top',
      duration: 2500,
      cssClass: 'toast-custom-class',

    }).then((toast) => {
      toast.present();
    });
    this.userOrderCount = this.authService.getGuestsNumber();
  }

}
