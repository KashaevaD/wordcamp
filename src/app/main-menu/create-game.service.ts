import { Injectable } from '@angular/core';
import { SIZE } from '../constants';
import { Subscription, Subject } from "rxjs";
import { DBService } from '../db.service';
import { Router} from '@angular/router';
import { LocalStorageService } from "../local-storage.service";

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

  // public defaultOptionsForGame = {
  //   username: "",
  //   difficulty: "small",
  //   languages : {
  //     first: "en",
  //     last: "en"
  //   },
  //   type: ""
  // };

  constructor(private _dbService: DBService,  private _router: Router, private _localSrorage: LocalStorageService) {
    this.startPlayingGame = new Subject();
    this.waitForSecondUserMultiplayer = new Subject();

    this._createRoomOnFirebase = this._dbService.getObjectFromFB("rooms");
  }

  public makePlayZone({ languages, difficulty, username, type }): void {
    let score = 20;
    let size: { w: number, h: number } = SIZE[difficulty];
    let lang1:string = languages.first;
    let lang2:string = languages.last;
    let cards: TCard[] = [];
    let idRoom: number = this.getGeneratedRandomId();


    this._dbService.getObjectFromFB(`/dictionary/${lang1}`)
      .map(res => {
        this._firstLanguageArray = res;
      })
      .switchMap(event => this._dbService.getObjectFromFB(`/dictionary/${lang2}`))
      .map(res => {
        this._lastLanguageArray = res;
      })
      .subscribe(() => {
        let newRoom: any = {};

        cards = this._createPlayingCards(size.w, size.h);
        newRoom[idRoom] = { cards: cards, type: type, state: true, difficulty: difficulty, languages: languages, users: [{ name: username, score: score, id: this._localSrorage.getLocalStorageValue("userid"), isActive: true, activity: true, result: 'lose' }], countHiddenBlock: 0 };

        this._createRoomOnFirebase.update(newRoom)          //send data to FireBase
          .then(() => {
            //return (type === "single") ? this.startPlayingGame.next(idRoom) : this.waitForSecondUserMultiplayer.next(idRoom);
            this._router.navigate(['playzone', idRoom]);
            //return;
            //send roomId to single.components.ts
          });
      });
  }


  private _createPlayingCards(col: number, row: number): TCard[] {
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
    return arr;

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

  public getGeneratedRandomId(): number {
    return new Date().getTime();
  }

}

