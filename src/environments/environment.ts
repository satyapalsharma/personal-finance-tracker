/**
 * @file src/environments/environment.ts
 * @description
 * This file contains the default environment configuration for the Personal Finance Tracker application.
 * It is primarily used for development purposes. For production builds, `environment.prod.ts` is typically
 * used, which overrides these settings with production-specific values.
 *
 * This configuration includes API endpoints for the Personal Finance Tracker's own backend
 * and references to other interconnected microservices within the larger system, simulating
 * a microservice architecture.
 */

export const environment = {
  /**
   * Flag indicating whether the application is running in production mode.
   * Set to `false` for development builds. This flag is used by Angular's build
   * process to apply optimizations and determine which environment file to use.
   */
  production: false,

  /**
   * The base URL for the Personal Finance Tracker's PHP API backend.
   * All API requests for finance-related operations (e.g., transactions, categories, reports)
   * will be directed to this endpoint.
   *
   * In a typical development setup, this might point to a local PHP development server
   * (e.g., served by Apache, Nginx, or PHP's built-in server).
   * For production, this would be the deployed API gateway or direct service URL.
   */
  apiUrl: 'http://localhost:8000/api', // Example: PHP backend running on port 8000

  // --- Cross-Project Context: Interconnected Microservices ---
  // These URLs simulate integration points with other services in the larger system.
  // They are included to demonstrate a microservice architecture where different
  // applications might share common services or interact with each other.

  /**
   * URL for a shared authentication and user management service.
   * The Personal Finance Tracker might use this service for user login, registration,
   * and profile management, rather than implementing its own, promoting single sign-on.
   */
  authServiceUrl: 'http://localhost:8001/auth', // Example: Shared Authentication Service API

  /**
   * URL for a system-wide notification service.
   * The finance tracker could leverage this service to send budget alerts,
   * transaction summaries, or other personalized user notifications across the ecosystem.
   */
  notificationServiceUrl: 'http://localhost:8002/notifications', // Example: System-wide Notification Service API

  /**
   * URL for the E-commerce Product Catalog service.
   * While not a primary integration for basic finance tracking, a more advanced
   * feature could allow users to link transactions to specific products or categories
   * from an e-commerce platform for detailed spending analysis.
   */
  ecommerceCatalogServiceUrl: 'http://localhost:8003/catalog', // Example: E-commerce Product Catalog API

  /**
   * URL for the Interactive Quiz Application service.
   * Included for context, demonstrating another independent service in the ecosystem.
   * Direct integration with a finance tracker is less common but could exist for
   * financial literacy quizzes or educational content.
   */
  quizAppServiceUrl: 'http://localhost:8004/quiz', // Example: Interactive Quiz Application API

  /**
   * URL for the Personalized Weather Dashboard service.
   * Included for context, demonstrating another independent service in the ecosystem.
   * Direct integration with a finance tracker is unlikely, but it highlights the
   * diversity of services within the larger system.
   */
  weatherDashboardServiceUrl: 'http://localhost:8005/weather', // Example: Personalized Weather Dashboard API

  /**
   * URL for the Real-time Collaborative Whiteboard service.
   * Included for context, demonstrating another independent service in the ecosystem.
   * Direct integration with a finance tracker is unlikely, but it showcases the
   * breadth of applications that might share common infrastructure or user bases.
   */
  whiteboardServiceUrl: 'http://localhost:8006/whiteboard', // Example: Real-time Collaborative Whiteboard API
};