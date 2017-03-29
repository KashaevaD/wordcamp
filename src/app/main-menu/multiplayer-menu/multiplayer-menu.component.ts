import { Component, OnInit } from '@angular/core';
import { MultiplayerService } from "./multiplayer.service";
import { LocalStorageService } from "../../local-storage.service";
import { Subscription } from "rxjs";
import { JoinGameService } from "../join-game.service";
import { DBService } from '../../db.service';
import { ActivatedRoute, Params } from '@angular/router';
import { CreateGameService } from "../create-game.service";
import { Router } from '@angular/router';

@Component({
  selector: 'app-multiplayer-menu',
  templateUrl: './multiplayer-menu.component.html',
  styleUrls: ['./multiplayer-menu.component.css']
})
export class MultiplayerMenuComponent implements OnInit {

  public rooms: TOutputData[] =[];
  private subscribe: Subscription;

  constructor(private _multiService: MultiplayerService,
              private _joingameService: JoinGameService,
              private _localSrorage: LocalStorageService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _createGameService: CreateGameService,
              private _dbService: DBService) {

   this.subscribe = this._dbService.getAllMultiPlayerRoom().subscribe(data => {
      this.rooms  =
        data.filter(item => {
                if (item.users.length < 2 && !this._multiService.isItemExistsInCurrentArray(item, this.rooms))  return item;
            })
            .map(item => {
                return {id: item.$key, player: item.users[0].name, difficulty: this._multiService.setDifficultyInGame(item.difficulty), language: item.languages};
            });
   });

    // event on starting game
    let startGameSubscriber: Subscription = this._createGameService.startPlayingGame.subscribe((id) => {
      startGameSubscriber.unsubscribe();
       this._router.navigate(['playzone', id]);  // send user  on game-field
    });

  }

  ngOnInit() {
    this._activatedRoute.params.forEach((param: Params) => {
      let idRoom:number = param['id'];
        if (idRoom) {
          this._joingameService.doIfShareableLinkIsActivated(idRoom);
        }
    });
  }

  public startGame(idRoom: number):void {
    this.subscribe.unsubscribe();
    console.log("dfdf");
    this._joingameService.addUserToFireBase(idRoom);
    this._localSrorage.setLocalStorageValue("userid", "1");
  }

}
