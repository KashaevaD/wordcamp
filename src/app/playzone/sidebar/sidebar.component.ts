import { Component, OnDestroy } from '@angular/core';
import { DBService } from '../../db.service';
import { SidebarService } from "./sidebar.service"
import { Subscription } from "rxjs";
import { LocalStorageService } from '../../local-storage.service'
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnDestroy{

  private _roomId:number;
  private _roomSubscriber:Subscription;
  private _userSubscriber:Subscription;
  private _timeSubscriber:Subscription;
  public firstUser: TUser = {name: "", score: 20, isActive: false, id: 0, result: "lose"};
  public secondUser: TUser = {name: "Unknow", score: 20, isActive: false, id: 1, result: "lose"};
  public multi:boolean;
  public time:number;
  private onBeforeUnloadHandler;
  private onUnloadHandler;


  constructor(
    private _dbService: DBService,
    private _sidebarService: SidebarService,
    private _activatedRoute: ActivatedRoute,
    private _localStorageService: LocalStorageService,
    private _router: Router
  ) {

    let localStorage = this._localStorageService.getLocalStorageValue("user");
    if(localStorage) this.firstUser.name = JSON.parse(localStorage).username;

    this.time = 0;

    this._activatedRoute.params.forEach((param: Params) => {
      this._roomId = param['id'];
    });

    this._roomSubscriber = this._sidebarService.room.subscribe((options) => {
      this._setSidebar(options);
      this._sidebarService.initTimer(options);
    });

    this._timeSubscriber = this._sidebarService.timeSend.subscribe( (number) => {
      this.time = number;
    });

    this._userSubscriber = this._sidebarService.users.subscribe((users) => {
      this._changeUsersState(users);
    });

    this.onBeforeUnloadHandler = this._onBeforeUnload;
    this.onUnloadHandler = this._onUnload.bind(this);


    addEventListener("beforeunload",  this.onBeforeUnloadHandler);
    addEventListener("unload",  this.onUnloadHandler);
  }


  ngOnDestroy(){
    this._roomSubscriber.unsubscribe();
    this._userSubscriber.unsubscribe();
    this._timeSubscriber.unsubscribe();
    this._sidebarService.stopTimer();
    removeEventListener("beforeunload",  this.onBeforeUnloadHandler);
    removeEventListener("unload",  this.onUnloadHandler);
  }

  private _onBeforeUnload (e) {
    setTimeout(()=>confirm('You are sure?'));
    let confirmationMessage = "Game will over if you refresh page. Are you sure?";

    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }

  private _onUnload () {
    removeEventListener("beforeunload",  this.onBeforeUnloadHandler);
    removeEventListener("unload",  this.onUnloadHandler);
    this.goToMainMenu();
  }


  private _setSidebar(options:TStoreData): void {
    (options.type !== "single") ? this.multi = true : this.multi = false;
    this.firstUser = options.users[0];
    if (options.users.length > 1) this.secondUser = options.users[1];
  }


  private _changeUsersState(users: TUser[]): void {
    if (this.multi === false) {
      this.firstUser = users[0];
    } else {
      [this.firstUser, this.secondUser] = users;
    }
  }

  public goToMainMenu(): void{
    this._sidebarService.goToMainMenu.emit();
  }

}
