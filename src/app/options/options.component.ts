import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { SingleplayerService } from "../main-menu/singleplayer-menu/singleplayer.service";
import { CreateGameService } from "../main-menu/create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { JoinGameService } from "../main-menu/join-game.service";
import { Router } from '@angular/router';
import { Subscription } from "rxjs";
import { DBService } from '../db.service';
import { OptionsService } from './options.service';

@Component({
  selector: 'app-options-menu',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent {

  private menuGame: FormGroup;
  private defaultOptions: any;
  private _waitForUserSubscriber: Subscription;

  public isEditing:boolean = false;

  public currentImageLanguage: EventTarget;
  public currentLanguages = {
    first: {
      src: "",
      name: ""
    },
    last: {
      src: "",
      name: ""
    }
  };
  public isWait: boolean = false;
  public shareAbleLink: string = "";

  constructor(private _build: FormBuilder,
              private _singleService: SingleplayerService,
              private _joingameService: JoinGameService,
              private _router: Router,
              private _localSrorage: LocalStorageService,
              private _createGameService: CreateGameService,
              private _dbService: DBService,
              private _optionsService: OptionsService) {
    this.defaultOptions = this._optionsService.getOptionsFromLocalStorage();
    this._updateFormGroup();
    this._setLanguagePicture();

    document.addEventListener("keydown", this._changeOptionsByKeyEvent.bind(this), true);
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

  public _changeOptionsByKeyEvent(event) {
    if (event.keyCode === 13 && event.target.tagName === "BODY") {
      this.applyChanges(event); 
    } else if (event.keyCode === 27 && event.target.tagName === "BODY"){
      this.cancelChangesMainMenu(event);
    }
  }

  public applyChanges(event): void {
    document.removeEventListener("keydown", this._changeOptionsByKeyEvent.bind(this), true);
    this._router.navigate(['mainmenu']);
    event.preventDefault();
    this._optionsService.setOptionsToLocalStorage(this.menuGame.value);
  }

  public resetChanges(event): void {
    this.defaultOptions = this._optionsService.getOptionsFromLocalStorage();
    this._updateFormGroup();
    this._setLanguagePicture();
    event.preventDefault();
  }

  public cancelChangesMainMenu(event): void {
    document.removeEventListener("keydown", this._changeOptionsByKeyEvent.bind(this), true);
    this._router.navigate(['mainmenu']);
    event.preventDefault();
  }


  public setStateIsEditing(): void {
    this.isEditing = true;
  }
  public changeUserName(event): void {
    this.isEditing = false;
    // let name:string = event.target.value;
    // this.userName = name;
  }

  public allotAllText(e): void {
    e.target.select();
  }

  public sendImageForDropDownBtn(e) : void {
    let src: string = e.target.src;
    let name: string = e.target.name;
    (e.target.dataset.order === "first")? this.menuGame.value.languages.first = name: this.menuGame.value.languages.last = name;
    //Set the same picture on the main dropdown button img
    if ((this.currentImageLanguage as HTMLElement).getAttribute("data-order") === "first") {
      this.currentLanguages.first = {src: src, name: name};
    } else {
       this.currentLanguages.last = {src: src, name: name};
    }
  }

  private _setLanguagePicture() {
  this._joingameService.imageOfLanguages.forEach(image => {
     if (this.menuGame.value.languages.first === image.name)
       this.currentLanguages.first = image;
     if (this.menuGame.value.languages.last === image.name)
       this.currentLanguages.last = image;
   });
 }

  public setNewLanguageImage(e): void {
    this.currentImageLanguage = e.target;
  }

  public goToMainMenu(): void {
    let array: string[] = this.shareAbleLink.split("/");
    this._dbService.getObjectFromFB(`rooms/${array[array.length - 1]}`).remove()
      .then(() => {
        this.isWait = false;
        this._router.navigate(['mainmenu']);
      })
  }

}
