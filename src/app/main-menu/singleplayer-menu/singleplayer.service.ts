import { Injectable } from '@angular/core';
import { LocalStorageService } from "../../local-storage.service";

@Injectable()
export class SingleplayerService {

  constructor(private _localStorage: LocalStorageService) { }

  public setUserNameAtLocalStorage(name: string): void {
    let setValueUsername: string = name;

     if (name === "") {
       setValueUsername = "Anonimous";
     }
    this._localStorage.setSessionStorageValue("username", setValueUsername);
  }

  public getShariableLink(roomId: number): string {
    let base = document.querySelector('base').getAttribute("href") || "/";
    return window.location.origin.concat(base, "mainmenu/multi/", roomId.toString());
  }

}

