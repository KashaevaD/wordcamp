import { Component } from '@angular/core';
import { CreateGameService } from "./create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { Router} from '@angular/router';
import {OptionsService} from "../options/options.service";

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  public isOpenVideoIntro:boolean;

  constructor(private _createGameService: CreateGameService,
              private _router: Router,
              private _localSrorage: LocalStorageService,
              private _optionsService: OptionsService) {
    if (!this._redirectToIntro()) {
      this._router.navigate(['/']);
    }
  }

  private _redirectToIntro(): boolean {
    return !!this._localSrorage.getLocalStorageValue("user");
  }

  public showOptions(status){
    this._optionsService.showOptions.emit(status);
  }

  public startSingleGame(event: Event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    let options = JSON.parse(this._localSrorage.getLocalStorageValue("user"));
    options.type = "single";
    sessionStorage['userid'] = this._createGameService.getGeneratedRandomId().toString();
    this._createGameService.makePlayZone(options);
  }

  public goToMultiComponent(event: Event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    this._router.navigate(['mainmenu/multi']);
  }

}






