import { Subscription, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { DBService } from '../db.service';
import { Router } from '@angular/router';
import { SidebarService } from './sidebar/sidebar.service';
import {log} from "util";

@Injectable()
export class GamePlayService {

  private _roomId: number;
  private _users: TUser[];
  private _cards: TCard[];
  private _gameType: string;
  private _activeCards: TCard[];

  public countHiddenBlock: number;
  private _currentUser: TUser;
  private _timerId: any;
  private _roomSubscriber: Subscription;
  private _timeSubscriber: Subscription;

  public _roomObservable;
  public localStorageUser;

  public startGame: Subject<any>;
  public updateField: Subject<any>;
  public streamFromFirebase: Subject<any>;
  public pause: Subject<any>;
  public wait: Subject<any>;


  constructor(
    private _dbService: DBService,
    private _router: Router,
    private _sidebarService: SidebarService) {
    this.startGame = new Subject();
    this.updateField = new Subject();
    this.pause = new Subject();
    this.wait = new Subject();
  }


  public initNewGame(roomId: number) {
    this._roomId = roomId;

    this.streamFromFirebase = new Subject();
    let firstDataSubscriber = this.streamFromFirebase
      .subscribe(data => {
        if (!data.cards || (data.users.length === 2 && this.checkNewUser(data.users))) {
          console.log('checking 3', localStorage['userid']);
          console.log('checking 4', data.users);
          firstDataSubscriber.unsubscribe();
          this._router.navigate(['mainmenu']);
          return;
        }

        if(data.type === 'multi'){
          if(data.users.length < 2){
            this._initData(data);
            if(this.checkNewUser(data.users)){
              this._createNewUser();
              console.log('new user');
            }else {
              this.wait.next(true);
              console.log('users', data.users);
            }
          }
          else {
            this._initData(data);
            this.startGame.next({
              cards: data.cards,
              user: this._currentUser,
              difficulty: data.difficulty,
              activeCards: data.activeCards,
            });
            this._initSidebar(data);
            this.wait.next(false);
            this._roomSubscriber = this.streamFromFirebase.subscribe((res) => this._updateLocalState(res));
            firstDataSubscriber.unsubscribe();
          }
        }
        else {
          this._initData(data);
          this.startGame.next({
            cards: data.cards,
            user: this._currentUser,
            difficulty: data.difficulty,
            activeCards: data.activeCards,
          });
          this._initSidebar(data);
          firstDataSubscriber.unsubscribe();
          this._roomSubscriber = this.streamFromFirebase.subscribe((res) => this._updateLocalState(res));
        }

      });

    this._roomObservable = this._dbService.getObjectFromFB(`rooms/${roomId}`)
      .subscribe(this.streamFromFirebase);
  }


  private _createNewUser(){
    let newID = Date.now();
    localStorage["userid"] = newID;
    this._currentUser = {
      id: newID,
      isActive: false,
      name: "Orange",
      result: "lose",
      score: 20
    };
    this._users.push(this._currentUser);
    this._dbService.updateStateOnFireBase(this._roomId, this._cards, this._activeCards, this._users, this.countHiddenBlock);
  }


  private checkNewUser(users){
    if(!localStorage["userid"]) return true;
    let localStorageUserId: number = +localStorage["userid"];
    let result = users.filter((user) => +user.id === localStorageUserId);
    return result.length === 0;
  }


  private _initData(data) {
    this._cards = data.cards;
    this._users = data.users;
    this._gameType = data.type;
    this.countHiddenBlock = data.countHiddenBlock;
    this._activeCards = data.activeCards || [];
    let localStorageUserId: number = +localStorage["userid"];

    if(localStorage["userid"]){
      data.users.forEach(user => {
        if (user.id === localStorageUserId) {
          this._currentUser = Object.assign({}, user)
        }
      });
    }

  }


  private _initSidebar(data) {

    this._sidebarService.initSidebar(data);

    this._timeSubscriber = this._sidebarService.timeIsUp.subscribe(() => {
      if (this._gameType === 'single') {
        this.endGame();
      }
      else if (this._gameType === 'multi') {
        if(this._timerId)clearTimeout(this._timerId);
        this._currentUser.score -= 5;
        this._changeUserScore();

        this.pause.next();
        this._users.forEach(user => user.isActive = !user.isActive);
        this._activeCards.forEach( card => card.isOpen = false );
        this._dbService.updateStateOnFireBase(this._roomId, this._cards, this._activeCards, this._users, this.countHiddenBlock);
      }
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
    this._sidebarService.changeUserState(data.users);
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
          if (!activeCards[0].isOpen || activeCards[0].isHide) {
             if(this._gameType === 'multi'){
               this._sidebarService.stopTimer();
               this._sidebarService.startTimer();
             }
            if (this._currentUser.isActive) {
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
      this._checkActiveCards(activeCards);
    }
    this._updateCards(activeCards);
    this._dbService.updateStateOnFireBase(this._roomId, this._cards, activeCards, this._users, this.countHiddenBlock);
  }


  private _checkActiveCards(activeCards: TCard[]) {
    if (activeCards[0].wordId === activeCards[1].wordId) {
      activeCards[0].isHide = true;
      activeCards[1].isHide = true;
      this._currentUser.score += 10;
      this.countHiddenBlock += 1;
      if (this._gameType === 'multi') this._sidebarService.stopTimer();
    } else {
      this._timerId = setTimeout(() => {
        if (this._gameType === 'multi') this._users.forEach(user => user.isActive = !user.isActive);
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
        if (user.score < 0){
          this._currentUser.score = 0;
          user.score = 0;
        }
      }
    });
  }


  private _updateCards(activeCards: TCard[]) {
    this._activeCards = activeCards;
    this._cards.forEach(card => {
      activeCards.forEach(activeCard => {
        if (card.id === activeCard.id) {
          card.isOpen = activeCard.isOpen;
          card.isHide = activeCard.isHide;
        }
      });
    });
  }


  private _isWin(cells: TCard[]): void {
    if (this.countHiddenBlock === (cells.length / 2) ) {

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


  public goToMainMenu(){
    this._dbService.deleteRoom(this._roomId)
      .then(() => this._router.navigate([`mainmenu`]))
  }


  public endGame() {
    this.removeSubscriptions();
    this._dbService.updateStateOnFireBase(this._roomId, this._cards, [], this._users, this.countHiddenBlock)
      .then(() => this._router.navigate([`playzone/${this._roomId}/result`]));

  }


  public removeSubscriptions() {
    this._roomSubscriber.unsubscribe();
    this.streamFromFirebase.unsubscribe();
    this._roomObservable.unsubscribe();
    this._sidebarService.stopTimer();
  }

}
