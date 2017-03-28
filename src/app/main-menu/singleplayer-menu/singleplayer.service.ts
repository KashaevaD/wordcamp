import { Injectable } from '@angular/core';
import { LocalStorageService } from "../../local-storage.service";

@Injectable()
export class SingleplayerService {

  constructor(private _localStorage: LocalStorageService) { }

  public setUserNameAtLocalStorage(name: string): void {
  // let currentName: string = this._localStorage.getLocalStorageValue("username");
    let setValueUsername: string = name;

     if (name === "") {
       setValueUsername = "Anonimous";
     }
    this._localStorage.setLocalStorageValue("username", setValueUsername);

  }

}

