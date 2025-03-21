import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Cars Table
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  price: integer("price").notNull(),
  mileage: integer("mileage").notNull(),
  fuelType: text("fuel_type").notNull(), // Gasoline, Diesel, Electric, Hybrid
  transmission: text("transmission").notNull(), // Automatic, Manual
  drivetrain: text("drivetrain").notNull(), // FWD, RWD, AWD, 4WD
  exteriorColor: text("exterior_color").notNull(),
  interiorColor: text("interior_color").notNull(),
  vin: text("vin"),
  engineDetails: text("engine_details"),
  mpg: text("mpg"),
  description: text("description"),
  sellerName: text("seller_name").notNull(),
  sellerPhone: text("seller_phone").notNull(), // For WhatsApp integration
  sellerSince: text("seller_since"),
  images: json("images").$type<string[]>().notNull(),
  features: json("features").$type<string[]>(),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schema for cars
export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true
});

// Extend schema with validations
export const carValidationSchema = insertCarSchema.extend({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().int().min(0),
  mileage: z.number().int().min(0),
  sellerPhone: z.string().min(10, "Valid phone number is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

// Car filtering schema
export const carFilterSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  search: z.string().optional(),
});

// Types
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type CarFilter = z.infer<typeof carFilterSchema>;

// Contact messages for inquiries
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  carId: integer("car_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactSchema>;
