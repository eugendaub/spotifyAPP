import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {DataService} from '../../services/data.service';
import {Storage} from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credentialsForm: FormGroup;


  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private dataService: DataService,
    private fb: FormBuilder,
    private storage: Storage) { }

  ngOnInit() {
    this.credentialsForm = this.fb.group({
      tableNr: ['44'],
      guests: ['2'],
      email: ['a@a.de', [Validators.email, Validators.required]],
      password: ['111111', [Validators.minLength(6), Validators.required]]
    });
  }

  async register() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    //console.log('Register');
    this.authService.signup(this.credentialsForm.value).then(_ => {
      loading.dismiss();
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
      //const logInUserEmail = this.authService.getUserEmail();
      //const logInUserId= this.authService.getUserId();
      //this.dataService.createOrderForUser(logInUserId, logInUserEmail);
    }, async err => {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Signup failed',
        message: 'Please try again later. Reason: ' + err,
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  async login() {
    await this.storageCreate();
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.login(this.credentialsForm.value).then(user => {
      //console.log(user);

      loading.dismiss();
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    }, async err => {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: err.message,
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  async storageCreate() {
    //console.log('create Storage');
    await this.storage.create();
    //console.log('create Storage end');
  }


}
