<?php

namespace App\Controllers;

use PDO;
use PDOException;

/**
 * TransactionController
 *
 * Handles API requests related to financial transactions (income and expenses).
 * Provides endpoints for creating, retrieving, updating, and deleting transactions.
 */
class TransactionController
{
    private PDO $db;

    /**
     * Constructor
     *
     * @param PDO $db The PDO database connection instance.
     */
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    /**
     * Creates a new financial transaction.
     *
     * Expects a JSON payload with transaction details:
     * {
     *   "user_id": 1, // In a real app, this would come from authenticated user context
     *   "amount": 100.50,
     *   "type": "expense", // or "income"
     *   "category_id": 5,
     *   "description": "Groceries from SuperMart",
     *   "transaction_date": "2023-10-26"
     * }
     *
     * @return void JSON response indicating success or failure.
     */
    public function createTransaction(): void
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);

        // Basic input validation
        if (
            !isset($input['user_id'], $input['amount'], $input['type'], $input['category_id'], $input['description'], $input['transaction_date']) ||
            !is_numeric($input['amount']) || $input['amount'] <= 0 ||
            !in_array($input['type'], ['income', 'expense']) ||
            !is_numeric($input['category_id']) || $input['category_id'] <= 0 ||
            !strtotime($input['transaction_date'])
        ) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid input data. Required fields: user_id, amount, type, category_id, description, transaction_date.']);
            return;
        }

        $userId = $input['user_id'];
        $amount = $input['amount'];
        $type = $input['type'];
        $categoryId = $input['category_id'];
        $description = $input['description'];
        $transactionDate = $input['transaction_date'];

        try {
            $stmt = $this->db->prepare(
                "INSERT INTO transactions (user_id, amount, type, category_id, description, transaction_date)
                 VALUES (:user_id, :amount, :type, :category_id, :description, :transaction_date)"
            );
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':amount', $amount);
            $stmt->bindParam(':type', $type);
            $stmt->bindParam(':category_id', $categoryId, PDO::PARAM_INT);
            $stmt->bindParam(':description', $description);
            $stmt->bindParam(':transaction_date', $transactionDate);

            $stmt->execute();

            $newTransactionId = $this->db->lastInsertId();
            http_response_code(201); // Created
            echo json_encode([
                'message' => 'Transaction created successfully.',
                'transaction_id' => $newTransactionId
            ]);

            // --- Cross-Project Context / Microservice Integration Example ---
            // In a real microservice setup, you might dispatch an event here, e.g.:
            // - To a "Reporting Service" to update financial summaries.
            // - To a "Notification Service" if the transaction is unusually large.
            // - To an "Audit Log Service" for compliance.
            // Example: file_get_contents("http://notification-service/api/notify?event=transaction_created&id={$newTransactionId}");
            // Or using a message queue (RabbitMQ, Kafka) for asynchronous processing.

        } catch (PDOException $e) {
            http_response_code(500); // Internal Server Error
            error_log("Error creating transaction: " . $e->getMessage());
            echo json_encode(['message' => 'Failed to create transaction.', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Retrieves a list of financial transactions.
     *
     * Supports optional query parameters for filtering:
     * - `user_id`: Filter by user (e.g., ?user_id=1)
     * - `type`: Filter by transaction type (income/expense, e.g., ?type=expense)
     * - `category_id`: Filter by category (e.g., ?category_id=5)
     * - `start_date`: Filter transactions from this date (e.g., ?start_date=2023-01-01)
     * - `end_date`: Filter transactions up to this date (e.g., ?end_date=2023-12-31)
     * - `limit`: Number of results to return (e.g., ?limit=10)
     * - `offset`: Offset for pagination (e.g., ?offset=0)
     *
     * @return void JSON array of transactions.
     */
    public function getTransactions(): void
    {
        header('Content-Type: application/json');

        $queryParams = $_GET;
        $sql = "SELECT t.id, t.user_id, t.amount, t.type, t.description, t.transaction_date, t.created_at, t.updated_at,
                       c.name AS category_name
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE 1=1"; // Start with a true condition to easily append AND clauses
        $params = [];

        // Build WHERE clause based on query parameters
        if (isset($queryParams['user_id']) && is_numeric($queryParams['user_id'])) {
            $sql .= " AND t.user_id = :user_id";
            $params[':user_id'] = $queryParams['user_id'];
        }
        if (isset($queryParams['type']) && in_array($queryParams['type'], ['income', 'expense'])) {
            $sql .= " AND t.type = :type";
            $params[':type'] = $queryParams['type'];
        }
        if (isset($queryParams['category_id']) && is_numeric($queryParams['category_id'])) {
            $sql .= " AND t.category_id = :category_id";
            $params[':category_id'] = $queryParams['category_id'];
        }
        if (isset($queryParams['start_date']) && strtotime($queryParams['start_date'])) {
            $sql .= " AND t.transaction_date >= :start_date";
            $params[':start_date'] = $queryParams['start_date'];
        }
        if (isset($queryParams['end_date']) && strtotime($queryParams['end_date'])) {
            $sql .= " AND t.transaction_date <= :end_date";
            $params[':end_date'] = $queryParams['end_date'];
        }

        $sql .= " ORDER BY t.transaction_date DESC, t.created_at DESC";

        // Add pagination
        if (isset($queryParams['limit']) && is_numeric($queryParams['limit']) && $queryParams['limit'] > 0) {
            $sql .= " LIMIT :limit";
            $params[':limit'] = (int)$queryParams['limit'];
        }
        if (isset($queryParams['offset']) && is_numeric($queryParams['offset']) && $queryParams['offset'] >= 0) {
            $sql .= " OFFSET :offset";
            $params[':offset'] = (int)$queryParams['offset'];
        }

        try {
            $stmt = $this->db->prepare($sql);

            // Bind parameters dynamically
            foreach ($params as $key => &$val) {
                // Determine PDO type based on parameter name or value type
                if (strpos($key, 'id') !== false || strpos($key, 'user_id') !== false || strpos($key, 'category_id') !== false) {
                    $stmt->bindParam($key, $val, PDO::PARAM_INT);
                } elseif (strpos($key, 'limit') !== false || strpos($key, 'offset') !== false) {
                    $stmt->bindParam($key, $val, PDO::PARAM_INT);
                } else {
                    $stmt->bindParam($key, $val);
                }
            }

            $stmt->execute();
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode($transactions);
        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Error fetching transactions: " . $e->getMessage());
            echo json_encode(['message' => 'Failed to retrieve transactions.', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Retrieves a single financial transaction by its ID.
     *
     * @param int $id The ID of the transaction to retrieve.
     * @return void JSON object of the transaction or 404 if not found.
     */
    public function getTransactionById(int $id): void
    {
        header('Content-Type: application/json');

        try {
            $stmt = $this->db->prepare(
                "SELECT t.id, t.user_id, t.amount, t.type, t.description, t.transaction_date, t.created_at, t.updated_at,
                       c.name AS category_name
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.id = :id"
            );
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $transaction = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($transaction) {
                http_response_code(200);
                echo json_encode($transaction);
            } else {
                http_response_code(404); // Not Found
                echo json_encode(['message' => 'Transaction not found.']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            error_log("Error fetching transaction by ID: " . $e->getMessage());
            echo json_encode(['message' => 'Failed to retrieve transaction.', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Updates an existing financial transaction.
     *
     * Expects a JSON payload with fields to update:
     * {
     *   "amount": 105.00,
     *   "type": "expense",
     *   "category_id": 6,
     *   "description": "Updated groceries",
     *   "transaction_date": "2023-10-27"
     * }
     *
     * @param int $id The ID of the transaction to update.
     * @return void JSON response indicating success or failure.
     */
    public function updateTransaction(int $id): void
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);

        // Check if transaction exists first
        $checkStmt = $this->db->prepare("SELECT id FROM transactions WHERE id = :id");
        $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $checkStmt->execute();
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['message' => 'Transaction not found.']);
            return;
        }

        $setClauses = [];
        $params = [':id' => $id];

        if (isset($input['amount']) && is_numeric($input['amount']) && $input['amount'] > 0) {
            $setClauses[] = "amount = :amount";
            $params[':amount'] = $input['amount'];
        }
        if (isset($input['type']) && in_array($input['type'], ['income', 'expense'])) {
            $setClauses[] = "type = :type";
            $params[':type'] = $input['type'];
        }
        if (isset($input['category_id']) && is_numeric($input['category_id']) && $input['category_id'] > 0) {
            $setClauses[] = "category_id = :category_id";
            $params[':category_id'] = $input['category_id'];
        }
        if (isset($input['description'])) {
            $setClauses[] = "description = :description";
            $params[':description'] = $input['description'];
        }
        if (isset($input['transaction_date']) && strtotime($input['transaction_date'])) {
            $setClauses[] = "transaction_date = :transaction_date";
            $params[':transaction_date'] = $input['transaction_date'];
        }

        if (empty($setClauses)) {
            http_response_code(400);
            echo json_encode(['message' => 'No valid fields provided for update.']);
            return;
        }

        $setClauses[] = "updated_at = NOW()"; // Automatically update timestamp

        $sql = "UPDATE transactions SET " . implode(', ', $setClauses) . " WHERE id = :id";

        try {
            $stmt = $this->db->prepare($sql);
            foreach ($params as $key => &$val) {
                if (strpos($key, 'id') !== false) {
                    $stmt->bindParam($key, $val, PDO::PARAM_INT);
                } else {
                    $stmt->bindParam($key, $val);
