import { Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, addDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove,
  query, orderBy, docData, where,documentId, getDocs
} from '@angular/fire/firestore';
import {AuthService} from './auth.service';
import {switchMap} from 'rxjs/operators';
import {ToastController} from '@ionic/angular';
import {Vibration} from '@ionic-native/vibration/ngx';
import { Storage } from '@ionic/storage-angular';
import {BehaviorSubject, Observable} from 'rxjs';
import {Preferences} from '@capacitor/preferences';

// wird für die zwischen bestellungen verwendet in Tab4
const STORAGE_KEY = 'mylist';
const STORAGE_TIME_KEY = 'wait-Time';

export interface IUserOrder {
  tempId?: number;
  userTableNr: string;
  title: string;
  text: string;
  createdAt: string;
  timeExpired: number;
  imageLink: string;
  expired: string;
  price: number;
}

export interface IOrder {
  tableNr: string;
  title: string;
  createdAt: string;
  price: number;
  imageLink: string;
}

@Injectable({
  providedIn: 'root'
})

export class DataService {

  table: Observable<any>;
  userOrderId = null;
  orderCount = 0;
  count = 0;
  oneRoundNumber = 2;
  userOrderCount = 0;
  currentDate: string;
  userOrderCountDownNumber=0;
  private tempOrder: IUserOrder[]=[];
  private userOrders: IOrder[]=[];
  // eslint-disable-next-line @typescript-eslint/member-ordering
  guestsNumber;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  oneOrderTotalNumber;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restaurentFabButtonStatus: any;
  // Angabe in secunden
  // eslint-disable-next-line @typescript-eslint/member-ordering
  aRoundTime = 60;
  // eslint-disable-next-line @typescript-eslint/member-ordering
  defaultWaitTime = 10;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  isTimerFinished = false;

  ///////////||||||||| Vier Buttons Status brauchst du die alle oder reichen schon eins/zwei? |||||||||||/////////////

  //restaurant Fab-Button Status
  private restaurantFabButtonSubject: BehaviorSubject<string> = new BehaviorSubject<string>('restaurantFabButtonNormal');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restaurantFabButtonStatus$ = this.restaurantFabButtonSubject.asObservable();

  // Total Order Quantity A Round
  private totalOrderQuantityARoundSubject: BehaviorSubject<string> = new BehaviorSubject<string>('orderRoundNotFull');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  totalOrderQuantityARound$ = this.totalOrderQuantityARoundSubject.asObservable();

  // Order Button
  private orderButtonSubject: BehaviorSubject<string> = new BehaviorSubject<string>('orderNowButtonOn');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  orderButton$ = this.orderButtonSubject.asObservable();

  // User Order Number
  private userOrderNumberSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  userOrderNumber$ = this.userOrderNumberSubject.asObservable();

  //////////////////////////////////////////|||||||||ENDE|||||||||||///////////////////////////////////////////////////

  private waitARoundTimeSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  waitTimeSubject = this.waitARoundTimeSubject.asObservable();

  // Laufzeit
  private runningTime: BehaviorSubject<string> = new BehaviorSubject<string>('aRoundTime');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  runningTime$ = this.runningTime.asObservable();

  // Laufzeit status an/aus
  private timeStatus: BehaviorSubject<string> = new BehaviorSubject<string>('off');
  // eslint-disable-next-line @typescript-eslint/member-ordering
  timeStatus$ = this.timeStatus.asObservable();

  constructor(private firestore: Firestore, private authService: AuthService, private toastCtrl: ToastController,
              private vibration: Vibration, private storage: Storage) {
    this.table=null;
    this.loadWaitTime();
    //this.loadUserOrderNumber();
  }

  // Holt alle Bestellunge aus Db für die Küche
  getAllOrderId(){
    const notesRef = collection(this.firestore, 'orders');
    return collectionData(notesRef, { idField: 'id'});
  }

  updateRestaurantFabButtonStatus(status: string) {
    this.restaurantFabButtonSubject.next(status);
  }

  getRestaurantFabButtonStatus() {
    return this.restaurantFabButtonSubject.value;
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
    console.log('Button Status : ', status);
    this.totalOrderQuantityARoundSubject.next(status);
  }

  //Aktualisiert die Bestellzahl
  updateUserOrderNumber(status) {
    console.log('updateUserOrderNumber' , status);
    this.userOrderNumberSubject.next(status);
  }

