import { Subscription } from 'rxjs';
import { Component, OnDestroy } from '@angular/core';
import { GamePlayService } from './game-play.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-playzone',
  templateUrl: './playzone.component.html',
  styleUrls: ['./playzone.component.css']
})
export class PlayzoneComponent implements OnDestroy {

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
  public isWait:boolean = false;

  private startGameSubscriber: Subscription;
  private updateFieldSubscriber: Subscription;
  private pauseSubscriber: Subscription;
  private waitSubscriber: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
    private _gamePlayService: GamePlayService) {

    this.waitSubscriber = this._gamePlayService.wait.subscribe((isWait) => this.isWait = isWait);

    this.startGameSubscriber = this._gamePlayService.startGame.subscribe((data) => this._initFirstData(data));
    this.updateFieldSubscriber = this._gamePlayService.updateField.subscribe((data) => this._updateField(data));
    this.pauseSubscriber = this._gamePlayService.pause.subscribe(() => this._user.isActive = false);

    this.shareAbleLink = window.location.href;

    this._activatedRoute.params.forEach((param: Params) => this._gamePlayService.initNewGame(param['id']));

  }


  ngOnDestroy(): void {
    this.startGameSubscriber.unsubscribe();
    this.updateFieldSubscriber.unsubscribe();
    this.pauseSubscriber.unsubscribe();
    this.waitSubscriber.unsubscribe();
    if (this.field) this._gamePlayService.removeSubscriptions();
  }


  private _initFirstData(data): void {

    this.field = data.cards;
    this.gameDifficulty = data.difficulty;
    this.difficulty[data.difficulty] = true;
    this._user = data.user;
    this.activeField = data.user.isActive;
    this._activeCards = data.activeCards || [];
  }


  private _updateField(data): void {
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


  public copyLink($event){
    let input = $event.target.previousElementSibling;
    let rng, sel;
    rng = document.createRange();
    rng.selectNode(input);
    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rng);
    let successful = document.execCommand('copy');
    window.getSelection().removeAllRanges();
  }

  public goToMainMenu(){
      this._gamePlayService.goToMainMenu();
  }

}
