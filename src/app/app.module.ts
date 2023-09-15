import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DialogComponent } from './dialog/dialog.component';
import { EventsComponent } from './events/events.component';
import { LegendComponent } from './legend/legend.component';
import { rxStompServiceFactory } from './rx-stomp-service-factory';
import { RxStompService } from './rx-stomp.service';

@NgModule({
  declarations: [
    AppComponent,
    EventsComponent,
    DialogComponent,
    LegendComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory
    },
    LegendComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
