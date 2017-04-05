import { Component } from '@angular/core';
import { CreateGameService } from "../main-menu/create-game.service";
import { LocalStorageService } from "../local-storage.service";

import { IntroductionService } from './introduction.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css']
})
export class IntroductionComponent {

  public isOpenVideoIntro:boolean;
  public userName:string;

  private defaultOptionsForGame = {
    username: this.userName,
    difficulty: "small",
    languages : {
      first: "en",
      last: "en"
    },
    type: ""
  };

  constructor(private _createGameService: CreateGameService,
              private _localSrorage: LocalStorageService,
              private _introService: IntroductionService) {
    this.isOpenVideoIntro = false;
    this.userName = this._introService.setDefaultName();
    this.saveChangesWithUsername();

    this._introService.isShowMainPageForUser();

    // let startGameSubscriber: Subscription = this._createGameService.startPlayingGame.subscribe((id) => {
    //   startGameSubscriber.unsubscribe();
    //   this._router.navigate(['playzone', id]);  // send user  on game-field
    // });
  }

  public showVideo(event) {
    this.isOpenVideoIntro = !this.isOpenVideoIntro;
    event.target.innerHTML = (this.isOpenVideoIntro)? "Hide intro video↑": "Show intro video↓";
    this._introService.animate(
      {duration: 1000,
        timing: function(timeFraction) {
            return timeFraction;
        },
        draw: function(progress) {
            window.scrollTo(0, 0 + (progress * 350));
        }
    });
  }

  public allotAllText(e) {
    e.target.select();
  }
  public saveChangesWithUsername() {
    this.defaultOptionsForGame.username = this.userName;
  }

  public startSingleGameDefault() {
    this.saveChangesWithUsername();
    this._localSrorage.setSessionStorageValue("user", JSON.stringify(this.defaultOptionsForGame));
    sessionStorage['userid'] = this._createGameService.getGeneratedRandomId().toString();
    this.defaultOptionsForGame.type ="single";

    this._createGameService.makePlayZone(this.defaultOptionsForGame);
  }

  public goToOptios() {
    this._localSrorage.setSessionStorageValue("user", JSON.stringify(this.defaultOptionsForGame));
    //open options
  }

}
