import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';
import { firebaseConfig } from './firebase.config';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { QRCodeModule } from 'angular2-qrcode';

import { MainMenuComponent } from './main-menu/main-menu.component';
import { CreateGameService } from "./main-menu/create-game.service";

import { SingleplayerMenuComponent } from './main-menu/singleplayer-menu/singleplayer-menu.component';
import { SingleplayerService } from "./main-menu/singleplayer-menu/singleplayer.service";

import { MultiplayerMenuComponent } from  './main-menu/multiplayer-menu/multiplayer-menu.component';
import { MultiplayerService } from "./main-menu/multiplayer-menu/multiplayer.service";

import { PlayzoneComponent } from './playzone/playzone.component';
import { GamePlayService } from "./playzone/game-play.service";
import { SidebarComponent } from './playzone/sidebar/sidebar.component'
import { ResultComponent } from './result/result.component';

import { LocalStorageService } from "./local-storage.service";
import { DBService } from './db.service';
import { JoinGameService } from "./main-menu/join-game.service"
import { SidebarService } from "./playzone/sidebar/sidebar.service";

import { AppComponent } from './app.component';
import { DropdownModule } from 'ng2-bootstrap';
import { IntroductionComponent } from './introduction/introduction.component';
import { IntroductionService } from './introduction/introduction.service';

const routes = [
  {
    path: '', component: IntroductionComponent
  },
  {
    path: "mainmenu", component: MainMenuComponent
  },
  {
    path: "mainmenu/multi", component: MultiplayerMenuComponent
  },
  {
    path: "mainmenu/multi/:id", component: MultiplayerMenuComponent
  },
  {
    path: "result", component: ResultComponent
  },
  {
    path: "playzone/:id", component: PlayzoneComponent
  },
  {
    path: "playzone/:id/result", component: ResultComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    MainMenuComponent,
    PlayzoneComponent,
    MultiplayerMenuComponent,
    SingleplayerMenuComponent,
    SidebarComponent,
    ResultComponent,
    IntroductionComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    RouterModule.forRoot(routes),
    DropdownModule.forRoot(),
    QRCodeModule
  ],
  providers: [CreateGameService, SingleplayerService, LocalStorageService, MultiplayerService, JoinGameService, GamePlayService, DBService, SidebarService, IntroductionService],
  bootstrap: [AppComponent],
})
export class AppModule { }
