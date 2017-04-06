import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class SidebarService {

  public timeSend: EventEmitter<number>;
  public timeIsUp: EventEmitter<any>;
  public users: EventEmitter<any>;
  public room: EventEmitter<any>;
  private _timerId:any;
  private _time:number;
  private _startTime:number;
  private _activeUser:TUser;
  private _currentUserId:number;

  private readonly _timeDuration:{small:number, medium:number, large:number, multi:number} = {
    small: 60000,
    medium: 120000,
    large : 180000,
    multi: 7000,
  };


  constructor() {
    this.timeSend = new EventEmitter();
    this.timeIsUp = new EventEmitter();
    this.users = new EventEmitter();
    this.room = new EventEmitter();
  }


  public initSidebar(options:TStoreData):void {
    this.room.emit(options),
    this._currentUserId = +sessionStorage['userid'];
    this._getActiveUser(options.users);
  }


  public changeUserState(users:TUser[]):void {
    this.users.emit(users);
    this._getActiveUser(users);
  }


  private _getActiveUser(users:TUser[]):void {
    users.forEach((user) => {
      if (user.isActive === true){
        if(this._activeUser && user.id !== this._activeUser.id){
          this.stopTimer();
          this.startTimer();
        }
        this._activeUser = Object.assign({}, user);
      }
    });
  }


  public initTimer(options:TStoreData):void {
    if (options.type === "multi") {
      this._startTime = this.setDurationOfTime(options.type)
    } else {
      this._startTime = this.setDurationOfTime(options.difficulty)
    }
    this.startTimer();
  }


  private setDurationOfTime(difficult:string):number {
    return this._timeDuration[difficult];
  }


  private changeTime():void {
    if (!this._time) {
      this.stopTimer();
      if (this._activeUser.id === this._currentUserId) this.timeIsUp.emit();
    } else {
      this._time =  this._time - 1000;
      this.timeSend.emit(this._time);
    }
  }


  public startTimer ():void {
    this._time = this._startTime;
    this.timeSend.emit(this._time);
    this._timerId = setInterval(() => this.changeTime(), 1000);
  }


  public stopTimer():void {
    clearInterval(this._timerId);
  }

}
