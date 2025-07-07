import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import { provideHttpClient } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { MatIconModule } from "@angular/material/icon";
import { DragDrop3dService } from "./services/drag-and-drop.service";
import { FormatResponsePipe } from "./pipes/formatResponsePipe.pipe";


@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        NavbarComponent,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatIconModule,
        FormatResponsePipe,
        RouterModule.forRoot(routes),
        
    ],
    providers: [provideHttpClient(),DragDrop3dService], 
    })
    export class AppModule { }