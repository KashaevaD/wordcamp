import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { DBService } from '../db.service';
import { CreateGameService } from '../main-menu/create-game.service';
import { FirebaseObjectObservable } from 'angularfire2';
import { Subscription } from "rxjs";


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  private _roomId:number;
  public score:number;
  public isWin:boolean;
  public isLose:boolean;
  public draw:boolean;
  public multi:boolean = false;
  private _roomObservable: FirebaseObjectObservable<any>;
  private _room: Subscription;
  private _model: TInputData = {
    type: '',
    languages: '',
    difficulty: '',
    username: '',
  };

  public showModal: boolean;
  public starsDone: {small: boolean, medium:boolean, large:boolean} = {
    small: true,
    medium: false,
    large: false
  };

  constructor(private _dbService: DBService,
              private _createGameService: CreateGameService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
             ){

        this._activatedRoute.params.forEach((param: Params) => {
          this._roomId = param['id'];
        });

        this._roomObservable = this._dbService.getObjectFromFB(`rooms/${this._roomId}`);
        this._room = this._roomObservable.subscribe(data=> {

          if (data.$value === null) {
            this._room.unsubscribe();
            return;

          }

          this._getUserResult(data.users);
          this._preparePlayAgain(data);
          this._countStars(data.difficulty);
          setTimeout(() => this.showModal = true);
        });
  }

  ngOnInit(){

  }

  private _preparePlayAgain(options: TStoreData): void {
    this.multi = (options.type === 'multi');
    if (this.multi) return;
    this._model = {
      languages: options.languages,
      difficulty: options.difficulty,
      username: options.users[0].name,
      type: options.type
    };
  }

  private _getUserResult(users: TUser[]): void {
    let userid:number = + sessionStorage['userid'];
    users.forEach((user) => {
      if (user.id === userid){
        this.score = user.score;
        switch (user.result)  {
          case 'win':
            this.isWin = true;
            break;
          case 'lose':
            this.isLose = true;
            break;
          case 'draw':
            this.draw = true;
            break;
        }

      }
    });
  }

  private _countStars(difficulty:string): void {
    if (difficulty === 'medium') {
      this.starsDone.medium = true
    }
    else if (difficulty === 'large') {
      this.starsDone.medium = true;
      this.starsDone.large = true;
    }
  }

  public playAgainAlone() :void {
    this._room.unsubscribe();
    this._deleteRoomAndStartNewGame();
  }

  public playAgainWithFriend() {
    this._room.unsubscribe();
    this._model.type = "multi";
    this._deleteRoomAndStartNewGame();
  }

  private _deleteRoomAndStartNewGame() :void {
    this._dbService.deleteRoom(this._roomId);
    this._roomObservable.remove().then( () => this._createGameService.makePlayZone(this._model));
  }

  public goToMainMenu(): void{
    this._room.unsubscribe();
    this._dbService.deleteRoom(this._roomId).then(() => this._router.navigate(['mainmenu']));
  }

}
