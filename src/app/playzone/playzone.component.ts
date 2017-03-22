import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GamePlayService } from './game-play.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-playzone',
  templateUrl: './playzone.component.html',
  styleUrls: ['./playzone.component.css'],
  providers: [GamePlayService]
})
export class PlayzoneComponent implements OnDestroy {

  private _user: TUser;
  public field: TCard[][];
  public _activeCards: TCard[];
  public difficulty = {
    small: false,
    medium: false,
    large: false
  };

  private startGameSubscriber: Subscription;
  private updateFieldSubscriber: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
    private _gamePlayService: GamePlayService) {
    this.startGameSubscriber = this._gamePlayService.startGame.subscribe((data) => this._initFirstData(data));
    this.updateFieldSubscriber = this._gamePlayService.updateField.subscribe((data) => this._updateField(data));
    this._activatedRoute.params.forEach((param: Params) => this._gamePlayService.initNewGame(param['id']));
  }


  ngOnDestroy(): void {
    this.startGameSubscriber.unsubscribe();
    this.updateFieldSubscriber.unsubscribe();
    if (this.field) this._gamePlayService.destroy();
  }


  private _initFirstData(data): void {
    this.field = data.cards;
    this.difficulty[data.difficulty] = true;
    this._user = data.user;
    this._activeCards = data.activeCards || [];
  }


  private _updateField(data): void {
    this._user = data.user;
    this._activeCards = data.activeCards;
    this.field.forEach(cardRow => {
      cardRow.forEach(card => {
        this._activeCards.forEach(activeCard => {
          if (card.id === activeCard.id) {
            card.isOpen = activeCard.isOpen;
            card.isHide = activeCard.isHide;
          }
        });
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

}
