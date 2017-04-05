import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { LocalStorageService } from "../local-storage.service";
import { JoinGameService } from "../main-menu/join-game.service";
import { Router } from '@angular/router';
import { Subscription } from "rxjs";

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
  public imageOfLanguages: any[];
 


  constructor(private _build: FormBuilder,
              private _router: Router,
              private _localSrorage: LocalStorageService,
              private _joinService: JoinGameService) {
    this.imageOfLanguages = this._joinService.imageOfLanguages;
    this.defaultOptions = JSON.parse(this._localSrorage.getLocalStorageValue('user'));
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
    this._localSrorage.setLocalStorageValue("user", JSON.stringify(this.menuGame.value));
  }

  public resetChanges(event): void {
    this.defaultOptions = JSON.parse(this._localSrorage.getLocalStorageValue('user'));
    this._updateFormGroup();
    this._setLanguagePicture();
    event.preventDefault();
  }

  public cancelChangesMainMenu(event): void {
    document.removeEventListener("keydown", this._changeOptionsByKeyEvent.bind(this), true);
    this._router.navigate(['mainmenu']);
    event.preventDefault();
  }

  public setStateOfEditing(): void {
    this.isEditing = !this.isEditing;
    
  }
  public changeUserName(event): void {
    this.isEditing = false;
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
  this.imageOfLanguages.forEach(image => {
     if (this.menuGame.value.languages.first === image.name)
       this.currentLanguages.first = image;
     if (this.menuGame.value.languages.last === image.name)
       this.currentLanguages.last = image;
   });
 }

  public setNewLanguageImage(e): void {
    this.currentImageLanguage = e.target;
  }

}
