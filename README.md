# WE//DONE — Fitness Premium Web Application

Welcome to the **WE//DONE Fitness Premium** codebase. This repository contains the complete frontend client and backend API architecture for our premium gym supplements, activewear, and fitness accessories web application.

---

## 🏗️ Project Architecture & Stack

The application is split into two primary components:

### 1. Frontend Client (`/Frontend`)
A high-fidelity, high-performance static client built with a focus on modern user interfaces:
- **Core Technology**: Semantic HTML5, Vanilla JavaScript (ES6+), and CSS variables.
- **Styling**: TailwindCSS via CDN + custom local styling overrides (`style.css`) using custom animations and variables.
- **Key Visual Features**: Glassmorphism UI panel designs, Space Grotesk & Poppins Google Fonts integration, premium dark-mode backgrounds (`#090D16`), customized skeleton screen loaders, and toast-based micro-feedback.
- **Authentication Handling**: Integrates seamlessly with simple auth models, managing Bearer Tokens (SimpleJWT) securely in `localStorage` with route guards redirecting unauthorized visitors.

### 2. Backend Service (`/Backend`)
A robust REST API service powered by **Django** and **Django REST Framework (DRF)**:
- **Product Catalog APIs**: Handles categorization, filtering, search suggestions, price changes, and new product markers.
- **Cart API**: Operates endpoints for adding, updating, and removing items, computing dynamic subtotals, and tracking user-level quantities.
- **Authentication & Profiles**: Manages Django user models, profile endpoints (PATCH), and secure password updates.

---

## ⚡ Key Features

- **Auth Dropdown & Profile Settings**: Click the auth icon to reveal a dynamic user dashboard. The **Settings** page allows users to live-update personal details and security credentials (password rotation triggers automatic logout and prompt).
- **Interactive Cart Drawer**: Displays saved items on both the shop page and product detail view. Automatically resolves relative media directories dynamically from the Django server.
- **Recoverable Wishlist Storage**: Stores client-saved products in `localStorage`. If product IDs are missing, the system runs an automatic catalog search to match products by name and restore detail page links and cart capability.
- **Instant Search Suggestion Panel**: Suggests products matching user input directly in an overlay header bar.
- **BMI Fitness Calculator**: Real-time metric/imperial calculator suggesting workout plans and fitness advice tailored to user body mass index results.

---

## 🚀 Setup & Installation

### Backend Setup (Django)
1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the project dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and start the Django development server:
   ```bash
   python manage.py migrate
   python manage.py runserver 127.0.0.1:8000
   ```

### Frontend Setup
- Simply serve the `/Frontend` directory locally (e.g. using VS Code Live Server, Python's SimpleHTTPServer, or opening [index.html](file:///c:/Users/marya/Desktop/Fitness%20Premium/Frontend/index.html) directly in the browser).
- Ensure the frontend can reach the backend REST endpoints at `http://127.0.0.1:8000`.

---

## 📁 Repository Structure

```
Fitness Premium/
├── README.md
├── Backend/                          # Django REST Framework backend service
│   ├── manage.py                     # Django project entry point
│   ├── requirements.txt              # Python dependencies (DRF, SimpleJWT, etc.)
│   ├── core/                         # Django project configuration package
│   │   ├── __init__.py
│   │   ├── settings.py               # Project settings (CORS, JWT, installed apps)
│   │   ├── urls.py                   # Root URL dispatcher
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── accounts/                     # User auth & profile management app
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                 # Custom user / profile model
│   │   ├── serializers.py            # Auth & profile serializers
│   │   ├── views.py                  # Register, login, profile PATCH endpoints
│   │   ├── tests.py
│   │   └── migrations/
│   ├── products/                     # Product catalog app
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                 # Product & Category models
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py                  # Catalog, filtering, search suggestion views
│   │   ├── tests.py
│   │   └── migrations/
│   ├── cart/                         # Shopping cart app
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                 # CartItem model
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py                  # Add / update / remove cart endpoints
│   │   ├── tests.py
│   │   └── migrations/
│   ├── orders/                       # Order management app
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                 # Order & OrderItem models
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── tests.py
│   │   └── migrations/
│   ├── contacts/                     # Contact / enquiry form app
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py                 # ContactMessage model
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── migrations/
│   └── media/                        # User-uploaded & product media files
└── Frontend/                         # Vanilla HTML/JS + Tailwind CSS client
    ├── index.html                    # Interactive landing page
    ├── index.js                      # Landing page logic & animations
    ├── shop.html                     # Filtering & live search product catalog
    ├── product-detail.html           # Individual product detail & reviews
    ├── wishlist.html                 # My Saved Items gallery
    ├── wishlist.js                   # Wishlist localStorage logic
    ├── cart.html                     # Main checkout shopping cart page
    ├── checkout.html                 # Order placement & payment flow
    ├── settings.html                 # Profile & account security manager
    ├── blog.html                     # Fitness blog & articles
    ├── contact-us.html               # Contact form (POST → /api/contacts/)
    ├── Auth.html                     # Standalone authentication page
    ├── auth-modal.js                 # Global JWT login drawer logic
    ├── style.css                     # Custom CSS variables, animations & overrides
    ├── muscular_man.png              # Hero section image asset
    ├── runners_thumbnail.png         # Blog / promo thumbnail asset
    ├── Fonts/                        # Local webfont files
    └── images/                       # Additional image assets
```
