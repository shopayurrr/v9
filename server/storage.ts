import { users, accounts, siteContent, transactions, type User, type InsertUser, type Account, type InsertAccount, type SiteContent, type Transaction, type InsertTransaction } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAccountsByUserId(userId: number): Promise<Account[]>;
  getAllUsers(): Promise<User[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  deleteAccount(id: number): Promise<boolean>;
  updateAccountBalance(accountId: number, newBalance: string): Promise<Account | undefined>;
  getSiteContent(key: string): Promise<SiteContent | undefined>;
  getAllSiteContent(): Promise<SiteContent[]>;
  updateSiteContent(key: string, value: string): Promise<SiteContent>;
  getTransactionsByAccountId(accountId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: false,
      lastLoginTime: new Date(),
    }).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    await db.delete(accounts).where(eq(accounts.userId, id));
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    return !!deleted;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(update).where(eq(users.id, id)).returning();
    return user;
  }

  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const [deleted] = await db.delete(accounts).where(eq(accounts.id, id)).returning();
    return !!deleted;
  }

  async updateAccountBalance(accountId: number, newBalance: string): Promise<Account | undefined> {
    const [account] = await db.update(accounts).set({ balance: newBalance }).where(eq(accounts.id, accountId)).returning();
    return account;
  }

  async getSiteContent(key: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent).where(eq(siteContent.key, key));
    return content;
  }

  async getAllSiteContent(): Promise<SiteContent[]> {
    return db.select().from(siteContent);
  }

  async updateSiteContent(key: string, value: string): Promise<SiteContent> {
    const [content] = await db
      .insert(siteContent)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return content;
  }

  async getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.accountId, accountId));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }
}

export const storage = new DatabaseStorage();
