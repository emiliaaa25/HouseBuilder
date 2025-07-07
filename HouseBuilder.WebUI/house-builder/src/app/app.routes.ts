import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { CreateAccountComponent } from './components/create-account/create-account.component';
import { ClientProfileComponent } from './components/client-profile/client-profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { HouseModelComponent } from './components/house-model/house-model.component';
import { GeminiHouseSuggestionsComponent } from './components/gemini/gemini-house-suggestions.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { GalleryViewComponent } from './components/gallery-view/gallery-view.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {path: 'login', component: LoginComponent},
    {path: 'register', component: CreateAccountComponent},
    {path: 'client-profile/:id', component: ClientProfileComponent}, 
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:token', component: ResetPasswordComponent },
    {path: 'projects/:id', component: ProjectDetailsComponent},
    {path:'3d-view/:houseSpecsId/:projectId',component:HouseModelComponent},
    {path:'gemini', component:GeminiHouseSuggestionsComponent},
    {path: 'gallery', component: GalleryComponent},
    {path: 'gallery/view/:id',component: GalleryViewComponent}


];
