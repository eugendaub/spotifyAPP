import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query, orderBy
} from '@angular/fire/firestore';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userOrderId= null;

  constructor(private firestore: Firestore, private auth: AuthService ) { }

  getAllOrderId(){
    const notesRef = collection(this.firestore, 'orders');
    return collectionData(notesRef, { idField: 'id'});
  }

  deleteUserDocument(userId) {
    const noteDocRef = doc(this.firestore, `users/${userId}`);
    return deleteDoc(noteDocRef);
  }

  deleteOrderAndUserOrders(note) {
    const userId = this.auth.getUserId();
    console.log('uerID: ', userId);
    console.log('note: ', note);

    const orderRef = doc(this.firestore, `orders/${note.id}`);
    return deleteDoc(orderRef)
      .then(res => {
        const userRef = doc(this.firestore, `users/${userId}`);
        return updateDoc(userRef, {
          userOrders: arrayRemove(note.id)
        });
      });
  }

  addOrderToUser(logInUserId,logInUserEmail, text, title, sushiImageLink){
    const chatsRef = collection(this.firestore, 'orders');
    const userOrder = {
      userid: logInUserId,
      userEmail: logInUserEmail,
      title,
      text,
      createdAt: serverTimestamp(),
      imageLink: sushiImageLink
    };

    return addDoc(chatsRef, userOrder).then( res => {
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
}
