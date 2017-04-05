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

  constructor(private _createGameService: CreateGameService,
              private _router: Router,
              private _localSrorage: LocalStorageService) {}

  public startSingleGame(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    let options = JSON.parse(this._localSrorage.getLocalStorageValue("user"));
    options.type = "single";
    this._localSrorage.setLocalStorageValue("userid", this._createGameService.getGeneratedRandomId().toString());
    this._createGameService.makePlayZone(options);
  }

  public goToMultiComponent(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    console.log("multi");
    this._router.navigate(['mainmenu/multi']);
  }

  public goToOptionsOfGame(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
     this._router.navigate(['options']);
  }

}






