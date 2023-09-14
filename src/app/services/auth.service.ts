import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, UserCredential
  , signInWithEmailAndPassword, onAuthStateChanged,signOut } from '@angular/fire/auth';
import {collection, collectionData, doc, docData, Firestore, setDoc} from '@angular/fire/firestore';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserData = null;
  logout$: Subject<boolean> = new Subject<boolean>();

  private loginTableSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  loginTableNumber$ = this.loginTableSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore, private router: Router
  ) {
    this.ngInit();
  }
  ngInit(){
    onAuthStateChanged(this.auth, user => {
      if (user) {
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        docData(userDoc, {idField: 'id'}).pipe(
          takeUntil(this.logout$)
        ).subscribe(data => {
          //console.log('currentUserData');
          this.currentUserData = data;
        });
      } else {
        this.currentUserData = null;
      }
    });
  }

  // Login
  login({email, password}) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signup({email, password}): Promise<UserCredential> {
    try {
      const credentials = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('signup');
      return credentials;
    } catch (err) {
      throw(err);
    }
  }

  async signupForTable({tableNr, guests, email, password}) {
    try {
      const tableDoc = doc(this.firestore, `table/${tableNr}`);

      const tableCreateTime = new Date().toISOString();

      await setDoc(tableDoc, {tableNr,guests,tableCreateTime, tableCreater: email, isDeleted:false});
      console.log('signup');
      return signInWithEmailAndPassword(this.auth, email, password);
    } catch (err) {
      throw(err);
    }
  }

  //Aktualisiert die Tisch nummer
  updateLoginTableNumber(status) {
    console.log('updateUserOrderNumber' , status);
    this.loginTableSubject.next(status);
  }

  async logout() {
    await signOut(this.auth);
    this.logout$.next(true);


    this.router.navigateByUrl('/', {replaceUrl: true});
  }

  async deleteUser() {
    const user = this.auth.currentUser;
    await user?.delete();
    this.logout$.next(true);

    this.router.navigateByUrl('/', {replaceUrl: true});
  }

  getUserId() {
    //console.log('get User: ', this.auth.currentUser.uid);
    return (this.auth.currentUser.uid ===null ? null: this.auth.currentUser.uid);
    //return this.auth.currentUser.uid;
  }

  getTableNr(){
    return (this.loginTableNumber$ === null ? null : this.loginTableSubject.getValue()) ;
  }

  getUserEmail() {
    return this.currentUserData.email;
  }
  getUserTableNr() {
    return this.currentUserData.tableNr;
  }
  getGuestsNumber() {
    return this.currentUserData.guests;
  }

  //Zeigt alle Angemeldeten/Erstellte Tische an.
  getAllTables(){
    const userRef = collection(this.firestore, 'table');
    return collectionData(userRef,{idField: 'id'});
  }
}
