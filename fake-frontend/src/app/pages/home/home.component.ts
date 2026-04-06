import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  categories = [
    { name: 'Футболки',       slug: 't-shirts',   label: 'SHOP ФУТБОЛКИ'   },
    { name: 'Кроссовки',      slug: 'sneakers',   label: 'SHOP КРОССОВКИ'  },
    { name: 'Верхняя одежда', slug: 'outerwear',  label: 'SHOP ОДЕЖДА'     },
    { name: 'Баскетбол',      slug: 'basketball', label: 'SHOP БАСКЕТБОЛ'  },
    { name: 'Футбол',         slug: 'football',   label: 'SHOP ФУТБОЛ'     },
    { name: 'Шорты',          slug: 'shorts',     label: 'SHOP ШОРТЫ'      },
  ];
}
