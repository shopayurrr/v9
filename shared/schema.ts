import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  dateOfBirth: text("date_of_birth"),
  primaryPhone: text("primary_phone"),
  secondaryPhone: text("secondary_phone"),
  address: text("address"),
  permanentEmail: text("permanent_email"),
  temporaryEmail: text("temporary_email"),
  socialSecurityNumber: text("social_security_number"),
  homeAddress: text("home_address"),
  mailingAddress: text("mailing_address"),
  alternateEmail: text("alternate_email"),
  availableBalance: text("available_balance"),
  everydayChecking: text("everyday_checking"),
  accountType: text("account_type"),
  lastLoginTime: timestamp("last_login_time"),
  lastLoginIp: text("last_login_ip"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

// Account schema
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountNumber: text("account_number").notNull(),
  accountType: text("account_type").notNull(),
  balance: text("balance").notNull(),
});

// Login schema for form validation
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  type: text("type").notNull(), // 'credit' or 'debit'
  status: text("status").notNull().default("completed"), // 'pending' or 'completed'
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  accountId: true,
  description: true,
  amount: true,
  type: true,
  status: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  dateOfBirth: true,
  primaryPhone: true,
  secondaryPhone: true,
  address: true,
  permanentEmail: true,
  temporaryEmail: true,
  socialSecurityNumber: true,
  homeAddress: true,
  mailingAddress: true,
  alternateEmail: true,
  availableBalance: true,
  everydayChecking: true,
  accountType: true,
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  userId: true,
  accountNumber: true,
  accountType: true,
  balance: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type User = typeof users.$inferSelect;
// Site Content schema
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteContentSchema = createInsertSchema(siteContent).pick({
  key: true,
  value: true,
  description: true,
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
