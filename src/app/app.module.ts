import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';

// --- Feature Components (Placeholder Imports) ---
// In a real application, these would be generated and placed in their respective feature modules or folders.
// For this example, we'll import them directly into the root module.
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { ReportsComponent } from './components/reports/reports.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';

// --- Guards (Placeholder Imports) ---
// For protecting routes based on authentication status.
import { AuthGuard } from './guards/auth.guard';

// --- Cross-Project Context (Potential Integration Points) ---
// While not directly implemented in app.module.ts, these comments indicate where
// future integrations with other microservices might be considered.
// For example, a "Marketplace" link could lead to the E-commerce Product Catalog.
// A "Quiz" link could lead to the Interactive Quiz Application.
// A "Weather" widget could integrate the Personalized Weather Dashboard.
// A "Collaboration" feature might use the Real-time Collaborative Whiteboard.

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  // Default route - redirect to dashboard if authenticated, otherwise to login
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // Wildcard route for any unmatched URL
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  // Components, directives, and pipes that belong to this module.
  // These are the "declarables" that are part of this module's scope.
  declarations: [
    AppComponent,
    DashboardComponent,
    TransactionsComponent,
    CategoriesComponent,
    ReportsComponent,
    LoginComponent,
    RegisterComponent,
    NotFoundComponent,
    HeaderComponent,
    FooterComponent
  ],
  // Modules whose exported declarables are available to templates in this module.
  // Order matters for some modules (e.g., BrowserModule should be first).
  imports: [
    BrowserModule, // Required for running Angular applications in a browser environment.
    HttpClientModule, // For making HTTP requests to the backend API.
    FormsModule, // For template-driven forms.
    ReactiveFormsModule, // For reactive forms (more robust and scalable).
    RouterModule.forRoot(routes) // Configures the root application router with the defined routes.
  ],
  // Services that this module contributes to the global service injector.
  // These services will be available application-wide.
  providers: [
    ApiService, // Provides the API interaction service.
    AuthGuard // Provides the authentication guard for route protection.
    // Add other global services here, e.g., AuthService, NotificationService
  ],
  // The root component that Angular should bootstrap when it starts the application.
  bootstrap: [AppComponent]
})
export class AppModule { }