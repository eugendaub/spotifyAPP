import { Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, addDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove,
  serverTimestamp, query, orderBy, docData, where,documentId
} from '@angular/fire/firestore';
import {AuthService} from './auth.service';
import {switchMap} from 'rxjs/operators';
import {ToastController} from '@ionic/angular';
import {Vibration} from '@ionic-native/vibration/ngx';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';

// wird für die zwischen bestellungen verwendet in Tab4
const STORAGE_KEY = 'mylist';

export interface IUserOrder {
  tempId?: number;
  userid: string;
  userEmail: string;
  userTableNr: string;
  title: string;
  text: string;
  createdAt: string;
  imageLink: string;
}

@Injectable({
  providedIn: 'root'
})

export class DataService {

  userOrderId = null;
  orderCount = 0;
  count = 0;
  oneRoundNumber = 2;
  userOrderCount = 0;
  currentDate: string;
  private tempOrder: IUserOrder[]=[];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  guestsNumber;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  oneOrderTotalNumber;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restaurentFabButtonStatus: any;

  //restaurant Fab-Button Status
  private restaurantFabButtonSubject: BehaviorSubject<string> = new BehaviorSubject<string>('restaurantFabButtonNormal');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restaurantFabButtonStatus$ = this.restaurantFabButtonSubject.asObservable();

  // Laufzeit
  private runningTime: BehaviorSubject<string> = new BehaviorSubject<string>('100');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  runningTime$ = this.runningTime.asObservable();

  // Laufzeit status an/aus
  private timeStatus: BehaviorSubject<string> = new BehaviorSubject<string>('off');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  timeStatus$ = this.timeStatus.asObservable();

  // Total Order Quantity A Round
  private totalOrderQuantityARoundSubject: BehaviorSubject<string> = new BehaviorSubject<string>('orderRoundNotFull');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  totalOrderQuantityARound$ = this.totalOrderQuantityARoundSubject.asObservable();

  // Order Button
  private orderButtonSubject: BehaviorSubject<string> = new BehaviorSubject<string>('orderNowButtonOn');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  orderButton$ = this.orderButtonSubject.asObservable();

  constructor(private firestore: Firestore, private authService: AuthService, private toastCtrl: ToastController,
              private vibration: Vibration, private storage: Storage) { }

  // Holt alle Bestellunge aus Db für die Küche
  getAllOrderId(){
    const notesRef = collection(this.firestore, 'orders');
    return collectionData(notesRef, { idField: 'id'});
  }

  updateRestaurantFabButtonStatus(status: string) {
    this.restaurantFabButtonSubject.next(status);
  }

  updateRunningTime(status) {
    this.runningTime.next(status);
  }

  updateTimerStatus(status) {
    this.timeStatus.next(status);
  }

  updateOrderButtonStatus(status) {
    this.orderButtonSubject.next(status);
  }

  updateTotalOrderQuantityARound(status) {
    this.totalOrderQuantityARoundSubject.next(status);
  }

  // Hier werden die bestellungen pro Runde erfasst.
  addUpUserOrder(){
    this.guestsNumber = this.authService.getGuestsNumber();
    this.oneOrderTotalNumber = this.guestsNumber * this.oneRoundNumber -1;
    if( this.oneOrderTotalNumber > this.userOrderCount){
      this.orderToast();
      this.userOrderCount++;
      console.log(this.userOrderCount);
      this.updateTotalOrderQuantityARound(this.userOrderCount);
      return false;
    }else{
      this.userOrderCount++;
      console.log(this.userOrderCount);
      this.updateTotalOrderQuantityARound('orderRoundFull');
      this.orderFullToast();
     return true;
    }
  }

  // Sollte eine Bestelung aus dem Temp-order-view-page enfernt werden so wird es hier erfasst.
  oneOrderDeleteMinusCount(){
    this.userOrderCount--;
  }

