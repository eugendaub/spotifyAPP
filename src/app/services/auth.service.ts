import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, UserCredential
  , signInWithEmailAndPassword, onAuthStateChanged,signOut } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserData = null;
  logout$: Subject<boolean> = new Subject<boolean>();

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

  login({email, password}) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signup({tableNr, guests, email, password}): Promise<UserCredential> {
    try {
      const credentials = await createUserWithEmailAndPassword(this.auth, email, password);
      const userDoc = doc(this.firestore, `users/${credentials.user.uid}`);

      const tableCreateTime = new Date().toISOString();

      await setDoc(userDoc, {email, tableNr, guests, tableCreateTime});
      console.log('signup');
      return credentials;
    } catch (err) {
      throw(err);
    }
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

  getUserEmail() {
    return this.currentUserData.email;
  }
  getUserTableNr() {
    return this.currentUserData.tableNr;
  }
  getGuestsNumber() {
    return this.currentUserData.guests;
  }
}
