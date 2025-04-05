import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  activationCode: text("activation_code"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  isAdmin: true,
  isActive: true,
  activationCode: true,
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  description: text("description"),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
});

export const qrCodes = pgTable("qr_codes", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  size: integer("size").notNull().default(300),
  fgColor: text("fg_color").notNull().default("#000000"),
  bgColor: text("bg_color").notNull().default("#FFFFFF"),
  errorCorrection: text("error_correction").notNull().default("M"),
  logoEnabled: boolean("logo_enabled").notNull().default(true),
});

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({
  id: true,
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  googleReviewUrl: text("google_review_url").notNull(),
  prefillRating: boolean("prefill_rating").notNull().default(true),
  feedbackFormUrl: text("feedback_form_url").notNull(),
  passRating: boolean("pass_rating").notNull().default(true),
});

export const insertLinkSchema = createInsertSchema(links).omit({
  id: true,
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  qrCodeId: integer("qr_code_id").notNull().references(() => qrCodes.id),
  userId: integer("user_id").references(() => users.id),
  scanDate: timestamp("scan_date").notNull().defaultNow(),
  rating: integer("rating"),
  destination: text("destination"),
  customerEmail: text("customer_email"),
  customerFeedback: text("customer_feedback"),
  location: text("location"),
  deviceType: text("device_type"),
});

export const insertAnalyticSchema = createInsertSchema(analytics).omit({
  id: true,
});

// Type definitions for use in the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
export type QrCode = typeof qrCodes.$inferSelect;

export type InsertLink = z.infer<typeof insertLinkSchema>;
export type Link = typeof links.$inferSelect;

export type InsertAnalytic = z.infer<typeof insertAnalyticSchema>;
export type Analytic = typeof analytics.$inferSelect;
