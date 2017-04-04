import { Injectable } from '@angular/core';
import { LocalStorageService } from "../local-storage.service";

@Injectable()
export class OptionsService {

  constructor(private _localSrorage: LocalStorageService) { }

  public setOptionsToLocalStorage(options): void {
    this._localSrorage.setLocalStorageValue("user", JSON.stringify(options));
  }

  public getOptionsFromLocalStorage(): any{
    return JSON.parse(this._localSrorage.getLocalStorageValue("user"));
  }


  // public setDefaultOptions() {

  //   this._gameOptions.difficulty = "small";

  //     this._dictionaryListObservable = this._dbService.getObjectFromFB(`dictionary/languagaesList`);
  //     this._dictionaryList = this._dictionaryListObservable.subscribe(languagesList => {
  //       this._setLanguages(languagesList);
  //       this.gameOptionsSend.emit(this._gameOptions);
  //       this._dictionaryList.unsubscribe();
  //     });
  //   }


  // private _setLanguages(languagesList) {
  //   this._setLanguageFromBrowser("first", languagesList);
  //   this._setLanguageFromBrowser("last", languagesList);
  // }

  // private _setLanguageFromBrowser(languageNumber, languagesList) {
  //   let browserLanguage = (languageNumber === "first") ? navigator.language.slice(0, 2) : (navigator as any).languages[0].slice(0, 2);

  //   languagesList.forEach(languageName => {
  //       if (browserLanguage === languageName) {
  //         this._gameOptions.languages[languageNumber] = languageName;
  //         return;
  //       }
  //       this._gameOptions.languages[languageNumber] = "en";
  //     });
  //}
}

