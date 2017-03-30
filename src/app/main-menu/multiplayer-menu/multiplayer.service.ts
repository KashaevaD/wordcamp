import { Injectable } from '@angular/core';

@Injectable()
export class MultiplayerService {

  private _starOfDifficulty: {src: string}[] = [
    {src: "assets/img/star.png"},
    {src: "assets/img/star.png"},
    {src: "assets/img/star.png"}
  ];

  constructor() {}


  public isItemExistsInCurrentArray(item:any, array: TOutputData[]):boolean {
    let isSame: boolean = false;

    array.forEach(elem => {
      if (elem === item) isSame = true;
    });

    return isSame;
  }

  public setDifficultyInGame(difficulty):{src: string}[] {
    let count: number = 0;
    let arr: {src: string}[] = [];

    switch (difficulty) {
        case "small": count = 1;break;
        case "medium": count = 2;break;
        case "large": count = 3;break;
    }

    for (let i:number = 0; i < count; i++ ) {
      arr.push(this._starOfDifficulty[i]);
    }
    return arr;
  }

}
