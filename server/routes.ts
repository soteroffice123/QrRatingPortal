import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBusinessSchema, insertQrCodeSchema, insertLinkSchema, insertAnalyticSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // For demo purposes, we'll create a default admin user
  const defaultUserId = 1;
  const defaultUser = await storage.getUser(defaultUserId);
  
  if (!defaultUser) {
    // Create a default user if none exists
    await storage.createUser({
      username: "admin",
      password: "password", // In a real app, this would be hashed
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
