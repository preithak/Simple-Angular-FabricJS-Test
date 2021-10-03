import { Injectable, NgZone } from '@angular/core';
import { User } from "../services/user";
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  userData: any;

  constructor(
    public afd: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone 
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  AuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
    .then((result) => {
      this.SetUserData(result.user);
    }).catch((error) => {
      window.alert(error)
    })
  }

  async SetUserData(user) {

    let userData: User;
      
      await this.afd.database.ref(`users/${user.uid}`)
        .once('value')
        .then( snapshot => {
          if (snapshot.exists()) {
            userData = snapshot.val();
            localStorage.setItem('canvas', userData.canvas || '{"version":"4.6.0","objects":[]}')
          } else {
            userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified
            }
            this.afd.database.ref(`users/${userData.uid}`).set(userData);
          }
          this.ngZone.run(() => {
            this.router.navigate(['dashboard']);
            })
        });
  }

  updateUserData(canvasData) {
    const user = JSON.parse(localStorage.getItem('user'));
    let doc = this.afd.database.ref(`/users`);
    localStorage.setItem('canvas', canvasData)
    doc.child(user.uid).update({'canvas': canvasData});
    
  }

  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    })
  }

}
