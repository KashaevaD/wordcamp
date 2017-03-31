import { Injectable } from '@angular/core';
import { CreateGameService } from "./create-game.service";
import { LocalStorageService } from "../local-storage.service";
import { Subscription } from "rxjs";
import { DBService } from '../db.service';

@Injectable()
export class JoinGameService {

    public imageOfLanguages: any[] = [
    {
      src: "assets/img/icons/germany.svg",
      name: "de"
    },
    {
      src: "assets/img/icons/united-kingdom.svg",
      name: "en"
    },
    {
      src: "assets/img/icons/russia.svg",
      name: "ru"
    },
    {
      src: "assets/img/icons/netherlandish.svg",
      name: "nl"
    }
  ];

   constructor(private _dbService: DBService,
              private _createGameService: CreateGameService,
              private _localSrorage: LocalStorageService) {}

  public addUserToFireBase(idRoom: number): void {

    let newUser: TUser = {name: this._getUserNameFromLocalStorage(), score: 20, id: 1, isActive: false, result: "lose"};

    let currentUser: TUser;

    let roomSubscribe: Subscription = this._dbService.getObjectFromFB(`rooms/${idRoom}`).subscribe((data) => {
            currentUser = data.users[0];
            roomSubscribe.unsubscribe();

           this._dbService.getObjectFromFB(`rooms/${idRoom}`).update({users: [currentUser, newUser], state: true})
            .then(() => this._createGameService.startPlayingGame.next(idRoom));
      });
  }

  private _getUserNameFromLocalStorage(): string {
    return this._localSrorage.getLocalStorageValue("username") || "Anonimous";
  }


 public doIfShareableLinkIsActivated(roomId: number): void {
   console.log("share", roomId);

    let shareLink: Subscription = this._dbService.getObjectFromFB(`rooms/${roomId}`).subscribe(data => {
      if (data.users.length === 1) {
        shareLink.unsubscribe();
        this._localSrorage.setLocalStorageValue("userid", "1");
        this.addUserToFireBase(roomId);
      }
    });
  }

}
