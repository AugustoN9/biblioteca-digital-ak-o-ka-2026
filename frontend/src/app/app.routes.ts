import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CategoryDetailComponent } from './pages/category-detail/category-detail.component';
import { SubcategoryDetailComponent } from './pages/subcategory-detail/subcategory-detail.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'categoria/:slug', component: CategoryDetailComponent },
  { path: 'categoria/:slug/:subSlug', component: SubcategoryDetailComponent },
  { path: '**', redirectTo: '' }
];