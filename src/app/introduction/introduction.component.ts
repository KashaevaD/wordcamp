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
  public userName = "";

  // private _defaultOptionsForGame = {
  //   username: this.userName,
  //   difficulty: "small",
  //   languages : {
  //     first: "en",
  //     last: "en"
  //   },
  //   type: "single"
  // };

  constructor(private _createGameService: CreateGameService,
              private _localSrorage: LocalStorageService,
              private _introService: IntroductionService) {
    this.isOpenVideoIntro = false;
    this.userName = this._introService.setDefaultName();
    this.saveChangesWithUsername();
    this._createGameService.getValueFromStorage();
    
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
    this._createGameService.defaultOptionsForGame.username = this.userName; 
  }

  public startSingleGameDefault() {
    this._localSrorage.setLocalStorageValue("username", this.userName);
    this._createGameService.defaultOptionsForGame.username = this.userName; 
    this._createGameService.defaultOptionsForGame.type ="single";
    console.log(this._createGameService.defaultOptionsForGame);
    this._createGameService.makePlayZone(this._createGameService.defaultOptionsForGame);
  }
  
  public goToOptios() {
    //open options
  }

}