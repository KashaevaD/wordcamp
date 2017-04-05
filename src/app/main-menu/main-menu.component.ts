import { Component } from '@angular/core';
import { CreateGameService } from "./create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { Router} from '@angular/router';
import { IntroductionService } from '../introduction/introduction.service';

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
              private _introService: IntroductionService) {
    if (!this._redirectToIntro()) {
      this._router.navigate(['/']);
    }
  }

  private _redirectToIntro(): boolean {
    return !!this._localSrorage.getLocalStorageValue("user");
  }

  public startSingleGame(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
    let options = JSON.parse(this._localSrorage.getLocalStorageValue("user"));
    options.type = "single";
    sessionStorage['userid'] = this._createGameService.getGeneratedRandomId().toString();
    this._createGameService.makePlayZone(options);
  }

  public goToMultiComponent(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");

    this._router.navigate(['mainmenu/multi']);
  }

  public goToOptionsOfGame(event): void {
    (event.target as HTMLElement).setAttribute("disabled", "true");
     this._router.navigate(['options']);
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
            window.scrollTo(0, 0 + (progress * 600));
        }
    });
  }

}






