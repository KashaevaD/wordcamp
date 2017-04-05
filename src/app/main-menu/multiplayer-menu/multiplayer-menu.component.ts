import { Component, OnInit } from '@angular/core';
import { MultiplayerService } from "./multiplayer.service";
import { LocalStorageService } from "../../local-storage.service";
import { Subscription } from "rxjs";
import { JoinGameService } from "../join-game.service";
import { DBService } from '../../db.service';
import { CreateGameService } from "../create-game.service";
import { Router} from '@angular/router';

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
              private _router: Router,
              private _dbService: DBService) {
   this.imageOfLanguages = this._joingameService.imageOfLanguages;
   this._updateRooms();
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
    sessionStorage['userid'] = this._createGameService.getGeneratedRandomId().toString();
    this._joingameService.addUserToFireBase(idRoom);
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
    (event.target as HTMLElement).setAttribute("disabled", "true");
    let options = JSON.parse(this._localSrorage.getLocalStorageValue("user"));
    options.type ="multi";
    this._createGameService.makePlayZone(options);
  }

  public goToMainMenu(): void {
     this._router.navigate(['mainmenu']);
  }

  public goToOptions(): void {
     this._router.navigate(['options']);
  }

}
