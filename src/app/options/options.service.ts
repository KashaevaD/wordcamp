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
    let firstLang = navigator.language.slice(0, 2)
    let browserLanguage = (type === "first") ?  firstLang : this._getDifferentLangFromFirst(firstLang);
    let selectedLang = "";

    languagesList.forEach(languageName => {
        if (browserLanguage === languageName) {
          selectedLang = languageName;
          return;
        }
        selectedLang = "en";
    });
    return selectedLang;
  }

  private _getDifferentLangFromFirst(first) {
    let secondLanguage = "en";
    let diffLang = (navigator as any).languages.filter(item => {
      //if (item.slice(0, 2) !== first) return item.slice(0, 2);
      return item.slice(0, 2) !== first;
    });
    if (diffLang.length) secondLanguage = diffLang[0].slice(0, 2);
    return secondLanguage;
  }

}

