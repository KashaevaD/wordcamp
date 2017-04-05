import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { SingleplayerService } from "./singleplayer.service";
import { CreateGameService } from "../create-game.service";
import { LocalStorageService } from "../../local-storage.service";
import { JoinGameService } from "../join-game.service";
import { Router } from '@angular/router';
import { Subscription } from "rxjs";
import { DBService } from '../../db.service';

@Component({
  selector: 'app-singleplayer-menu',
  templateUrl: './singleplayer-menu.component.html',
  styleUrls: ['./singleplayer-menu.component.css']
})
export class SingleplayerMenuComponent {

  private menuGame: FormGroup;
  public userName: string;
  public isEditing:boolean = false;
  public imageOfLanguages: any[] = [];
  public buttonStart: EventTarget;
  public currentImageLanguage: EventTarget;


  public isWait: boolean = false;
  public shareAbleLink: string = "";
  private _waitForUserSubscriber: Subscription;

  constructor(private _build: FormBuilder,
              private _singleService: SingleplayerService,
              private _joingameService: JoinGameService,
              private _router: Router,
              private _localSrorage: LocalStorageService,
              private _createGameService: CreateGameService,
              private _dbService: DBService) {
    this.imageOfLanguages = this._joingameService.imageOfLanguages;

    this.userName = this._localSrorage.getLocalStorageValue("username")

    //reactive form for user
    this.menuGame = this._build.group({
      username: new FormControl(this.userName),
      type: new FormControl('single'),
      languages: new FormGroup({
        first: new FormControl('ru'),
        last: new FormControl('en')
      }),
      difficulty: new FormControl('small')
    });

    // event on starting game
    let startGameSubscriber: Subscription = this._createGameService.startPlayingGame.subscribe((id) => {
      startGameSubscriber.unsubscribe();
      this._router.navigate(['playzone', id]);  // send user  on game-field
    });

    //if user created a multiplayer game
    // this._waitForUserSubscriber = this._createGameService.waitForSecondUserMultiplayer.subscribe((id) => {
    //   this.isPopup = true;
    //   this.shareAbleLink = this._singleService.getShariableLink(id);
    //
    //   let room: Subscription = this._dbService.getObjectFromFB(`rooms/${id}`).subscribe(data => {
    //     if (data.$value !== null && data.users.length === 2) {
    //       room.unsubscribe();
    //       this._router.navigate(['playzone', id]);
    //     }
    //   });
    // });

  }

  public onSubmit(event: Event): void {
    this._localSrorage.setLocalStorageValue("userid", "0");
    (this.buttonStart as HTMLElement).setAttribute("disabled", "true");
    this._createGameService.makePlayZone(this.menuGame.value);
    event.preventDefault();
  }
  public setDisabledBtnStart(event): void {
    this.buttonStart = event.target;
  }

  public setStateIsEditing(): void {
    this.isEditing = true;
  }
  public changeUserNameAtLocalStorage(event): void {
    this.isEditing = false;
    let name:string = event.target.value;
    this._singleService.setUserNameAtLocalStorage(name);
    this.userName = name;
  }

  public allotAllText(e): void {
    e.target.select();
  }

  public sendImageForDropDownBtn(e) : void {
    let src: string = e.target.src;
    let name: string = e.target.name;
    (e.target.dataset.order === "first")? this.menuGame.value.languages.first = name: this.menuGame.value.languages.last = name;
    //Set the same picture on the main dropdown button img
    (this.currentImageLanguage as HTMLElement).setAttribute("src", src);
    (this.currentImageLanguage as HTMLElement).setAttribute("name", name);
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
