import { Component } from '@angular/core';
import { CreateGameService } from "./create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { Router} from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {

  public isOpenVideoIntro:boolean;

  public userName = "";

  constructor(private _creategameService: CreateGameService,
              private _router: Router,
              private _localSrorage: LocalStorageService) {
    this.isOpenVideoIntro = false;
    this._isShowMainPageForUser();
  }

  ngOnInit() {}

  private _isShowMainPageForUser() {
    if (this._localSrorage.getLocalStorageValue("username")) {
      this._router.navigate(['mainmenu/single']);
    }
  }



  public showVideo(event) {
    this.isOpenVideoIntro = !this.isOpenVideoIntro;
    event.target.innerHTML = (this.isOpenVideoIntro)? "Hide intro video↑": "Show intro video↓";
    this.animate(
      {duration: 1000,
        timing: function(timeFraction) {
            return timeFraction;
        },
        draw: function(progress) {
            window.scrollTo(0, 0 + (progress * 350));
        }
    });

  }

private animate(options) {

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

  public sendUserToSingleMenu() {
    let name = (this.userName)? this.userName: "Anonimous";
    this._localSrorage.setLocalStorageValue("username", name);
    this._router.navigate(['mainmenu/single']);
  }

}






