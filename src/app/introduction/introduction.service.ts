import { Injectable } from '@angular/core';
import { LocalStorageService } from "../local-storage.service";
import { Router} from '@angular/router';

@Injectable()
export class IntroductionService {
    private _defaltNickNames:string[] = [
    "Donald Duc", "Crazy Cow", "Batman",
    "Кэп", "Harry Potter", "Jolly Rodger",
    "Scrooge McDuck", "Orange", "Lord Braine",
    "Dr. Hurt"];

  constructor(private _router: Router,
              private _localSrorage: LocalStorageService) { }

  public animate(options): void {
    let start:number = performance.now();
    requestAnimationFrame(function _animate(time) {
        let timeFraction: number = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;
        let progress = options.timing(timeFraction);
        options.draw(progress);
        if (timeFraction < 1) {
            requestAnimationFrame(_animate);
        }else {
            options.cb && options.cb();
        }
    });
  }

  public setDefaultName():string {
      let rand:number = Math.round(Math.random() * (this._defaltNickNames.length - 1));    
      return this._defaltNickNames[rand];
  }

  public isShowMainPageForUser():void {
    if (this._localSrorage.getLocalStorageValue("user")) {
      this._router.navigate(['mainmenu']);
    }
  }

}
