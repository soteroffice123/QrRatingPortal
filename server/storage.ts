import { users, type User, type InsertUser, businesses, type Business, type InsertBusiness, qrCodes, type QrCode, type InsertQrCode, links, type Link, type InsertLink, analytics, type Analytic, type InsertAnalytic } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Create a memory store for session
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business operations
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByUserId(userId: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, data: Partial<InsertBusiness>): Promise<Business | undefined>;
  
  // QR Code operations
  getQrCode(id: number): Promise<QrCode | undefined>;
  getQrCodeByBusinessId(businessId: number): Promise<QrCode | undefined>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  updateQrCode(id: number, data: Partial<InsertQrCode>): Promise<QrCode | undefined>;
  
  // Link operations
  getLink(id: number): Promise<Link | undefined>;
  getLinkByBusinessId(businessId: number): Promise<Link | undefined>;
  createLink(link: InsertLink): Promise<Link>;
  updateLink(id: number, data: Partial<InsertLink>): Promise<Link | undefined>;
  
  // Analytics operations
  createAnalytic(analytic: InsertAnalytic): Promise<Analytic>;
  getAnalyticsByBusinessId(businessId: number): Promise<Analytic[]>;
  getRatingDistribution(businessId: number): Promise<Record<number, number>>;
  getScansOverTime(businessId: number, days: number): Promise<Record<string, number>>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private businessesData: Map<number, Business>;
  private qrCodesData: Map<number, QrCode>;
  private linksData: Map<number, Link>;
  private analyticsData: Map<number, Analytic>;
  private currentIds: {
    user: number;
    business: number;
    qrCode: number;
    link: number;
    analytic: number;
  };
  sessionStore: session.SessionStore;

  constructor() {
    this.usersData = new Map();
    this.businessesData = new Map();
    this.qrCodesData = new Map();
    this.linksData = new Map();
    this.analyticsData = new Map();
    this.currentIds = {
      user: 1,
      business: 1,
      qrCode: 1,
      link: 1,
      analytic: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.usersData.set(id, user);
    return user;
  }

  // Business operations
  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businessesData.get(id);
  }

  async getBusinessByUserId(userId: number): Promise<Business | undefined> {
    return Array.from(this.businessesData.values()).find(
      (business) => business.userId === userId,
    );
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const id = this.currentIds.business++;
    const newBusiness: Business = { ...business, id };
    this.businessesData.set(id, newBusiness);
    return newBusiness;
  }

  async updateBusiness(id: number, data: Partial<InsertBusiness>): Promise<Business | undefined> {
    const business = await this.getBusiness(id);
    if (!business) return undefined;
    
    const updatedBusiness: Business = { ...business, ...data };
    this.businessesData.set(id, updatedBusiness);
    return updatedBusiness;
  }

  // QR Code operations
  async getQrCode(id: number): Promise<QrCode | undefined> {
    return this.qrCodesData.get(id);
  }

  async getQrCodeByBusinessId(businessId: number): Promise<QrCode | undefined> {
    return Array.from(this.qrCodesData.values()).find(
      (qrCode) => qrCode.businessId === businessId,
    );
  }

  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const id = this.currentIds.qrCode++;
    const newQrCode: QrCode = { ...qrCode, id };
    this.qrCodesData.set(id, newQrCode);
    return newQrCode;
  }

  async updateQrCode(id: number, data: Partial<InsertQrCode>): Promise<QrCode | undefined> {
    const qrCode = await this.getQrCode(id);
    if (!qrCode) return undefined;
    
    const updatedQrCode: QrCode = { ...qrCode, ...data };
    this.qrCodesData.set(id, updatedQrCode);
    return updatedQrCode;
  }

  // Link operations
  async getLink(id: number): Promise<Link | undefined> {
    return this.linksData.get(id);
  }

  async getLinkByBusinessId(businessId: number): Promise<Link | undefined> {
    return Array.from(this.linksData.values()).find(
      (link) => link.businessId === businessId,
    );
  }

  async createLink(link: InsertLink): Promise<Link> {
    const id = this.currentIds.link++;
    const newLink: Link = { ...link, id };
    this.linksData.set(id, newLink);
    return newLink;
  }

  async updateLink(id: number, data: Partial<InsertLink>): Promise<Link | undefined> {
    const link = await this.getLink(id);
    if (!link) return undefined;
    
    const updatedLink: Link = { ...link, ...data };
    this.linksData.set(id, updatedLink);
    return updatedLink;
  }

  // Analytics operations
  async createAnalytic(analytic: InsertAnalytic): Promise<Analytic> {
    const id = this.currentIds.analytic++;
    const newAnalytic: Analytic = { 
      ...analytic, 
      id, 
      scanDate: analytic.scanDate || new Date() 
    };
    this.analyticsData.set(id, newAnalytic);
    return newAnalytic;
  }

  async getAnalyticsByBusinessId(businessId: number): Promise<Analytic[]> {
    return Array.from(this.analyticsData.values()).filter(
      (analytic) => analytic.businessId === businessId,
    );
  }

  async getRatingDistribution(businessId: number): Promise<Record<number, number>> {
    const analytics = await this.getAnalyticsByBusinessId(businessId);
    const distribution: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    analytics.forEach(analytic => {
      if (analytic.rating && analytic.rating >= 1 && analytic.rating <= 5) {
        distribution[analytic.rating]++;
      }
    });
    
    return distribution;
  }

  async getScansOverTime(businessId: number, days: number): Promise<Record<string, number>> {
    const analytics = await this.getAnalyticsByBusinessId(businessId);
    const scansOverTime: Record<string, number> = {};
    
    // Create date entries for the last X days
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      scansOverTime[dateString] = 0;
    }
    
    // Count scans for each date
    analytics.forEach(analytic => {
      const dateString = analytic.scanDate.toISOString().split('T')[0];
      if (scansOverTime[dateString] !== undefined) {
        scansOverTime[dateString]++;
      }
    });
    
    return scansOverTime;
  }
}

export const storage = new MemStorage();
