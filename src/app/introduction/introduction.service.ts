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

  public animate(options) {
    var start = performance.now();
    requestAnimationFrame(function _animate(time) {
        var timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;
        var progress = options.timing(timeFraction);
        options.draw(progress);
        if (timeFraction < 1) {
            requestAnimationFrame(_animate);
        }else {
            options.cb && options.cb();
        }
    });
  }

  public setDefaultName():string {
    // let name:string = this._localSrorage.getLocalStorageValue("username");
    // if (!name) {
      let rand = 0 - 0.5 + Math.random() * (this._defaltNickNames.length - 0 + 1);
      rand = Math.round(rand);
      return this._defaltNickNames[rand];
    // }
    // return name;
  }

  public isShowMainPageForUser():void {
    if (this._localSrorage.getLocalStorageValue("username")) {
      this._router.navigate(['mainmenu/single']);
    }
  }

}
