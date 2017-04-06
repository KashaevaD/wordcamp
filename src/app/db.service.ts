import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';


@Injectable()
export class DBService {

  constructor(private _af : AngularFire) {}

  public getObjectFromFB(path: string):FirebaseObjectObservable<any>  {
    return this._af.database.object(path);
  }


  public updateStateOnFireBase(id: number, cards:TCard[], activeCards:TCard[],  users: TUser[], countHiddenBlock){
    return this._af.database.object(`rooms/${id}`).update({cards: cards, activeCards: activeCards, users: users, countHiddenBlock: countHiddenBlock });
  }



  public getAllMultiPlayerRoom(): FirebaseListObservable<any> {
    const queryObservable = this._af.database.list(`rooms`, {
        query: {
        orderByChild: "type",
        equalTo: "multi"
      }
    });

    return queryObservable;
  }

  public deleteRoom(id){
    return this._af.database.object(`rooms/${id}`).remove();
  }

}
