import { Component } from '@angular/core';
import { CreateGameService } from "../main-menu/create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { OptionsService } from '../options/options.service';
import { Router} from '@angular/router';

import { IntroductionService } from './introduction.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css']
})
export class IntroductionComponent {

  public isOpenVideoIntro:boolean;
  public userName:string;

  constructor(private _createGameService: CreateGameService,
              private _localSrorage: LocalStorageService,
              private _introService: IntroductionService,
              private _router: Router,
              private _optionService: OptionsService) {
    this.isOpenVideoIntro = false;
    this.userName = this._introService.setDefaultName();
    this._introService.isShowMainPageForUser();
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

  public startSingleGameDefault() {
    this._optionService.setDefaultOptions(this.userName);
    let sub = this._optionService.getLangEmit.subscribe(data => {
       this._localSrorage.setLocalStorageValue("user", JSON.stringify(data));  
       this._localSrorage.setLocalStorageValue("userid", this._createGameService.getGeneratedRandomId().toString());
       data.type ="single";    
       this._createGameService.makePlayZone(data);
    });
   
  }

  public goToOptios() {
    this._optionService.setDefaultOptions(this.userName);
    let sub = this._optionService.getLangEmit.subscribe(data => {
      this._localSrorage.setLocalStorageValue("user", JSON.stringify(data));  
      this._router.navigate(['options']);
    });
  }

}