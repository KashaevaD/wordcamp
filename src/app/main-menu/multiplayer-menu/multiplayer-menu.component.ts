import { Component, OnInit } from '@angular/core';
import { MultiplayerService } from "./multiplayer.service";
import { LocalStorageService } from "../../local-storage.service";
import { Subscription } from "rxjs";
import { JoinGameService } from "../join-game.service";
import { DBService } from '../../db.service';
import { CreateGameService } from "../create-game.service";


@Component({
  selector: 'app-multiplayer-menu',
  templateUrl: './multiplayer-menu.component.html',
  styleUrls: ['./multiplayer-menu.component.css']
})
export class MultiplayerMenuComponent implements OnInit {

  public rooms: TOutputData[] =[];
  private subscribe: Subscription;
  private imageOfLanguages: any[] = [];

  constructor(private _multiService: MultiplayerService,
              private _joingameService: JoinGameService,
              private _localSrorage: LocalStorageService,
              private _createGameService: CreateGameService,
              private _dbService: DBService) {
   this.imageOfLanguages = this._joingameService.imageOfLanguages;
   this._createGameService.getValueFromStorage();

   
   this._updateRooms();
    // event on starting game
    // let startGameSubscriber: Subscription = this._createGameService.startPlayingGame.subscribe((id) => {
    //   startGameSubscriber.unsubscribe();
    //    this._router.navigate(['playzone', id]);  // send user  on game-field
    // });

  }

  ngOnInit() {
    // this._activatedRoute.params.forEach((param: Params) => {
    //   let idRoom:number = param['id'];
    //     if (idRoom) {
    //       this._joingameService.doIfShareableLinkIsActivated(idRoom);
    //     }
    // });
  }

  private _updateRooms() {
    this.subscribe = this._dbService.getAllMultiPlayerRoom().subscribe(data => {
      this.rooms  =
        data.filter(item => {
                if (item.users.length < 2 && !this._multiService.isItemExistsInCurrentArray(item, this.rooms))  return item;
            })
            .map(item => {
                return {id: item.$key, player: item.users[0].name, difficulty: this._multiService.setDifficultyInGame(item.difficulty), language: this._multiService.setSrcForImageLanguage(this.imageOfLanguages,item.languages)};
            });
      });
  }

  public startGame(idRoom: number):void {
    this.subscribe.unsubscribe();
    this._joingameService.addUserToFireBase(idRoom);
    this._localSrorage.setLocalStorageValue("userid", "1");
  }

  public findRoomByUserName(e) {
    let inputValue = e.target.value;
    if (inputValue !== "") {
      let arr = this.rooms.filter((item)=> {
        let regex = new RegExp(`${inputValue}`, 'ig');
        if(regex.test(item.player)) return item; 
      });
      this.rooms = arr;
    } else {
      this._updateRooms();
    }
  }

  public startMultiGame(event): void {
    this._createGameService.defaultOptionsForGame.type ="multi";
    console.log( this._createGameService.defaultOptionsForGame);
    this._createGameService.makePlayZone(this._createGameService.defaultOptionsForGame);
  }


}
