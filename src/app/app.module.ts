import { NgModule  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

// Not intuitive, but *this* import makes <mat-form-field> legal.
import { MatInputModule } from "@angular/material/input";

import { AppComponent } from './app.component';
import { MainPaneComponent } from './main-pane/main-pane.component'
import { EditDetailsComponent } from './edit-details/edit-details.component'


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    RouterModule.forRoot([
      { path: 'edit', component: EditDetailsComponent },
      { path: '', component: MainPaneComponent },
    ]),
  ],
  declarations: [
    AppComponent,
    MainPaneComponent,
    EditDetailsComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
