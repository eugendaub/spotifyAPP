import { Injectable } from '@angular/core';
import {Firestore, collection, collectionData, doc, addDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove,
  serverTimestamp, query, orderBy
} from '@angular/fire/firestore';
import {AuthService} from './auth.service';




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
  private tempOrder: IUserOrder[]=[];

  constructor(private firestore: Firestore, private authService: AuthService ) { }

  getAllOrderId(){
    const notesRef = collection(this.firestore, 'orders');
    return collectionData(notesRef, { idField: 'id'});
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
  addTempOrder(logInUserId,logInUserEmail, text, title, sushiImageLink, userTableNr){
    const chatsRef = collection(this.firestore, 'orders');
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
    console.log('orderCount: ',this.orderCount );
    this.tempOrder.push(order);
    //this.tempOrderArray(this.userOrder[this.orderCount]);
    console.log('Array: ', this.tempOrder);
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

    console.log('Array lenght: ',this.tempOrder.length );
    let count = 0;
    for(const input of this.tempOrder){
      if(count < this.tempOrder.length){
        console.log('count: ', count);
          this.tempOrder.splice(count, 1);
          count++;
      }
    }
    /*
    for(let i=0 ; i < this.tempOrder.length; i++) {
    console.log('i: ', i);
      const index = this.tempOrder.findIndex((obj) => obj.tempId === i);
      console.log('index:', index);
      if (index > -1) {
        this.tempOrder.splice(index, 1);
      }
   }*/
    console.log('After Delete Temp Array: ', this.tempOrder);
  }

  async addTempOrderToDB(){
    const chatsRef = collection(this.firestore, 'orders');
    const logInUserId= this.authService.getUserId();
    this.orderCount=0;
    this.count=0;

    for(const order of this.tempOrder) {
      this.count++;
      //console.log('count: ', this.count);
      //console.log('ORDER:', order);
      //order.createdAt='datre'+serverTimestamp();

      addDoc(chatsRef, order).then(res => {
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
  }

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
