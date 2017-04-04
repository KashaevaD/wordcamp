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

  private defaultOptionsForGame = {
    username: "",
    difficulty: "small",
    languages : {
      first: "en",
      last: "en"
    },
    type: ""
  };

  constructor(private _createGameService: CreateGameService,
              private _router: Router,
              private _localSrorage: LocalStorageService) {
     this.defaultOptionsForGame =  this._createGameService.getValueFromStorage();
      //console.log(this._defaultOptionsForGame);

  }
  // private _getValueFromStorage(): void {
  //    this._defaultOptionsForGame.username = this._localSrorage.getLocalStorageValue("username");
  //    this._defaultOptionsForGame.languages.first = this._localSrorage.getLocalStorageValue("firstlangauge");
  //    this._defaultOptionsForGame.languages.last = this._localSrorage.getLocalStorageValue("lastlangauge");
  //    this._defaultOptionsForGame.difficulty = this._localSrorage.getLocalStorageValue("difficulty");
  // }

  public startSingleGame(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    this.defaultOptionsForGame.type = "single";
    this._localSrorage.setLocalStorageValue("userid", this._createGameService.getGeneratedRandomId().toString());
    this._createGameService.makePlayZone(this.defaultOptionsForGame);
  }

  public goToMultiComponent(event): void {
    //send to multi
    (event.target as HTMLElement).setAttribute("disabled", "true");
    console.log("multi");
    this._router.navigate(['mainmenu/multi']);
  }

  public goToOptionsOfGame(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    console.log("options");
  }

}






