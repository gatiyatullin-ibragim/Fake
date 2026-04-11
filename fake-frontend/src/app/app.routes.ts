import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { ProfileComponent } from './auth/profile.component';

export const routes: Routes = [
  { path: '',            component: HomeComponent          },
  { path: 'home',        component: HomeComponent          },
  { path: 'catalog',     component: CatalogComponent       },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'login',       component: LoginComponent         },
  { path: 'register',    component: RegisterComponent      },
  { path: 'profile',     component: ProfileComponent       },
];
