import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertController, LoadingController, ToastController} from '@ionic/angular';
import {AuthService} from '../../services/auth.service';
import {DataService} from '../../services/data.service';
import {Storage} from '@ionic/storage-angular';
import {BehaviorSubject, Subscription} from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  credentialsForm: FormGroup;
  credentialsAdmin: FormGroup;
  credentialsLogin: FormGroup;
  segmentStatus='login';
  private allLoginTables = [];
  private allTableObservable: Subscription;


  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private dataService: DataService,
    private fb: FormBuilder,
    private storage: Storage,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    this.credentialsForm = this.fb.group({
      tableNr: ['44'],
      guests: ['2'],
      email: ['a@a.de', [Validators.email, Validators.required]],
      password: ['111111', [Validators.minLength(6), Validators.required]]
    });
    this.credentialsLogin = this.fb.group({
      tableNr: ['44'],
      email: ['a@a.de', [Validators.email, Validators.required]],
      password: ['111111', [Validators.minLength(6), Validators.required]]
    });
    this.credentialsAdmin = this.fb.group({
      email: ['a@a.de', [Validators.email, Validators.required]],
      password: ['111111', [Validators.minLength(6), Validators.required]]
    });
  }


  // Regestriere/Erstelle ein Admin Account
  async registerAccount() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.authService.signup(this.credentialsAdmin.value).then(_ => {
      loading.dismiss();
      this.toastCtrl.create({
        message:  ' Admin account created successfully ! ',
        position: 'top',
        duration: 5000,
        cssClass: 'toast-custom-class-order',
      }).then((toast) => {
        toast.present();
      });
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

  // Logt sich mit entsprächenden Tisch nummer ein.
  async login() {
    console.log('LOGIN');
    //await this.storageCreate();
    const loading = await this.loadingCtrl.create();
    await loading.present();
    const loginTableNr = this.credentialsLogin.value.tableNr;

    this.authService.updateLoginTableNumber(loginTableNr);
    this.authService.setActiveTable(loginTableNr);
    this.allTableObservable = this.authService.getAllTables().subscribe(res => {
      this.allLoginTables = res;
      console.log(this.allLoginTables);

      const foundTable = this.allLoginTables.find(table => table.tableNr === loginTableNr);
      if(foundTable){
        console.log('gefunden');
        this.allTableObservable.unsubscribe();
        this.authService.login(this.credentialsLogin.value).then(_ => {
          //console.log(user);

          loading.dismiss();
          this.router.navigateByUrl('/tabs', {replaceUrl: true});
        }, async err => {
          console.log(err);
        });
      }else{
        console.log('nicht gefunden');

        this.toastCtrl.create({
          message:  ' Table was not found ',
          position: 'top',
          duration: 3000,
          cssClass: 'toast-custom-class-error',
        }).then((toast) => {
          toast.present();
        });
        this.allTableObservable.unsubscribe();
        loading.dismiss();
        }
    });

  }

  // Registriert/Erstellt ein Tisch und Login
  async createTableAndlogin() {
    console.log('Create Tabble');
    //await this.storageCreate();
    const loading = await this.loadingCtrl.create();
    await loading.present();
    const loginTableNr = this.credentialsForm.value.tableNr;

    this.authService.updateLoginTableNumber(loginTableNr);
    this.allTableObservable = this.authService.getAllTables().subscribe(res => {
      this.allLoginTables = res;
      console.log(this.allLoginTables);

      const foundTable = this.allLoginTables.find(table => table.tableNr === loginTableNr);
      if(foundTable){
        //console.log('Tisch existiert bereits');

        this.toastCtrl.create({
          message:  ' Table already exists ',
          position: 'top',
          duration: 5000,
          cssClass: 'toast-custom-class-error',
        }).then((toast) => {
          toast.present();
        });
        this.allTableObservable.unsubscribe();
        loading.dismiss();

      }else{
        console.log('Tisch noch nicht vorhanden');
        this.authService.signupForTable(this.credentialsForm.value).then(_ => {
          //console.log(user);

          loading.dismiss();
          this.router.navigateByUrl('/tabs', {replaceUrl: true});
        }, async err => {
          console.log(err);
        });
      }
    });

  }

  segmentChange(event: any){
    console.log(event.target.value);
    this.segmentStatus = event.target.value;
  }

  async storageCreate() {
    //console.log('create Storage');
    await this.storage.create();
    //console.log('create Storage end');
  }



}
