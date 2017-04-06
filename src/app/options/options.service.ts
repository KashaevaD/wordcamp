import { Injectable, EventEmitter } from '@angular/core';
import { LocalStorageService } from "../local-storage.service";
import { DBService } from '../db.service';

@Injectable()
export class OptionsService {
  public getLangEmit:EventEmitter<any>;

  constructor(private _localSrorage: LocalStorageService,
              private _dbService: DBService) {
    this.getLangEmit = new EventEmitter();
  }

  public setDefaultOptions(username: string) {
    let options = {
      username: username,
      difficulty: "small",
      languages : {
        first: "",
        last: ""
      },
      type: ""
    };

    let dictionaryListObservable = this._dbService.getObjectFromFB(`dictionary/languagaesList`).subscribe(lang => {

      options.languages.first = this._getLanguage("first",lang);
      options.languages.last = this._getLanguage("last",lang);
      this.getLangEmit.emit(options);
      dictionaryListObservable.unsubscribe();
    });

  }

  private _getLanguage(type: string, languagesList: string[]): string {
    let firstLang = navigator.language.slice(0, 2);
    let browserLanguages = (type === "first") ?  [firstLang] : this._getDifferentLangFromFirst(firstLang);
    return this._findExistLanguages(languagesList,browserLanguages );
  }

  private _findExistLanguages(languagesList, currentLanguages) {
    let name = "en";
    currentLanguages.forEach (currentLanguages => {
      languagesList.forEach(languageName => {
        if (currentLanguages === languageName) name = languageName;
      });
    });
    return name;
  }

  private _getDifferentLangFromFirst(first): string[] {
    let secondLanguage = "en";
    if(navigator['languages']){
      let diffLang = navigator['languages']
        .map(item => {
          return item.slice(0, 2);
        })
        .filter(item => {
          return item !== first;
        });
      if (!diffLang.length) diffLang = ["en"];
      return diffLang;
    }else {
      return ["en"];
    }
  }

}

