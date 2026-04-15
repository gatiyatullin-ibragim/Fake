import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { ProfileComponent } from './auth/profile.component';
import { CartComponent } from './pages/cart/cart-component/cart-component';
import { OrdersComponent } from './pages/orders/orders-component/orders-component';

export const routes: Routes = [
  { path: '',            component: HomeComponent          },
  { path: 'home',        component: HomeComponent          },
  { path: 'catalog',     component: CatalogComponent       },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'login',       component: LoginComponent         },
  { path: 'register',    component: RegisterComponent      },
  { path: 'profile',     component: ProfileComponent       },
  { path: 'cart',        component: CartComponent          },
  { path: 'orders',      component: OrdersComponent        },
  { path: '**',          redirectTo: ''                    },
];
