import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interface for a financial transaction.
 */
export interface Transaction {
  id?: string; // Optional for new transactions
  user_id: string; // Identifier for the user who owns the transaction
  amount: number;
  type: 'income' | 'expense';
  category_id: string; // Foreign key to Category
  description: string;
  transaction_date: string; // ISO date string (e.g., 'YYYY-MM-DD')
  created_at?: string; // Timestamp, optional for creation
  updated_at?: string; // Timestamp, optional for creation
}

/**
 * Interface for a transaction category.
 */
export interface Category {
  id?: string; // Optional for new categories
  name: string;
  type: 'income' | 'expense' | 'both'; // Categories can apply to income, expense, or both
  user_id?: string; // Optional: if categories can be user-specific, otherwise global
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface for a monthly financial summary report.
 */
export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionsCount: number;
  categoryBreakdown: { [categoryName: string]: { income: number, expense: number } };
}

/**
 * Interface for user preferences, potentially fetched from a separate user service.
 */
export interface UserPreference {
  theme: string;
  currency: string;
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  // Add other preferences relevant to the finance tracker
  defaultView: 'dashboard' | 'transactions' | 'reports';
}

/**
 * ApiService
 *
 * This service is responsible for handling all HTTP requests to the backend API
 * for the Personal Finance Tracker application. It centralizes API calls,
 * making it easier to manage endpoints, add authentication headers (if needed),
 * and handle common request patterns.
 *
 * It interacts with the PHP/PostgreSQL backend.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl; // Base URL for the Personal Finance Tracker API
  private userManagementApiUrl = environment.userManagementApiUrl; // Base URL for a hypothetical User Management service

  constructor(private http: HttpClient) { }

  // --- Transaction Endpoints ---

  /**
   * Fetches all transactions for the authenticated user.
   * @returns An Observable of an array of Transaction objects.
   */
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions`);
  }

  /**
   * Fetches a single transaction by its ID.
   * @param id The ID of the transaction to fetch.
   * @returns An Observable of a Transaction object.
   */
  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/transactions/${id}`);
  }

  /**
   * Adds a new transaction.
   * @param transaction The Transaction object to add.
   * @returns An Observable of the newly created Transaction object (with ID).
   */
  addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, transaction);
  }

  /**
   * Updates an existing transaction.
   * @param id The ID of the transaction to update.
   * @param transaction The updated Transaction object.
   * @returns An Observable of the updated Transaction object.
   */
  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/transactions/${id}`, transaction);
  }

  /**
   * Deletes a transaction by its ID.
   * @param id The ID of the transaction to delete.
   * @returns An Observable indicating the success of the deletion.
   */
  deleteTransaction(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/transactions/${id}`);
  }

  // --- Category Endpoints ---

  /**
   * Fetches all categories.
   * @returns An Observable of an array of Category objects.
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  /**
   * Adds a new category.
   * @param category The Category object to add.
   * @returns An Observable of the newly created Category object (with ID).
   */
  addCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  /**
   * Updates an existing category.
   * @param id The ID of the category to update.
   * @param category The updated Category object.
   * @returns An Observable of the updated Category object.
   */
  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  /**
   * Deletes a category by its ID.
   * @param id The ID of the category to delete.
   * @returns An Observable indicating the success of the deletion.
   */
  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${id}`);
  }

  // --- Reporting Endpoints ---

  /**
   * Fetches a monthly financial summary.
   * @param year The year for the summary.
   * @param month The month for the summary (1-12).
   * @returns An Observable of a MonthlySummary object.
   */
  getMonthlySummary(year: number, month: number): Observable<MonthlySummary> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    return this.http.get<MonthlySummary>(`${this.apiUrl}/reports/monthly-summary`, { params });
  }

  /**
   * Fetches a yearly financial summary.
   * @param year The year for the summary.
   * @returns An Observable of a yearly summary object.
   */
  getYearlySummary(year: number): Observable<any> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<any>(`${this.apiUrl}/reports/yearly-summary`, { params });
  }

  // --- Cross-Project Context: Interaction with other Microservices ---

  /**
   * Fetches user preferences from a hypothetical User Management Service.
   * This demonstrates interaction with another service in a microservice architecture.
   * @param userId The ID of the user whose preferences are to be fetched.
   * @returns An Observable of UserPreference object.
   */
  getUserPreferences(userId: string): Observable<UserPreference> {
    // Assuming the User Management Service has an endpoint like /users/{userId}/preferences
    return this.http.get<UserPreference>(`${this.userManagementApiUrl}/users/${userId}/preferences`);
  }

  /**
   * Sends a notification via a hypothetical Notification Service.
   * This could be used, for example, to notify the user about a large transaction.
   * @param userId The ID of the user to notify.
   * @param message The message content.
   * @param type The type of notification (e.g., 'email', 'sms', 'push').
   * @returns An Observable indicating the success of the notification request.
   */
  sendNotification(userId: string, message: string, type: 'email' | 'sms' | 'push'): Observable<any> {
    // Assuming a Notification Service has an endpoint like /notifications/send
    // For this example, we'll use a placeholder URL if userManagementApiUrl is not suitable.
    // In a real scenario, you'd have a dedicated `notificationServiceApiUrl` in environment.
    const notificationServiceUrl = environment.notificationServiceApiUrl || 'http://localhost:3003/api'; // Placeholder
    return this.http.post<any>(`${notificationServiceUrl}/notifications/send`, { userId, message, type });
  }

  /**
   * Fetches product details from the E-commerce Product Catalog service.
   * This could be used if the finance tracker needs to display details about
   * a product purchased, linking back to the original catalog.
   * @param productId The ID of the product to fetch.
   * @returns An Observable of product details.
   */
  getProductDetails(productId: string): Observable<any> {
    const ecommerceApiUrl = environment.ecommerceApiUrl || 'http://localhost:3002/api'; // Placeholder
    return this.http.get<any>(`${ecommerceApiUrl}/products/${productId}`);
  }
}