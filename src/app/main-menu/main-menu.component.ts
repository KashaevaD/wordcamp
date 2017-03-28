import { Component } from '@angular/core';
import { CreateGameService } from "./create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DBService } from '../db.service';
import { Subscription } from "rxjs";
import { JoinGameService } from "./join-game.service";

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {

  public isOpenVideoIntro:boolean;

  public isWait: boolean = false;
  public shareAbleLink: string = "";
  private _waitForUserSubscriber: Subscription;

  public userName = "";

  constructor(private _creategameService: CreateGameService,
    private _joingameService: JoinGameService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _localSrorage: LocalStorageService,
    private _dbService: DBService
    ) {
    this.isOpenVideoIntro = false;

    this._isShowMainPageForUser();

    //if user created a multiplayer game
    this._waitForUserSubscriber = this._creategameService.waitForSecondUserMultiplayer.subscribe((id) => {
      this.isWait = true;
      this.shareAbleLink = this._creategameService.getShariableLink(id);
      
       let room: Subscription = this._dbService.getObjectFromFB(`rooms/${id}`).subscribe(data => {
        if (data.$value !== null && data.users.length === 2) {
          room.unsubscribe();
          this._router.navigate(['playzone', id]);
        }
      });
    });

    // event on starting game
    let startGameSubscriber: Subscription = this._creategameService.startPlayingGame.subscribe((id) => {
      startGameSubscriber.unsubscribe();
       this._router.navigate(['playzone', id]);  // send user  on game-field
    });

  }

  ngOnInit() {
     this._activatedRoute.params.forEach((param: Params) => {
      let idRoom:number = param['id'];
        if (idRoom) {
          this._joingameService.doIfShareableLinkIsActivated(idRoom);
        }
    });
   }

  private _isShowMainPageForUser() {
    if (this._localSrorage.getLocalStorageValue("username")) {
      this._router.navigate(['mainmenu/single']);
    }
  }


  public goToMainMenu(): void {
    let array: string[] = this.shareAbleLink.split("/");
    this._dbService.getObjectFromFB(`rooms/${array[array.length - 1]}`).remove()
      .then(() => {
        this.isWait = false;
        this._router.navigate(['mainmenu/single']);
      })
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
        // timeFraction от 0 до 1
        var timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;

        // текущее состояние анимации
        var progress = options.timing(timeFraction);

        //Отрисовка
        options.draw(progress);

        if (timeFraction < 1) {
            requestAnimationFrame(_animate);
        }else {
            //Колбэк по завершении анимации
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






