import { Injectable } from '@angular/core';
import {
  Firestore, collection, collectionData, doc, addDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove,
  serverTimestamp, query, orderBy, docData, where,documentId
} from '@angular/fire/firestore';
import {AuthService} from './auth.service';
import {switchMap,take} from 'rxjs/operators';
import {ToastController} from '@ionic/angular';
import {Vibration} from '@ionic-native/vibration/ngx';
import { Storage } from '@ionic/storage-angular';


const STORAGE_KEY = 'mylist';


export interface IUserOrder {
  tempId?: number;
  userid: string;
  userEmail: string;
  userTableNr: string;
  title: string;
  text: string;
  //createdAt: serverTimestamp() ;
  imageLink: string;
}

@Injectable({
  providedIn: 'root'
})

export class DataService {

  userOrderId= null;
  orderCount=0;
  count =0;
  oneRoundNumber = 2;
  userOrderCount = 0;
  private tempOrder: IUserOrder[]=[];
  guestsNumber;
  oneOrderTotalNumber;

  constructor(private firestore: Firestore, private authService: AuthService, private toastCtrl: ToastController,
              private vibration: Vibration, private storage: Storage) { }

  getAllOrderId(){
    const notesRef = collection(this.firestore, 'orders');
    return collectionData(notesRef, { idField: 'id'});
  }

  addUpUserOrder(){

    this.guestsNumber = this.authService.getGuestsNumber();
    this.oneOrderTotalNumber = this.guestsNumber * this.oneRoundNumber -1;
    if( this.oneOrderTotalNumber > this.userOrderCount){
      this.orderToast();
      this.userOrderCount++;
      console.log('user order count', this.userOrderCount);
      return false;
    }else{
      //this.userOrderCount=0;
      this.userOrderCount++;
      this.orderFullToast();
     return true;
    }
  }
  oneOrderDeleteMinusCount(){
    console.log('count for --',this.userOrderCount);
    this.userOrderCount--;
    console.log('count nach --',this.userOrderCount);
  }

  placeAnOrderButtonStatus(){
    this.guestsNumber = this.authService.getGuestsNumber();
    this.oneOrderTotalNumber = this.guestsNumber * this.oneRoundNumber -1;
    console.log('placeAnOrderButtonStatus userOrderCount: ', this.userOrderCount);
    console.log('placeAnOrderButtonStatus oneOrderTotalNumber: ', this.oneOrderTotalNumber);
    if(this.userOrderCount <= this.oneOrderTotalNumber){
      return false;
    }else{
      return true;
    }
  }

