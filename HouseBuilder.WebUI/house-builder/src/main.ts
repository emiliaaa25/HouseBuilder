import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '../src/app/app.component'; 
import { provideRouter } from '@angular/router';
import { routes } from '../src/app/app.routes'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    BrowserAnimationsModule,
    ReactiveFormsModule,
    [provideHttpClient()]
  ]
}).catch(err => console.error(err));