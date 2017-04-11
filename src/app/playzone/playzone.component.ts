import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GamePlayService } from './game-play.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-playzone',
  templateUrl: './playzone.component.html',
  styleUrls: ['./playzone.component.css']
})
export class PlayzoneComponent implements OnInit, OnDestroy {

  private _user: TUser;
  public activeField: boolean = false;
  public field: TCard[];
  public _activeCards: TCard[];
  public gameDifficulty;
  public difficulty = {
    small: false,
    medium: false,
    large: false
  };
  public shareAbleLink:string = '';
  public qrCodeLink: string = '';
  public isPopup:string = '';

  private startGameSubscriber: Subscription;
  private updateFieldSubscriber: Subscription;
  private pauseSubscriber: Subscription;
  private popupSubscriber: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
    private _gamePlayService: GamePlayService) {

    this.popupSubscriber = this._gamePlayService.showPopup.subscribe((state) => this.isPopup = state);
    this.startGameSubscriber = this._gamePlayService.startGame.subscribe((data) => this._initFirstData(data));
    this.updateFieldSubscriber = this._gamePlayService.updateField.subscribe((data) => this._updateField(data));
    this.pauseSubscriber = this._gamePlayService.pause.subscribe(() => this._user.isActive = false);

    this.shareAbleLink = window.location.href;
    this.qrCodeLink = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + this.shareAbleLink;

  }

  ngOnInit(){
    this._activatedRoute.params.forEach((param: Params) => this._gamePlayService.initNewGame(param['id']));
  }



  ngOnDestroy(): void {
    this.startGameSubscriber.unsubscribe();
    this.updateFieldSubscriber.unsubscribe();
    this.pauseSubscriber.unsubscribe();
    this.popupSubscriber.unsubscribe();
    if (this.field) this._gamePlayService.removeSubscriptions();
  }


  private _initFirstData(data: TFirstFieldData): void {
    this.field = data.cards;
    this.gameDifficulty = data.difficulty;
    this.difficulty[data.difficulty] = true;
    this._user = data.user;
    this.activeField = data.user.isActive;
    this._activeCards = data.activeCards || [];
  }


  private _updateField(data: TUpdatesFieldData): void {
    this._user = data.user;
    this.activeField = data.user.isActive;
    this._activeCards = data.activeCards;
    this.field.forEach(card => {
      this._activeCards.forEach(activeCard => {
        if (card.id === activeCard.id) {
          card.isOpen = activeCard.isOpen;
          card.isHide = activeCard.isHide;
        }
      });
    });
  }


  public openCard(card: TCard): void {
    if (!this._user.isActive || this._activeCards.length === 2) return;
    if (this._activeCards[0] && !this._activeCards[0].isOpen) return;
    card.isOpen = true;
    this._activeCards.push(card);
    this._gamePlayService.prepareNewState(this._activeCards);
  }


  public copyLink(): void{
    let input:HTMLInputElement = <HTMLInputElement>document.getElementById("share_link");
    input.select();
    document.execCommand('copy');
    input.blur();
  }

  public goToMainMenu(): void{
      this._gamePlayService.goToMainMenu();
  }

}
