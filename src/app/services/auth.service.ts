import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, UserCredential
  , signInWithEmailAndPassword, onAuthStateChanged,signOut } from '@angular/fire/auth';
import {collection, collectionData, doc, docData, Firestore, setDoc} from '@angular/fire/firestore';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import {BehaviorSubject, Observable, Subject, from} from 'rxjs';
import {Preferences} from '@capacitor/preferences';
import { map } from 'rxjs/operators';

const STORAGE_TABLE_KEY = 'active-table';
const STORAGE_GUEST_KEY = 'active-guest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserData = null;
  logout$: Subject<boolean> = new Subject<boolean>();
  private tableSubject = new BehaviorSubject(null);

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
    this.deleteTableNrStorage();
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
  getGuestsNumber2(tableNr) {
    //return this.currentUserData.guests;
    //const userRef = collection(this.firestore, `table/${tableNr}`);
    //return collectionData(userRef,{idField: 'id'});

    const order = doc(this.firestore, `table/${tableNr}`);
    return docData(order);
  }

  //Kann bald gelöscht werdden
  getGuestsNumber() {
    //return this.currentUserData.guests;
    const userRef = collection(this.firestore, `table`);
    return collectionData(userRef,{idField: 'id'});
  }

  //Zeigt alle Angemeldeten/Erstellte Tische an.
  getAllTables(){
    const userRef = collection(this.firestore, 'table');
    return collectionData(userRef,{idField: 'id'});
  }

  async setActiveTable(tabel: any) {
    //await Preferences.set({ key: STORAGE_TABLE_KEY, value: tabel });
    //this.tableSubject.next(tabel);

    try {
      await Preferences.set({ key: STORAGE_TABLE_KEY, value: tabel});
      //console.log(`Die Zahl ${tabel} wurde im Storage gespeichert.`);
    } catch (error) {
      console.error('Fehler beim Speichern der Zahl im Storage:', error);
    }
  }
  async setActiveGuestsNumber(guestsNumber: any) {
    //await Preferences.set({ key: STORAGE_TABLE_KEY, value: tabel });
    //this.tableSubject.next(tabel);

    try {
      await Preferences.set({ key: STORAGE_GUEST_KEY, value: guestsNumber});
      //console.log(`Die Zahl ${guestsNumber} wurde im Storage gespeichert.`);
    } catch (error) {
      console.error('Fehler beim Speichern der Zahl im Storage:', error);
    }
  }

   getActiveTable(): Observable<number | null>{
    //console.log('Get Activetable' ,this.tableSubject.asObservable());
    //return this.tableSubject.asObservable();
    return from(Preferences.get({ key: STORAGE_TABLE_KEY })).pipe(
      map(result => {
        if (result && result.value) {
          const storedNumber = parseInt(result.value, 10);
         // console.log(`Gespeicherte Zahl: ${storedNumber}`);
          return storedNumber;
        } else {
          console.log('Keine Zahl im Storage gefunden.');
          return null;
        }
      })
    );
  }

  // Hier holle ich die aktuelle Geste anzahl.
  getActiveGuestsNumber(): Observable<number | null>{
    //console.log('Get Activetable' ,this.tableSubject.asObservable());
    //return this.tableSubject.asObservable();
    return from(Preferences.get({ key: STORAGE_GUEST_KEY })).pipe(
      map(result => {
        if (result && result.value) {
          const storedNumber = parseInt(result.value, 10);
          // console.log(`Gespeicherte Zahl: ${storedNumber}`);
          return storedNumber;
        } else {
          console.log('Keine Zahl im Storage gefunden.');
          return null;
        }
      })
    );
  }

  // Funktion zum Löschen des Storage
  async deleteTableNrStorage() {
    try {
      await Preferences.remove({ key: STORAGE_TABLE_KEY });
      await Preferences.remove({ key: STORAGE_GUEST_KEY });
     // console.log(`Der Storage unter dem Schlüssel '${STORAGE_TABLE_KEY}' und '${STORAGE_GUEST_KEY}' wurde gelöscht.`);
    } catch (error) {
      console.error('Fehler beim Löschen des Storage:', error);
    }
  }
}
