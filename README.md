# E-commerce Platform
  
  ## Члены команды
  Гатиятуллин Ибрагим, Акшабаев Эмиль, Байдавлетов Санжар
  
  ## Tech Stack
  - Frontend: Angular 17+, TypeScript, RxJS
  - Backend: Django 4.2+, DRF, SQLite/PostgreSQL
  - Auth: JWT (Token-based)
  
  ## How to run
  Backend: python manage.py runserver
  Frontend: ng serve

## Postman Methods

Base URL: `http://localhost:8000`

Auth header for protected endpoints:
- `Authorization: Bearer <access_token>`

### Users

- `POST /api/users/register/`
  Body:
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "12345678",
    "password2": "12345678"
  }
  ```

- `POST /api/users/login/`
  Body:
  ```json
  {
    "username": "testuser",
    "password": "12345678"
  }
  ```

- `POST /api/users/logout/` (auth required)
  Body:
  ```json
  {
    "refresh": "<refresh_token>"
  }
  ```

- `GET /api/users/user/` (auth required)
- `GET /api/users/preferences/` (auth required)
- `POST /api/users/preferences/reset/` (auth required)

### Products

- `GET /api/products/`
- `GET /api/products/?q=white`
- `GET /api/products/?interests=running,football`
- `GET /api/products/recommendations/?limit=12`
- `GET /api/products/recommendations/?interests=running,street&limit=20`
- `GET /api/products/<id>/`
- `GET /api/products/similar/<id>/`

- `POST /api/products/create/`
  Body:
  ```json
  {
    "name": "New Product",
    "description": "Demo description",
    "price": 19990,
    "image": "https://example.com/image.jpg",
    "category": "t-shirts",
    "in_stock": true,
    "brand": "DemoBrand",
    "tags": ["casual", "summer"]
  }
  ```

- `POST /api/products/track-click/` (auth required)
  Body:
  ```json
  {
    "product_id": 1
  }
  ```

- `POST /api/products/track-view/` (auth required)
  Body:
  ```json
  {
    "product_id": 1
  }
  ```

### Orders

- `GET /api/orders/`
- `GET /api/orders/<id>/`

- `POST /api/orders/create/`
  Body:
  ```json
  {
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "name": "Футболка Classic White",
        "price": 12990,
        "image": "https://example.com/image.jpg",
        "brand": "Nike"
      }
    ]
  }
  ```

## Seed 100+ Products

From `Fakebackend` folder:

```bash
python manage.py seed_products --count 120
```

Optional reset before seeding:

```bash
python manage.py seed_products --count 120 --reset
```