  // Hier werden die bestellungen pro Runde erfasst.
  addUpUserOrder(tableNr, guestsNumber){
    console.log('ADD UP');
    //this.guestsNumber = this.authService.getGuestsNumber2(tableNr);
    const x: number =guestsNumber;
    console.log(guestsNumber);
    this.oneOrderTotalNumber = guestsNumber * this.oneRoundNumber -1;
    const xCount = guestsNumber * this.oneRoundNumber;
    console.log(  this.oneOrderTotalNumber);
    if( this.oneOrderTotalNumber > this.userOrderCount){
      //this.orderToast();
      this.userOrderCount++;


      this.userOrderCountDownNumber--;
      console.log('Count: ', xCount +  this.userOrderCountDownNumber);
      this.updateTotalOrderQuantityARound(this.userOrderCount);
      console.log(this.userOrderCountDownNumber);
      this.updateUserOrderNumber( xCount + this.userOrderCountDownNumber);
      return false;
    }else{
      console.log('addUpUserOrder True:' ,this.userOrderCount);
      this.userOrderCount++;
      console.log(this.userOrderCount);
      this.userOrderCountDownNumber--;
      this.updateUserOrderNumber(xCount + this.userOrderCountDownNumber);
      this.updateTotalOrderQuantityARound('orderRoundFull');
      this.orderFullToast();
      return true;
    }
  }

  // Sollte eine Bestelung aus dem Temp-order-view-page enfernt werden so wird es hier erfasst.
  oneOrderDeleteMinusCount(){
    let userOrderCountNumber: any = 0;
    this.userOrderNumber$.subscribe( orderNumber => {
      userOrderCountNumber = orderNumber;
    });
    console.log('oneOrderTotalNumber: ',this.oneOrderTotalNumber);
    console.log('ORDER NUMBER --', userOrderCountNumber);
    if(userOrderCountNumber===0){
      this.updateUserOrderNumber(1);
      this.userOrderCount--;
      console.log('Bestellung von null -1: ',this.oneOrderTotalNumber-1);
      this.updateTotalOrderQuantityARound( this.oneOrderTotalNumber);
    }else{
      this.userOrderCount--;
      this.updateUserOrderNumber(userOrderCountNumber+1);
      console.log('Bestellung Minus: ',this.oneOrderTotalNumber-userOrderCountNumber+1);
      this.updateTotalOrderQuantityARound( this.oneOrderTotalNumber-userOrderCountNumber+1);
    }
    //this.userOrderCount--;
    //this.userOrderCountDownNumber++;
    //this.updateUserOrderNumber(this.userOrderCountDownNumber);
  }



