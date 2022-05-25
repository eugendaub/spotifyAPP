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


  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
              private dataService: DataService, private toastCtrl: ToastController,
              private vibration: Vibration) { }

  ngOnInit() {
    const title = this.activatedRoute.snapshot.paramMap.get('title');
    const decodedTitle = decodeURIComponent(title);
    this.data = albums [decodedTitle];
    //console.log('this: ', decodedTitle);
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
    const img= this.dasherize(order.image);
    //this.presentToast();
    this.displayToast();
    this.dataService.addOrderToUser(logInUserId, logInUserEmail,  order.title,  order.title , img);
  }

  async presentToast() {
    this.vibration.vibrate(150);
    const toast = await this.toastCtrl.create({
      message: ' Ordered !',
      duration: 300
    });
    toast.present();
  }

  displayToast() {
    this.toastCtrl.create({
      message: 'Added order!',
      position: 'top',
      duration: 300,
      cssClass: 'toast-custom-class',

    }).then((toast) => {
      toast.present();
    });
  }

}