  // Poppt bei jeder hinzugefügten ware auf und zeigt die verbliebende Bestellanzahl an.
  orderToast() {
    this.oneOrderTotalNumber = (this.guestsNumber * this.oneRoundNumber -1) - (this.userOrderCount) ;
    this.vibration.vibrate(75);
    this.toastCtrl.create({
      message: 'Added order! still: '+ this.oneOrderTotalNumber,
      position: 'top',
      duration: 1500,
      cssClass: 'toast-custom-class-order',
    }).then((toast) => {
      toast.present();
    });
  }

  // Poppt auf falls die Bestellanzahl erreicht ist.
  orderFullToast() {
    this.vibration.vibrate(275);
    this.toastCtrl.create({
      message: 'Order Full!',
      position: 'top',
      duration: 2500,
      cssClass: 'toast-custom-class',
    }).then((toast) => {
      toast.present();
    });
  }

  getAllUserOrders(){
    console.log('getAllUserOrders');
    const userId= this.authService.getUserId();
    const userRef = doc(this.firestore, `users/${userId}`);
    return docData(userRef).pipe(
      switchMap(data => {
       // console.log('Data: ', data.userOrders);
        if(!data){
          //console.log('Data leer: ');
        }
        const allUserOrders = data.allUserOrders;
        const chatsRef = collection(this.firestore, 'userOrders');
        const q = query(chatsRef, where(documentId(), 'in', allUserOrders));
        return collectionData(q, { idField: 'id' });
      }),
      //take(1)
    );
  }

  // Hier wird der User/Table mit Bestellugen gelöscht
  deleteUserDocument(userId) {
    console.log('deleteUserDoc');
    const noteDocRef = doc(this.firestore, `users/${userId}`);
    return deleteDoc(noteDocRef);
  }

  // Löscht eine Bestellung von der Küche (Tab3) aus.
  deleteOrderAndUserOrders(note) {
    const userId = this.authService.getUserId();
    const orderRef = doc(this.firestore, `orders/${note.id}`);
    return deleteDoc(orderRef)
      .then(_res => {
        const userRef = doc(this.firestore, `users/${userId}`);
        return updateDoc(userRef, {
          userOrders: arrayRemove(note.id)
        });
      });
  }

  // Löscht alle Bestellugen von der DB (wird zur Testzwecken in Tab3/Küche benutzt )
  deleteAllUserOrdersFromDB(){
    const userId= this.authService.getUserId();
    const userRef = doc(this.firestore, `users/${userId}`);
    console.log('userId: ', userId);
    return docData(userRef).pipe(
      switchMap(data => {
        console.log('Data: ', data.userOrders);
        if(!data){
          console.log('Data leer: ');
        }
        const allUserOrders = data.allUserOrders;
        const chatsRef = collection(this.firestore, 'userOrders');
        const q = query(chatsRef, where(documentId(), 'in', allUserOrders));
        return collectionData(q, { idField: 'id' });
      }),
      //take(1)
    );
  }

  addOrderToUser(logInUserId,logInUserEmail, text, title, sushiImageLink, usertTableNr){
    console.log('addOrderToUser');
    const chatsRef = collection(this.firestore, 'orders');
    const userOrder = {
      userid: logInUserId,
      userEmail: logInUserEmail,
      userTableNr: usertTableNr,
      title,
      text,
      createdAt: serverTimestamp(),
      imageLink: sushiImageLink
    };

    return addDoc(chatsRef, userOrder).then( res => {
     // console.log('created order ADDDOC: ', res);
      const groupID = res.id;
      const promises = [];

      // In der DB muss für jeden user der DB eintrag angepasst werden
      // (in diesem Fall in welchen Chats befindet sich der User)

      const userChatsRef = doc(this.firestore, `users/${logInUserId}`);
      const update = updateDoc(userChatsRef, {
        userOrders: arrayUnion(groupID)
      });
      promises.push(update);
      return Promise.all(promises);
    });
  }

