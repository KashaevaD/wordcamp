import { Component, OnDestroy } from '@angular/core';
import { CreateGameService } from "./create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { Router} from '@angular/router';
import {OptionsService} from "../options/options.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnDestroy{

  private _createGameSubscriber: Subscription;

  constructor(private _createGameService: CreateGameService,
              private _router: Router,
              private _localSrorage: LocalStorageService,
              private _optionsService: OptionsService) {

    if (!this._redirectToIntro()) this._router.navigate(['/']);
    this._createGameSubscriber = this._optionsService.createSingleGame.subscribe(() => this._startSingleGame());

  }

  ngOnDestroy(){
    this._createGameSubscriber.unsubscribe();
  }

  private _redirectToIntro(): boolean {
    return !!this._localSrorage.getLocalStorageValue("user");
  }

  public showOptions(event: Event){
    (event.target as HTMLElement).setAttribute("disabled", "true");
    this._optionsService.showOptions.emit('single');
  }

  private _startSingleGame(): void {
    let options = JSON.parse(this._localSrorage.getLocalStorageValue("user"));
    options.type = "single";
    sessionStorage['userid'] = this._createGameService.getGeneratedRandomId().toString();
    //console.log(options);
   // this._createGameService.makePlayZone(options);
  }

  public goToMultiComponent(event: Event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    this._router.navigate(['mainmenu/multi']);
  }

}






