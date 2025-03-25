// PostgresStorage.ts
import { eq } from "drizzle-orm";
import { db } from "../shared/db";
import { and, eq, gte, lte, like, ilike } from "drizzle-orm"; // or your ORM's functions
import {
  users,
  cars,
  contactMessages,
  wishlists,
} from "@shared/schema";
import {
  Car,
  InsertCar,
  CarFilter,
  ContactMessage,
  InsertContactMessage,
  User,
  InsertUser,
  Wishlist,
  InsertWishlist,
} from "@shared/schema";
import { IStorage } from "./IStorage";

export class PostgresStorage implements IStorage {
  // USER
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  // CARS
  async getAllCars(): Promise<Car[]> {
    return await db.select().from(cars);
  }

  async getCarById(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async createCar(car: InsertCar): Promise<Car | null> {
    // Check if car already exists
    const existingCar = await db.select().from(cars).where(eq(cars.car_id, car.car_id)).limit(1);
    
    if (existingCar.length > 0) {
      // Car already exists, return it or return null based on your preference
      return existingCar[0]; // or return null;
    }
  
    // Insert new car
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined> {
    const [updatedCar] = await db.update(cars).set(car).where(eq(cars.id, id)).returning();
    return updatedCar;
  }

  async deleteCar(id: number): Promise<boolean> {
    const result = await db.delete(cars).where(eq(cars.id, id));
    return result.rowCount > 0;
  }

  async getFeaturedCars(limit: number = 3): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.isFeatured, true)).limit(limit);
  }

  async getRecentCars(limit: number = 4): Promise<Car[]> {
    return await db.select().from(cars).orderBy(cars.createdAt).limit(limit);
  }

  async filterCars(filter: CarFilter): Promise<Car[]> {
    let conditions: any[] = [];
  
    if (filter.make) {
      conditions.push(eq(cars.make, filter.make));
    }
  
    if (filter.model) {
      conditions.push(eq(cars.model, filter.model));
    }
  
    if (filter.minPrice) {
      conditions.push(gte(cars.price, filter.minPrice));
    }
  
    if (filter.maxPrice) {
      conditions.push(lte(cars.price, filter.maxPrice));
    }
  
    if (filter.minYear) {
      conditions.push(gte(cars.year, filter.minYear));
    }
  
    if (filter.maxYear) {
      conditions.push(lte(cars.year, filter.maxYear));
    }
  
    if (filter.fuelType) {
      conditions.push(eq(cars.fuelType, filter.fuelType));
    }
  
    if (filter.transmission) {
      conditions.push(eq(cars.transmission, filter.transmission));
    }
  
    if (filter.search) {
      const searchTerm = `%${filter.search}%`;
      conditions.push(ilike(cars.title, searchTerm)); // Assuming 'title' is a text field combining make + model etc.
    }
  
    let query = db.select().from(cars);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
  
    return await query;
  }

  async getSimilarCars(carId: number, limit: number = 3): Promise<Car[]> {
    const car = await this.getCarById(carId);
    if (!car) return [];

    const allCars = await this.getAllCars();
    const similarCars = allCars
      .filter((c) => c.id !== carId)
      .map((otherCar) => {
        let score = 0;
        if (otherCar.make === car.make) score += 30;
        if (otherCar.model === car.model) score += 20;
        const priceDiff = Math.abs(otherCar.price - car.price) / car.price;
        if (priceDiff <= 0.2) score += 15;
        if (Math.abs(otherCar.year - car.year) <= 3) score += 10;
        if (otherCar.fuelType === car.fuelType) score += 10;
        if (otherCar.transmission === car.transmission) score += 5;
        if (otherCar.drivetrain === car.drivetrain) score += 5;
        return { car: otherCar, similarityScore: score };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)
      .map((res) => res.car);

    return similarCars;
  }

  // CONTACT MESSAGES
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessagesForCar(carId: number): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).where(eq(contactMessages.carId, carId));
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages);
  }

  // WISHLISTS
  async createWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlist] = await db.insert(wishlists).values(wishlist).returning();
    return newWishlist;
  }

  async getWishlistById(id: number): Promise<Wishlist | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, id));
    return wishlist;
  }

  async getWishlistByShareId(shareId: string): Promise<Wishlist | undefined> {
    const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.shareId, shareId));
    return wishlist;
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlists).where(eq(wishlists.userId, userId));
  }

  async updateWishlist(id: number, wishlist: Partial<InsertWishlist>): Promise<Wishlist | undefined> {
    const [updatedWishlist] = await db.update(wishlists).set(wishlist).where(eq(wishlists.id, id)).returning();
    return updatedWishlist;
  }

  async deleteWishlist(id: number): Promise<boolean> {
    const result = await db.delete(wishlists).where(eq(wishlists.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new PostgresStorage();
