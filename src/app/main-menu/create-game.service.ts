import { Injectable } from '@angular/core';
import { SIZE } from '../constants';
import { Subscription, Subject } from "rxjs";

import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class CreateGameService {

  private _createRoomOnFirebase: FirebaseObjectObservable<any>;
  private _firstLanguageArray: string[];
  private _lastLanguageArray: string[];

  public startPlayingGame: Subject<number>;
  public waitForSecondUserMultiplayer: Subject<number>;



  constructor(private _af: AngularFire) {
    this.startPlayingGame = new Subject();
    this.waitForSecondUserMultiplayer = new Subject();

    this._createRoomOnFirebase = this._af.database.object("rooms");
  }

  public makePlayZone({ languages, difficulty, username, type }): void {
    let score = 20;
    let size: { w: number, h: number } = SIZE[difficulty];
    let [lang1, lang2] = languages.split('_');
    let cards: TCard[][] = [];
    let idRoom: number = this._getGeneratedIdForRoom();


    this._af.database.object(`/dictionary/${lang1}`)
      .map(res => {
        this._firstLanguageArray = res;
      })
      .switchMap(event => this._af.database.object(`/dictionary/${lang2}`))
      .map(res => {
        this._lastLanguageArray = res;
      })
      .subscribe(() => {
        let newRoom: any = {};

        cards = this._createPlayingCards(size.w, size.h);
        newRoom[idRoom] = { cards: cards, type: type, state: true, difficulty: difficulty, languages: languages, users: [{ name: username, score: score, id: 0, isActive: true, activity: true, result: 'lose' }], countHiddenBlock: 0 };

        this._createRoomOnFirebase.update(newRoom)          //send data to FireBase
          .then(() => {
            return (type === "single") ? this.startPlayingGame.next(idRoom) : this.waitForSecondUserMultiplayer.next(idRoom);
            //send roomId to single.components.ts
          });
      });
  }


  private _createPlayingCards(col: number, row: number): TCard[][] {
    let arr: TCard[] = [];
    let wordIdList: number[] = this._getWordIdList(row * col);

    for (let i: number = 0; i < row * col; i++) {
      let square: TCard = {
        id: i,
        wordId: Math.ceil((i + 1) / 2),
        isOpen: false,
        isHide: false,
        word: this._getWordFromLanguage(i, wordIdList[Math.floor(i / 2)])
      };
      arr.push(square);
    }
    arr.sort(this._sortRandom);
    return this._createMatrix(arr, row, col);
  }

  private _createMatrix(array: TCard[], row: number, col: number): TCard[][] {
    let matrix: TCard[][] = [];
    let count: number = 0;

    for (let i: number = 0; i < row; i++) {
      matrix[i] = [];
      for (let j: number = 0; j < col; j++) {
        matrix[i][j] = array[count];
        count++;
      }
    }
    return matrix;
  }

  private _sortRandom(): number {
    return Math.random() - 0.5;
  }

  private _getWordIdList(size: number): number[] {                       //get different and single Ids from dictionary
    let wordsId: number[] = [];                         //array of different Id

    for (let i: number = 0; i < size / 2; i++) {
      let temp: number = Math.round(Math.random() * size / 2 + 1);

      (wordsId.indexOf(temp) == -1) ? wordsId.push(temp) : i--;
    }
    return wordsId;
  }

  private _getWordFromLanguage(item: number, wordId: number): string {
    return (item % 2 === 0) ? this._firstLanguageArray[wordId] : this._lastLanguageArray[wordId];
  }

  private _getGeneratedIdForRoom(): number {
    return new Date().getTime();
  }

  public getShariableLink(roomId: number): string {
    let base = document.querySelector('base').getAttribute("href") || "/";
    return window.location.origin.concat(base, "mainmenu/multi/", roomId.toString());
  }
}