  // Poppt bei jeder hinzugefügten ware auf und zeigt die verbliebende Bestellanzahl an.
  orderToast() {
    this.oneOrderTotalNumber = (this.guestsNumber * this.oneRoundNumber -1) - (this.userOrderCount) ;
    this.vibration.vibrate(75);
    this.toastCtrl.create({
      message:  this.oneOrderTotalNumber + ' orders left',
      position: 'top',
      duration: 1000,
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

  // Holt alle Bestellungen aus table Arrray
  getAllUserOrders(tableId){
    console.log('getAllUserOrders');
    const userRef = doc(this.firestore, `table/${tableId}`);
    return docData(userRef).pipe(
      switchMap(data => {
       // console.log('Data: ', data.userOrders);
        if(!data){
          //console.log('Data leer: ');
        }
        // Falsch oder data.allUserOrders;??
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
    const noteDocRef = doc(this.firestore, `table/${userId}`);
    //const noteCollectionRef = collection(this.firestore ,`table/${userId}`);
    //return deleteDoc(noteDocRef);
    return noteDocRef;
  }

  // Hier wird der User/Table mit Bestellugen gelöscht
  deleteUserDocumentWithOrderID(userId, orderId) {
    console.log('deleteUserDoc' ,orderId);
    //const noteDocRef = doc(this.firestore, `table/${userId}/orders`);
    const noteCollectionRef = collection(this.firestore ,`table/${userId}`);
    //return deleteDoc(noteDocRef);
    return noteCollectionRef;
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
  addTempOrder(text, title, sushiImageLink, userTableNr ,price){
    //this.currentDate = new Date().toISOString();
    const order: IUserOrder = {
      tempId: this.orderCount,
      userTableNr,
      title,
      text,
      timeExpired : Date.now(),
      createdAt: new Date().toISOString(),
      imageLink: sushiImageLink,
      expired: 'active',
      price
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
  async deleteCompleteTempOrder(){
    this.tempOrder=[];
    this.userOrderCount=0;
  }

  // Hiermit werden alle Bestellungen die in Temp-order-view-page vorhanden sind in der DB abgespeichert
  async addTempOrderToDB() {
    console.log('addTempOrderToDB');
    const ordersRef = collection(this.firestore, 'orders');
    for (const order of this.tempOrder) {
      console.log(order);
      addDoc(ordersRef, order).then(res => {
        console.log('res.id: ', res.id);
        const underOrder: IOrder = {
          tableNr: order.userTableNr,
          title : order.title,
          createdAt : new Date().toISOString(),
          price: order.price,
          imageLink: order.imageLink
        };
        //return this.addOrderToTable(underOrder, order.userTableNr );
        const promises = [];
        const userChatsRef = doc(this.firestore, `table/${order.userTableNr}`);
        const update = updateDoc(userChatsRef, {
          userOrders: arrayUnion(underOrder)
        });
        promises.push(update);
        return Promise.all(promises);
      });
    }
  }


  //Fügt bestellungen zu den User in einen zusätzlichen Dokument hinzu
  addUserOrders(order){
    const tableNr = this.authService.getTableNr();
    console.log(tableNr);
    const userOrderRef = collection(this.firestore, `table/${tableNr}/orders`);
    return addDoc( userOrderRef, {
      order
    });
  }

  // Hiermit werden die Bestellungen von einem Tisch lockal abgespeichert.
  /*async addLocalTableOrders(order: IUserOrder) {
    const dates = await this.storage.get(STORAGE_KEY) || [];
    dates.push(order);
    return this.storage.set(STORAGE_KEY, dates);
  }*/

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

  async setWaitTime(time: any) {
    await Preferences.set({ key: STORAGE_TIME_KEY, value: JSON.stringify(time) });
    this.waitARoundTimeSubject.next(time);
    this.aRoundTime = time;
  }


  async getWaitTime() {
    const { value } = await Preferences.get({ key: STORAGE_TIME_KEY });
    if (value) {
      return JSON.parse(value);
    } else {
      return this.defaultWaitTime;
    }
  }

  getActiveWaitTime(){
    return this.waitTimeSubject;
  }

  async loadWaitTime(){
    const time = await this.getWaitTime();
    this.waitARoundTimeSubject.next(time);
    this.aRoundTime = time;
  }
  //wird nur einmal aufgerufen bei Tisch/Account erstellung  bzws. Login
  async loadUserOrderNumber(){
    // Timer starten ich muss den Timer hier einfügen ,weil die this.authService.getGuestsNumber()
    // funktion erst später aufgerufen wird und es zu einem Error kommt.
    setTimeout(() => {
      console.log('Der Timer ist abgelaufen!');
      this.guestsNumber = this.authService.getGuestsNumber();
      console.log(this.guestsNumber);
      this.userOrderCountDownNumber = this.guestsNumber * this.oneRoundNumber;
      this.userOrderNumberSubject.next(this.userOrderCountDownNumber.toString());
    }, 3000); // Timer läuft 1 Sekunde
  }

  // Wird nach jeder Bestellung aufgerufen.
  async loadUserOrderNumberNow(){
      this.guestsNumber = this.authService.getGuestsNumber();
      console.log(this.guestsNumber);
      this.userOrderCountDownNumber = this.guestsNumber * this.oneRoundNumber;
      this.userOrderNumberSubject.next(this.userOrderCountDownNumber.toString());
  }

  //Zeigt alle Angemeldeten Tische an.
  getAllTables(){
    //const userId = this.authService.getUserId();

    const userRef = collection(this.firestore, 'table');
    return collectionData(userRef,{idField: 'id'});
  }

  //holt eizelne Bestell Infos raus
  getOrderInfo(orderId){
    //const order = doc(this.firestore, `orders/${orderId}`);
    //return docData(order);
    const orderRef = collection(this.firestore, `orders/${orderId}`);
    return collectionData(orderRef,{idField: 'id'});
  }

  //holt alle bestellungen aus User/userOrders raus
  getTableOrders(userId){
    //console.log('getTableOrders');
    //const userId= this.authService.getUserId();
    //const userOrderRef = collection(this.firestore, `users/${userId}/orders`);

    const userOrderRef = collection(this.firestore, `table/${userId}`);
    return collectionData(userOrderRef, {idField: 'id'});
  }



  //holt alle bestellungen aus User/userOrders raus
  getTableOrdersForUser(tableNr){

    //console.log('getTableOrders');

    const userRef = doc(this.firestore, `users/${1}`);
    return docData(userRef);

    //const userRef = collection(this.firestore, `table/${tableNr}/userOrders`);
    //return collectionData(userRef);

    //Holt alle tables
   // const notesRef = collection(this.firestore, 'table');
    //return collectionData(notesRef, { idField: 'id'}) ;
  }
}
