import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

/**
 * Main entry point for the Angular application.
 * This file bootstraps the application by initializing the root module (AppModule)
 * and configuring the environment based on the build settings.
 */

// Check if the application is running in production mode.
// If true, enable Angular's production mode, which disables development checks
// and optimizations for better performance.
if (environment.production) {
  enableProdMode();
}

/**
 * Bootstraps the Angular application.
 *
 * `platformBrowserDynamic()` creates a platform for running Angular applications
 * in a browser environment.
 *
 * `bootstrapModule(AppModule)` then loads and initializes the root module
 * of the application, which is `AppModule`. This module defines the
 * application's components, services, and other dependencies.
 *
 * A `.catch()` block is included to log any errors that might occur
 * during the bootstrapping process, ensuring robust error handling.
 */
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {
    // Log any errors that occur during the application bootstrapping process.
    // In a production environment, this might be integrated with a more
    // sophisticated error reporting service (e.g., Sentry, Bugsnag).
    console.error('Failed to bootstrap Angular application:', err);
  });