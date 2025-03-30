<?php

namespace App\Config;

use PDO;
use PDOException;

/**
 * Class Database
 *
 * Handles the database connection for the Personal Finance Tracker application.
 * Utilizes PDO for secure and efficient database interactions with PostgreSQL.
 * Implements a singleton pattern to ensure only one database connection instance
 * exists throughout the application's lifecycle.
 */
class Database
{
    /**
     * @var PDO|null The static PDO connection instance. Null if not yet connected.
     */
    private static ?PDO $conn = null;

    /**
     * Prevents direct instantiation of the Database class.
     * The connection should be obtained via the static `getConnection()` method.
     */
    private function __construct()
    {
        // Private constructor to enforce singleton pattern
    }

    /**
     * Prevents cloning of the Database instance.
     */
    private function __clone()
    {
        // Private clone method to enforce singleton pattern
    }

    /**
     * Retrieves the PDO database connection.
     * If a connection does not already exist, it attempts to establish one
     * using environment variables for configuration.
     *
     * @return PDO The active PDO database connection object.
     * @throws PDOException If the database connection fails for any reason.
     */
    public static function getConnection(): PDO
    {
        // If a connection has already been established, return the existing one.
        if (self::$conn !== null) {
            return self::$conn;
        }

        // Load database configuration from environment variables.
        // In a production environment, these variables should be set securely
        // (e.g., via Docker secrets, Kubernetes secrets, or server environment variables).
        // For local development, a .env file loaded by a library like vlucas/phpdotenv
        // in the application's entry point (e.g., api/index.php) is common.
        $dbHost = getenv('DB_HOST') ?: 'localhost';
        $dbName = getenv('DB_NAME') ?: 'personal_finance_tracker_db'; // Specific database for this service
        $dbUser = getenv('DB_USER') ?: 'finance_app_user'; // Specific user for this service
        $dbPass = getenv('DB_PASS') ?: 'secure_password';
        $dbPort = getenv('DB_PORT') ?: '5432'; // Default PostgreSQL port

        // Construct the Data Source Name (DSN) for PostgreSQL.
        $dsn = "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName}";

        try {
            // Attempt to establish a new PDO connection.
            self::$conn = new PDO($dsn, $dbUser, $dbPass);

            // Set PDO attributes for robust error handling and consistent data fetching.
            // ATTR_ERRMODE_EXCEPTION: PDO will throw PDOException on errors.
            // ATTR_DEFAULT_FETCH_MODE: Default fetch mode to associative array.
            self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            // Optional: Set character set to UTF-8 for proper encoding handling.
            // This might be done via DSN or a separate query depending on driver.
            // For PostgreSQL, it's often handled by the database configuration itself.
            // self::$conn->exec("SET NAMES 'utf8'");

        } catch (PDOException $e) {
            // Log the detailed error message for debugging purposes.
            // In a production system, this would typically go to a centralized logging service.
            error_log("Database connection error: " . $e->getMessage());

            // Re-throw a more generic exception or a custom application-specific exception
            // to prevent sensitive database details from being exposed to the client.
            // The message here is for internal logging, not for client response.
            throw new PDOException("Could not connect to the database. Please check configuration.", (int)$e->getCode());
        }

        return self::$conn;
    }

    /**
     * Closes the database connection by setting the static connection instance to null.
     *
     * While PHP typically closes database connections automatically at the end of a script's execution,
     * this method can be useful in long-running scripts (e.g., CLI tools) or for explicit resource management
     * in testing scenarios. For typical web requests, it's often not necessary.
     */
    public static function closeConnection(): void
    {
        self::$conn = null;
    }
}