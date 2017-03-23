import { Subscription, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { DBService } from '../db.service';
import { Router } from '@angular/router';
import { MultiplayerService } from "../main-menu/multiplayer-menu/multiplayer.service";

@Injectable()
export class GamePlayService {

  private _roomId: number;
  private _users: TUser[];
  private _cards: TCard[][];
  private _gameType: string;
  private _activeCards: TCard[];

  public currentName: string;
  public currentScore: number;
  public countHiddenBlock: number;
  private _currentUser: TUser;
  private _timerId: any;
  private _roomSubscriber: Subscription;

  public startGame: Subject<any>;
  public updateField: Subject<any>;
  public streamFromFirebase: Subject<any>;


  constructor(
    private _dbService: DBService,
    private _router: Router) {
    this.startGame = new Subject();
    this.updateField = new Subject();
  }


  public initNewGame(roomId: number) {
    this._roomId = roomId;

    this.streamFromFirebase = new Subject();
    let firstDataSubscriber = this.streamFromFirebase
      .subscribe(data => {
        if (!data.cards) {
          this._router.navigate(['mainmenu']);
          return;
        } else {
          this._initData(data);
        }
        firstDataSubscriber.unsubscribe();
        this._roomSubscriber = this.streamFromFirebase.subscribe((res) => this._updateLocalState(res));
      });

    let roomSubscriberForFistData = this._dbService.getObjectFromFB(`rooms/${roomId}`)
      .subscribe(this.streamFromFirebase);

  }


  private _initData(data) {
    this._cards = data.cards;
    this._users = data.users;
    this._gameType = data.type;
    this.countHiddenBlock = data.countHiddenBlock;
    let localUser: number = +localStorage["userid"];

    data.users.forEach(user => {
      if (user.id === localUser) {
        this._currentUser = Object.assign({}, user)
      }
    });
    this.startGame.next({
      cards: data.cards,
      user: this._currentUser,
      difficulty: data.difficulty,
      activeCards: data.activeCards,
    });

  }



  private _updateLocalState(data): void {

    if (!data.cards) {
      this.removeSubscriptions();
      this._router.navigate([`mainmenu/`]);
      return;
    }

    let activeCards = Array.isArray(data.activeCards) ? data.activeCards.filter(item => item) : [];

    this._activeCards = activeCards.map(card => Object.assign({}, card));
    this._users = data.users.map(user => Object.assign({}, user));
    this.countHiddenBlock = data.countHiddenBlock;

    this.updateActivityForCurrentUser(data.users);
    this._changeStateByOpendCards(activeCards);

    this.updateField.next({
      activeCards: activeCards,
      user: this._currentUser
    });

  }


  private _changeStateByOpendCards(activeCards: TCard[]) {
    switch (activeCards.length) {
      case 0:
        if (!this._currentUser.isActive) {
          this._updateCards(activeCards);
        }
        break;
      case 1:
        if (!this._currentUser.isActive) {
          this._updateCards(activeCards);
          if (!activeCards[0].isOpen) this._timerId = setTimeout(() => this._dbService.updateStateOnFireBase(this._roomId, this._cards, [], this._users, this.countHiddenBlock), 500);
        }
        break;
      case 2:
        this._isWin(this._cards);
        if (this._currentUser.isActive) {
          if (!activeCards[0].isOpen || activeCards[0].isHide) {
            this._timerId = setTimeout(() => {
              this._dbService.updateStateOnFireBase(this._roomId, this._cards, [], this._users, this.countHiddenBlock);
            }, 500);
          }
        }
    }

  }


  private updateActivityForCurrentUser(users: TUser[]) {
    users.forEach(user => {
      if (user.id === this._currentUser.id) this._currentUser.isActive = user.isActive;
    });
  }


  public prepareNewState(activeCards: TCard[]) {
    if (activeCards.length === 2) {
      this._checkactiveCards(activeCards);
      if (this._gameType === 'multi') this._users.forEach(user => user.isActive = !user.isActive);
    }
    this._updateCards(activeCards);
    this._dbService.updateStateOnFireBase(this._roomId, this._cards, activeCards, this._users, this.countHiddenBlock);
  }


  private _checkactiveCards(activeCards: TCard[]) {
    if (activeCards[0].wordId === activeCards[1].wordId) {
      activeCards[0].isHide = true;
      activeCards[1].isHide = true;
      this._currentUser.score += 10;
      this.countHiddenBlock += 1;
    } else {
      this._timerId = setTimeout(() => {
        activeCards.forEach(card => card.isOpen = false);
        this._dbService.updateStateOnFireBase(this._roomId, this._cards, activeCards, this._users, this.countHiddenBlock);
      }, 500);
      this._currentUser.score -= 1;
    }
    this._changeUserScore();
  }


  private _changeUserScore(): void {
    this._users.forEach(user => {
      if (user.id === this._currentUser.id) {
        user.score = this._currentUser.score;
        if (user.score < 0) user.score = 0;
      }
    });
  }



  private _updateCards(activeCards: TCard[]) {
    this._activeCards = activeCards;
    this._cards.forEach(cardRow => {
      cardRow.forEach(card => {
        activeCards.forEach(activeCard => {
          if (card.id === activeCard.id) {
            card.isOpen = activeCard.isOpen;
            card.isHide = activeCard.isHide;
          }
        });
      });
    });
  }



  private _isWin(cells: TCard[][]): void {
    if (this.countHiddenBlock === (cells.length * cells[0].length) / 2) {

      if (this._gameType === 'multi') {
        let diff: number = this._users[0].score - this._users[1].score;
        switch (diff) {
          case 0:
            this._users[0].result = 'draw';
            this._users[1].result = 'draw';
            break;
          case Math.abs(diff):
            this._users[0].result = 'win';
            break;
          default:
            this._users[1].result = 'win';
            break;
        }
      }
      else this._users[0].result = 'win';

      this.endGame();
    }

  }


  public endGame() {
    this.removeSubscriptions();
    this._dbService.updateStateOnFireBase(this._roomId, this._cards, [], this._users, this.countHiddenBlock)
      .then(() => this._router.navigate([`playzone/${this._roomId}/result`]));

  }


  public removeSubscriptions() {
    this._roomSubscriber.unsubscribe();
    this.streamFromFirebase.unsubscribe();
  }


}