  orderToast() {
    this.oneOrderTotalNumber = (this.guestsNumber * this.oneRoundNumber -1) - (this.userOrderCount) ;
    this.vibration.vibrate(75);
    this.toastCtrl.create({
      message: 'Added order! still: '+ this.oneOrderTotalNumber,
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
    // this.userOrderCount = this.authService.getGuestsNumber();
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

  deleteUserDocument(userId) {
    const noteDocRef = doc(this.firestore, `users/${userId}`);
    return deleteDoc(noteDocRef);
  }

  deleteOrderAndUserOrders(note) {
    const userId = this.authService.getUserId();
    //console.log('uerID: ', userId);
    //console.log('note: ', note);

    const orderRef = doc(this.firestore, `orders/${note.id}`);
    return deleteDoc(orderRef)
      .then(res => {
        const userRef = doc(this.firestore, `users/${userId}`);
        return updateDoc(userRef, {
          userOrders: arrayRemove(note.id)
        });
      });
  }

  deleteAllUserOrdersFromDB(){
    console.log('deleteAllUserOrdersFromDB');
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

  async addDate(logInUserId,logInUserEmail, text, title, sushiImageLink, userTableNr) {
    const order: IUserOrder = {
      tempId: this.orderCount,
      userid: logInUserId,
      userEmail: logInUserEmail,
      userTableNr,
      title,
      text,
      //createdAt: serverTimestamp(),
      imageLink: sushiImageLink
    };
    console.log('Problemi');
    const dates = await this.storage.get(STORAGE_KEY) || [];
    dates.push(order);
    return this.storage.set(STORAGE_KEY, dates);
  }

  /*
  async getDates(): Promise<IUserOrder[]> {
    return this.storage.get(STORAGE_KEY).then((res: IUserOrder[]) =>
      (res || []).map((entry) => {
        return entry;
      })
    );
  }*/

  getData() {
    return this.storage.get(STORAGE_KEY) || [];
  }

  async remvoveItem(index) {
    const storedData = await this.storage.get(STORAGE_KEY) || [];
    storedData.splice(index, 1);
    return this.storage.set(STORAGE_KEY, storedData);
  }


  addTempOrder(logInUserId,logInUserEmail, text, title, sushiImageLink, userTableNr){
    //const chatsRef = collection(this.firestore, 'orders');
    const order: IUserOrder = {
      tempId: this.orderCount,
      userid: logInUserId,
      userEmail: logInUserEmail,
      userTableNr,
      title,
      text,
      //createdAt: serverTimestamp(),
      imageLink: sushiImageLink
    };
    //console.log('orderCount: ',this.orderCount );
    this.tempOrder.push(order);
    //this.tempOrderArray(this.userOrder[this.orderCount]);
    //console.log('Array: ', this.tempOrder);
    this.orderCount++;

    /*
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
    });*/
  }
  deleteTempOrder(deleteNumber){
    const index = this.tempOrder.findIndex((obj) =>obj.tempId ===deleteNumber);
    console.log('index:', index);
    if (index > -1) {
      this.tempOrder.splice(index, 1);
    }
    console.log('After Delete Temp Array: ', this.tempOrder);
  }

  async deleteCompleteTempOrder() {
    this.tempOrder=[];
    this.userOrderCount=0;
  }

  async addTempOrderToDB() {

    const ordersRef = collection(this.firestore, 'orders');
    //const userOrdersRef = collection(this.firestore, 'userOrders');
    const logInUserId = this.authService.getUserId();

    for (const order of this.tempOrder) {
      //console.log('count: ', this.count);
      //console.log('ORDER:', order);
      //order.createdAt='datre'+serverTimestamp();


      addDoc(ordersRef, order).then(res => {
        // console.log('created order ADDDOC: ', res);
        const groupID = res.id;
        const promises = [];
        //addDoc(userOrdersRef,order);
        this.addDats(order);

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
    //this.addTempUserOrdersToDB();
  }

  async addDats(order: IUserOrder) {

    const dates = await this.storage.get(STORAGE_KEY) || [];
    dates.push(order);
    return this.storage.set(STORAGE_KEY, dates);
  }
/*
  async addTempUserOrdersToDB(){
    const ordersRef = collection(this.firestore, 'userOrders');
    const logInUserId= this.authService.getUserId();

    for(const order of this.tempOrder) {
      //console.log('count: ', this.count);
      //console.log('ORDER:', order);
      //order.createdAt='datre'+serverTimestamp();

      addDoc(ordersRef, order).then(res => {
        // console.log('created order ADDDOC: ', res);
        const groupID = res.id;
        const promises = [];

        // In der DB muss für jeden user der DB eintrag angepasst werden
        // (in diesem Fall in welchen Chats befindet sich der User)

        const userChatsRef = doc(this.firestore, `users/${logInUserId}`);
        const update = updateDoc(userChatsRef, {
          allUserOrders: arrayUnion(groupID)
        });
        promises.push(update);
        return Promise.all(promises);
      });
    }
  }*/

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

  getOrderByCreatedTime(){
    const messages = collection(this.firestore, `orders`);
    const q = query(messages, orderBy('createdAt'));
    return collectionData(q, {idField: 'id'});
  }
  getTemporaraOrder(): IUserOrder[]{
    return this.tempOrder;
  }
}
