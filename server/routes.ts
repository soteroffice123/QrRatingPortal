import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBusinessSchema, insertQrCodeSchema, insertLinkSchema, insertAnalyticSchema, insertUserSchema } from "@shared/schema";
import { setupAuth } from "./auth";

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized - Login required");
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).send("Forbidden - Admin access required");
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // User Management API Routes
  // Admin only - Get all users
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).send("Failed to retrieve users");
    }
  });
  
  // Admin only - Create new user
  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUserByName = await storage.getUserByUsername(userData.username);
      if (existingUserByName) {
        return res.status(400).send("Username already exists");
      }
      
      if (userData.email) {
        const existingUserByEmail = await storage.getUserByEmail(userData.email);
        if (existingUserByEmail) {
          return res.status(400).send("Email already exists");
        }
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.issues);
      }
      console.error("Error creating user:", error);
      res.status(500).send("Failed to create user");
    }
  });
  
  // Get user analytics (for authenticated users)
  app.get("/api/user/analytics", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }
    
    try {
      const userId = req.user.id;
      const analytics = await storage.getUserAnalyticsSummary(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting user analytics:", error);
      res.status(500).send("Failed to retrieve user analytics");
    }
  });
  // For demo purposes, we'll create a default admin user and sample data
  const defaultUserId = 1;
  let defaultUser = await storage.getUser(defaultUserId);
  
  // Create default user if it doesn't exist
  if (!defaultUser) {
    defaultUser = await storage.createUser({
      username: "admin",
      email: "admin@example.com",
      password: "password", // In a real app, this would be hashed
      isAdmin: true
    });
  }

  // Create default business if it doesn't exist
  let defaultBusiness = await storage.getBusinessByUserId(defaultUserId);
  if (!defaultBusiness) {
    defaultBusiness = await storage.createBusiness({
      userId: defaultUserId,
      name: "Sample Business",
      logoUrl: "https://placehold.co/150x150?text=Logo",
      description: "A sample business for QR code feedback",
      address: "123 Main Street, City, Country",
      phone: "+1 (555) 123-4567",
      website: "https://example.com"
    });
  }

  // Create default QR code if it doesn't exist
  const existingQrCode = await storage.getQrCodeByBusinessId(defaultBusiness.id);
  if (!existingQrCode) {
    await storage.createQrCode({
      businessId: defaultBusiness.id,
      size: 300,
      fgColor: "#000000",
      bgColor: "#FFFFFF",
      errorCorrection: "M",
      logoEnabled: true
    });
  }

  // Create default links if they don't exist
  const existingLinks = await storage.getLinkByBusinessId(defaultBusiness.id);
  if (!existingLinks) {
    await storage.createLink({
      businessId: defaultBusiness.id,
      googleReviewUrl: "https://g.page/r/example-review-link",
      prefillRating: true,
      feedbackFormUrl: "https://forms.google.com/example-form",
      passRating: true
    });
  }

  // Business API routes
  app.get("/api/business", async (req, res) => {
    // Find the first business or the one belonging to the default user
    const businesses = await storage.getBusinessByUserId(defaultUserId);
    
    if (!businesses) {
      return res.status(404).send("Business not found");
    }
    
    res.json(businesses);
  });

  app.post("/api/business", async (req, res) => {
    try {
      const existingBusiness = await storage.getBusinessByUserId(defaultUserId);
      
      if (existingBusiness) {
        const validatedData = insertBusinessSchema.parse({
          ...req.body,
          userId: defaultUserId,
        });
        
        const updatedBusiness = await storage.updateBusiness(existingBusiness.id, validatedData);
        return res.json(updatedBusiness);
      } else {
        const validatedData = insertBusinessSchema.parse({
          ...req.body,
          userId: defaultUserId,
        });
        
        const business = await storage.createBusiness(validatedData);
        return res.status(201).json(business);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.issues);
      }
      res.status(500).send("Failed to create/update business");
    }
  });

  // QR Code API routes
  app.get("/api/qrcode", async (req, res) => {
    const business = await storage.getBusinessByUserId(defaultUserId);
    if (!business) {
      return res.status(404).send("Business not found");
    }
    
    const qrCode = await storage.getQrCodeByBusinessId(business.id);
    if (!qrCode) {
      return res.status(404).send("QR code not found");
    }
    
    res.json(qrCode);
  });

  app.post("/api/qrcode", async (req, res) => {
    try {
      const business = await storage.getBusinessByUserId(defaultUserId);
      if (!business) {
        return res.status(404).send("Business not found");
      }
      
      const existingQrCode = await storage.getQrCodeByBusinessId(business.id);
      
      if (existingQrCode) {
        const validatedData = insertQrCodeSchema.parse({
          ...req.body,
          businessId: business.id,
        });
        
        const updatedQrCode = await storage.updateQrCode(existingQrCode.id, validatedData);
        return res.json(updatedQrCode);
      } else {
        const validatedData = insertQrCodeSchema.parse({
          ...req.body,
          businessId: business.id,
        });
        
        const qrCode = await storage.createQrCode(validatedData);
        return res.status(201).json(qrCode);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.issues);
      }
      res.status(500).send("Failed to create/update QR code");
    }
  });

  // Links API routes
  app.get("/api/links", async (req, res) => {
    const business = await storage.getBusinessByUserId(defaultUserId);
    if (!business) {
      return res.status(404).send("Business not found");
    }
    
    const links = await storage.getLinkByBusinessId(business.id);
    if (!links) {
      return res.status(404).send("Links not found");
    }
    
    res.json(links);
  });

  app.post("/api/links", async (req, res) => {
    try {
      const business = await storage.getBusinessByUserId(defaultUserId);
      if (!business) {
        return res.status(404).send("Business not found");
      }
      
      const existingLinks = await storage.getLinkByBusinessId(business.id);
      
      if (existingLinks) {
        const validatedData = insertLinkSchema.parse({
          ...req.body,
          businessId: business.id,
        });
        
        const updatedLinks = await storage.updateLink(existingLinks.id, validatedData);
        return res.json(updatedLinks);
      } else {
        const validatedData = insertLinkSchema.parse({
          ...req.body,
          businessId: business.id,
        });
        
        const links = await storage.createLink(validatedData);
        return res.status(201).json(links);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.issues);
      }
      res.status(500).send("Failed to create/update links");
    }
  });

  // Analytics API routes
  app.get("/api/analytics", async (req, res) => {
    const business = await storage.getBusinessByUserId(defaultUserId);
    if (!business) {
      return res.status(404).send("Business not found");
    }
    
    const ratingDistribution = await storage.getRatingDistribution(business.id);
    const scansOverTime = await storage.getScansOverTime(business.id, 7); // Last 7 days
    const analytics = await storage.getAnalyticsByBusinessId(business.id);
    
    const totalScans = analytics.length;
    const ratingsSubmitted = analytics.filter(a => a.rating).length;
    const fiveStarRatings = analytics.filter(a => a.rating === 5).length;
    
    res.json({
      totalScans,
      ratingsSubmitted,
      fiveStarRatings,
      ratingDistribution,
      scansOverTime,
      recentActivity: analytics.sort((a, b) => 
        new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime()
      ).slice(0, 10) // Last 10 activities
    });
  });

  // Public rating page route
  app.get("/api/rating/:qrCodeId", async (req, res) => {
    const qrCodeId = parseInt(req.params.qrCodeId);
    
    if (isNaN(qrCodeId)) {
      return res.status(400).send("Invalid QR code ID");
    }
    
    const qrCode = await storage.getQrCode(qrCodeId);
    if (!qrCode) {
      return res.status(404).send("QR code not found");
    }
    
    const business = await storage.getBusiness(qrCode.businessId);
    if (!business) {
      return res.status(404).send("Business not found");
    }
    
    // Record analytics for the scan
    await storage.createAnalytic({
      businessId: business.id,
      qrCodeId,
      scanDate: new Date(),
      rating: null,
      destination: null
    });
    
    res.json({
      business,
      qrCode
    });
  });

  // Submit rating route
  app.post("/api/rating/:qrCodeId", async (req, res) => {
    const qrCodeId = parseInt(req.params.qrCodeId);
    
    if (isNaN(qrCodeId)) {
      return res.status(400).send("Invalid QR code ID");
    }
    
    try {
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).send("Invalid rating. Must be between 1 and 5.");
      }
      
      const qrCode = await storage.getQrCode(qrCodeId);
      if (!qrCode) {
        return res.status(404).send("QR code not found");
      }
      
      const business = await storage.getBusiness(qrCode.businessId);
      if (!business) {
        return res.status(404).send("Business not found");
      }
      
      const links = await storage.getLinkByBusinessId(business.id);
      if (!links) {
        return res.status(404).send("Links not found");
      }
      
      // Record analytics for the rating
      await storage.createAnalytic({
        businessId: business.id,
        qrCodeId,
        scanDate: new Date(),
        rating,
        destination: rating === 5 ? "google_review" : "feedback_form"
      });
      
      // Return the appropriate URL based on the rating
      if (rating === 5) {
        return res.json({ 
          redirectUrl: links.googleReviewUrl,
          prefillRating: links.prefillRating
        });
      } else {
        let url = links.feedbackFormUrl;
        if (links.passRating) {
          // Add rating parameter to the URL
          const separator = url.includes("?") ? "&" : "?";
          url = `${url}${separator}rating=${rating}`;
        }
        return res.json({ redirectUrl: url });
      }
    } catch (error) {
      res.status(500).send("Failed to process rating");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
