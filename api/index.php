<?php

/**
 * Personal Finance Tracker API Entry Point
 *
 * This file serves as the main entry point for the Personal Finance Tracker backend API.
 * It handles request routing, environment variable loading, database connection,
 * CORS configuration, and dispatches requests to appropriate controllers.
 *
 * Tech Stack: PHP, PostgreSQL
 *
 * Part of a larger interconnected system including:
 * - Interactive Quiz Application
 * - E-commerce Product Catalog
 * - Personalized Weather Dashboard
 * - Real-time Collaborative Whiteboard
 *
 * This API primarily manages financial transactions and categories, but includes
 * a placeholder for cross-service data aggregation.
 */

// 1. Autoload Composer dependencies
// This ensures that classes from 'vendor' and our 'App' namespace are