  // Hier werden alle Bestellugen von einem Tisch aufgerufen (Tab 4)
  getLocalTableOrders() {
    return this.storage.get(STORAGE_KEY) || [];
  }

  // löscht eine Bestellug von dem aktuellem User (wird in Tab4/All orders verwendet) (DIENT ZUR TESTZWECKEN )
  async remvoveItem(index) {
    const storedData = await this.storage.get(STORAGE_KEY) || [];
    storedData.splice(index, 1);
    return this.storage.set(STORAGE_KEY, storedData);
  }

  // Hier wird eine Temporere Bestellung erfasst
  addTempOrder(logInUserId,logInUserEmail, text, title, sushiImageLink, userTableNr){
    //this.currentDate = new Date().toISOString();
    const order: IUserOrder = {
      tempId: this.orderCount,
      userid: logInUserId,
      userEmail: logInUserEmail,
      userTableNr,
      title,
      text,
      createdAt: new Date().toISOString(),
      imageLink: sushiImageLink
    };
    this.tempOrder.push(order);
    //console.log('Array: ', this.tempOrder);
    this.orderCount++;
  }

  // Hiermit wird eine Bestellung aus Temp-order-view-page gelöscht
  deleteTempOrder(deleteNumber){
    const index = this.tempOrder.findIndex((obj) =>obj.tempId ===deleteNumber);
    if (index > -1) {
      this.tempOrder.splice(index, 1);
    }
  }

  // Nach einer bestellung werden alle Temporeren Bestelluge storniert/gelöscht
  async deleteCompleteTempOrder() {
    this.tempOrder=[];
    this.userOrderCount=0;
  }

  // Hiermit werden alle Bestellungen die in Temp-order-view-page vorhanden sind in der DB abgespeichert
  async addTempOrderToDB() {
    const ordersRef = collection(this.firestore, 'orders');
    const logInUserId = this.authService.getUserId();
    for (const order of this.tempOrder) {
      addDoc(ordersRef, order).then(res => {
        const groupID = res.id;
        const promises = [];
        this.addLocalTableOrders(order);
        const userChatsRef = doc(this.firestore, `users/${logInUserId}`);
        const update = updateDoc(userChatsRef, {
          userOrders: arrayUnion(groupID)
        });
        promises.push(update);
        return Promise.all(promises);
      });
    }
  }

  // Hiermit werden die Bestellungen von einem Tisch lockal abgespeichert.
  async addLocalTableOrders(order: IUserOrder) {
    const dates = await this.storage.get(STORAGE_KEY) || [];
    dates.push(order);
    return this.storage.set(STORAGE_KEY, dates);
  }

  //  !!!!!!! ACHTUNG  wird nicht verwendet (muss einmal benutzt werden)  ACHTUNG !!!!!!!!
  createOrderForUser(logInUserId,logInUserEmail){
    const chatsRef = collection(this.firestore, 'orders');
    const chat = {
      userid: logInUserId,
      userEmail: logInUserEmail
    };

    return addDoc(chatsRef, chat).then( res => {
      console.log('created order ADDDOC: ', res);
      const groupID = res.id;
      const promises = [];

      const userChatsRef = doc(this.firestore, `users/${logInUserId}`);
      const update = updateDoc(userChatsRef, {
        userOrders: arrayUnion(groupID)
      });
      promises.push(update);
      return Promise.all(promises);
    });
  }

  // Holt alle Bestellunge aus Db mit Zeitstempel für die Küche
  getOrderByCreatedTime(){
    const messages = collection(this.firestore, `orders`);
    const q = query(messages, orderBy('createdAt'));
    return collectionData(q, {idField: 'id'});
  }

  // Holt alle Temporere Bestellungen (benutzt in Temp-order-view-page)
  getTemporaraOrder(): IUserOrder[]{
    return this.tempOrder;
  }
}
