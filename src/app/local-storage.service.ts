import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {

  constructor() { }

    // work with localStorage
  public setLocalStorageValue(name: string, value: string):void {
    (localStorage as Storage).setItem(name, value);
  }

  public getLocalStorageValue(name: string): string {
    return (localStorage as Storage).getItem(name);
  }

  public removeLocalStorageValue(name: string) {
    (localStorage as Storage).removeItem(name);
  }


}
