import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

export const routes: Routes = [
  { path: '',            component: HomeComponent          },
  { path: 'home',        component: HomeComponent          },
  { path: 'catalog',     component: CatalogComponent       },
  { path: 'product/:id', component: ProductDetailComponent },
];
