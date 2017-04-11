import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { LocalStorageService } from "../local-storage.service";
import { JoinGameService } from "../main-menu/join-game.service";
import { Router } from '@angular/router';
import { Subscription } from "rxjs";
import {OptionsService} from "./options.service";

@Component({
  selector: 'app-options-menu',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
})
export class OptionsComponent implements OnDestroy {

  private menuGame: FormGroup;
  private defaultOptions: any;
  private _showSubscriber: Subscription;
  private _gameType: string;

  public isEditing:boolean = false;
  public isShow:boolean = false;

  public currentImageLanguage: EventTarget;
  public currentLanguages: TLanguages = {
    first: {
      src: "",
      name: ""
    },
    last: {
      src: "",
      name: ""
    }
  };
  public imageOfLanguages: TItemLang[];

  constructor(private _build: FormBuilder,
              private _router: Router,
              private _localSrorage: LocalStorageService,
              private _joinService: JoinGameService,
              private _optionsService: OptionsService) {

    this._showSubscriber = this._optionsService.showOptions
      .subscribe(gameType =>  {
        this.isShow = true;
        this._gameType = gameType;
      });

    this.imageOfLanguages = this._joinService.imageOfLanguages;
    this.defaultOptions = JSON.parse(this._localSrorage.getLocalStorageValue('user'));

    this._updateFormGroup();
    this._setLanguagePicture();

    document.addEventListener("keydown", this._changeOptionsByKeyEvent.bind(this));

    this.menuGame.valueChanges.subscribe((value) => {
      this._localSrorage.setLocalStorageValue("user", JSON.stringify(this.menuGame.value));
    });
  }

  ngOnDestroy() {
    document.removeEventListener("keydown", this._changeOptionsByKeyEvent.bind(this));
    this._showSubscriber.unsubscribe();
  }

  private _updateFormGroup(): void {
    //reactive form for user
    this.menuGame = this._build.group({
      username: new FormControl(this.defaultOptions.username),
      languages: new FormGroup({
        first: new FormControl(this.defaultOptions.languages.first),
        last: new FormControl(this.defaultOptions.languages.last)
      }),
      difficulty: new FormControl(this.defaultOptions.difficulty)
    });
  }

  public _changeOptionsByKeyEvent(event: Event): void {
    if ((event as KeyboardEvent).keyCode === 13 && (event.target as HTMLElement).tagName === "BODY") {
      this.applyChanges(event);
       event.preventDefault();
      return;
    }
  }


  public startGame(event){
    event.preventDefault();
    this.isShow = false;
    this._gameType === 'multi' ? this._optionsService.creteMultiGame.emit(this.menuGame.value) : this._optionsService.creteSingleGame.emit(this.menuGame.value);
  }


  public closePopup(){
    this.isShow = false;
  }

  public applyChanges(event: Event): void {
    document.removeEventListener("keydown", this._changeOptionsByKeyEvent.bind(this), true);
    //this._router.navigate(['mainmenu']);

    //this._localSrorage.setLocalStorageValue("user", JSON.stringify(this.menuGame.value));
     console.log("start");
     event.preventDefault();
  }

  public closeOptions(event: Event) {
    console.log("close");
    event.preventDefault();
  }

  public setStateOfEditing(): void {
    this.isEditing = !this.isEditing;

  }

  public changeUserName(): void {
    this.isEditing = false;
  }

  public allotAllText(e :Event): void {
    (e.target as HTMLInputElement).select();
  }

  public saveNameOfLang(e :Event) : void {
    let name: string = (e.target as HTMLElement).getAttribute("name");
    ((e.target as HTMLElement).getAttribute("data-order") === "first")? this.menuGame.value.languages.first = name: this.menuGame.value.languages.last = name;
     this._localSrorage.setLocalStorageValue("user", JSON.stringify(this.menuGame.value));
}

  private _setLanguagePicture(): void {
  this.imageOfLanguages.forEach(image => {
     if (this.menuGame.value.languages.first === image.name)
       this.currentLanguages.first = image;
     if (this.menuGame.value.languages.last === image.name)
       this.currentLanguages.last = image;
   });
 }

  public setNewLanguageImage(e: Event): void {
    //spacially for FireFox
    if ((e.target as HTMLElement).tagName === "BUTTON") {
      this.currentImageLanguage = (e.target as HTMLElement).firstElementChild;
      return;
    }
    this.currentImageLanguage = e.target;
  }

}
