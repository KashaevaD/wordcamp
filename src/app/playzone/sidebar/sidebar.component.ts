import { Component, ElementRef } from '@angular/core';
import { DBService } from '../../db.service';
import { SidebarService } from "./sidebar.service"
import { Subscription } from "rxjs";
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  private _roomId:number;
  private _roomSubscriber:Subscription;
  private _userSubscriber:Subscription;
  private _timeSubscriber:Subscription;
  public firstUser: TUser = {name: "", score: 0, isActive: false, id: 0, result: "lose"};
  public secondUser: TUser = {name: "", score: 0, isActive: false, id: 1, result: "lose"};
  public multi:boolean;
  public time:number;


  constructor(
    private _dbService: DBService,
    private _sidebarService: SidebarService,
    private _activatedRoute: ActivatedRoute
  ) {

    this._activatedRoute.params.forEach((param: Params) => {
      this._roomId = param['id'];
    });

    this._roomSubscriber = this._sidebarService.room.subscribe((options) => {
      this._setSidebar(options);
      this._sidebarService.initTimer(options);
      this._roomSubscriber.unsubscribe();
    });

    this._timeSubscriber = this._sidebarService.timeSend.subscribe( (number) => {
      this.time = number/1000;
    });

    this._userSubscriber = this._sidebarService.users.subscribe((users) => {
      this._changeUsersState(users);
    });

    this._sidebarService.timeIsUp.subscribe( () => {
      if (!this.multi) {
        this._roomSubscriber.unsubscribe()
      }
    });
  }


  private _setSidebar(options:TStoreData): void {
    (options.type !== "single") ? this.multi = true : this.multi = false;
    this.firstUser = options.users[0];
    this.secondUser = options.users[1];
  }


  private _changeUsersState(users: TUser[]): void {
    if (this.multi === false) {
      this.firstUser = users[0];
    } else {
      [this.firstUser, this.secondUser] = users;
    }
  }

  public goToMainMenu(): void{
    this._userSubscriber.unsubscribe();
    this._sidebarService.stopTimer();
    this._timeSubscriber.unsubscribe();
    this._dbService.deleteRoom(this._roomId);
  }

}
