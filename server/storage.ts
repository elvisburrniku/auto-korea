// PostgresStorage.ts
import { eq } from "drizzle-orm";
import { db } from "../shared/db";
import { and, eq, gte, lte, like, ilike, asc, desc, sql } from "drizzle-orm"; // or your ORM's functions
import { users, cars, contactMessages, wishlists } from "@shared/schema";
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
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getNoFilterAllCars(): Promise<Car[]> {
    return await db.select().from(cars);
  }

  // CARS
  async getAllCars({
    offset = 0,
    limit = 12,
    orderBy = "createdAt",
    order = "desc",
    filters = {},
  }: {
    offset?: number;
    limit?: number;
    orderBy?: string;
    order?: string;
    filters?: CarFilter;
  }): Promise<Car[]> {
    let orderColumn;

    switch (orderBy) {
      case "price":
        orderColumn = cars.price;
        break;
      case "kilometers":
        orderColumn = cars.mileage;
          break;
      case "createdAt":
        orderColumn = cars.createdAt;
        break;
      case "year":
        orderColumn = cars.year;
        break;
      default:
        orderColumn = cars.createdAt;
    }

    // Build dynamic filter conditions
    const conditions: any[] = [];

    if (filters.make) {
      conditions.push(eq(cars.make, filters.make));
    }

    if (filters.model) {
      conditions.push(eq(cars.model, filters.model));
    }

    if (filters.minPrice) {
      conditions.push(gte(cars.price, filters.minPrice));
    }

    if (filters.maxPrice) {
      conditions.push(lte(cars.price, filters.maxPrice));
    }

    if (filters.minKm) {
      conditions.push(gte(cars.mileage, filters.minKm));
    }

    if (filters.maxKm) {
      conditions.push(lte(cars.mileage, filters.maxKm));
    }

    if (filters.minYear) {
      conditions.push(gte(cars.year, filters.minYear));
    }

    if (filters.maxYear) {
      conditions.push(lte(cars.year, filters.maxYear));
    }

    if (filters.fuelType) {
      conditions.push(eq(cars.fuelType, filters.fuelType));
    }

    if (filters.transmission) {
      conditions.push(eq(cars.transmission, filters.transmission));
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(ilike(cars.full_name, searchTerm)); // or use `cars.title`, `cars.description` etc.
    }

    // Build query
    let query = db
      .select()
      .from(cars)
      .orderBy(order === "desc" ? desc(orderColumn) : asc(orderColumn))
      .offset(offset)
      .limit(limit);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  async getTotalCars({
    filters = {},
  }: {
    filters?: CarFilter;
  }): Promise<number> {
    console.log(filters);
    const conditions: any[] = [];

    if (filters.make) conditions.push(eq(cars.make, filters.make));
    if (filters.model) conditions.push(eq(cars.model, filters.model));
    if (filters.minPrice) conditions.push(gte(cars.price, filters.minPrice));
    if (filters.maxPrice) conditions.push(lte(cars.price, filters.maxPrice));
    if (filters.minYear) conditions.push(gte(cars.year, filters.minYear));
    if (filters.maxYear) conditions.push(lte(cars.year, filters.maxYear));
    if (filters.fuelType) conditions.push(eq(cars.fuelType, filters.fuelType));
    if (filters.transmission)
      conditions.push(eq(cars.transmission, filters.transmission));
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(ilike(cars.full_name, searchTerm)); // make sure full_name is indexed
    }

    // 🚀 Efficient COUNT query
    const query = db
      .select({ count: sql<number>`count(*)` })
      .from(cars)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(1); // limit is useless here but harmless

    const result = await query;
    return Number(result[0].count);
  }

  async getCarMetadata() {
    const [makes, fuelTypes, transmissions, years, modelMakePairs] = await Promise.all([
      db.select({ make: cars.make }).from(cars).where(sql`${cars.make} IS NOT NULL`).groupBy(cars.make),
      db.select({ fuelType: cars.fuelType }).from(cars).where(sql`${cars.fuelType} IS NOT NULL`).groupBy(cars.fuelType),
      db
        .select({ transmission: cars.transmission })
        .from(cars)
        .where(sql`${cars.transmission} IS NOT NULL`)
        .groupBy(cars.transmission),
      db.select({ year: cars.year }).from(cars).where(sql`${cars.year} IS NOT NULL`).groupBy(cars.year),
      db
        .select({ make: cars.make, model: cars.model })
        .from(cars)
        .where(sql`${cars.make} IS NOT NULL AND ${cars.model} IS NOT NULL`)
        .groupBy(cars.make, cars.model),
    ]);
  
    const modelsByMake: Record<string, string[]> = {};
  
    for (const { make, model } of modelMakePairs) {
      if (!modelsByMake[make]) {
        modelsByMake[make] = [];
      }
      if (!modelsByMake[make].includes(model)) {
        modelsByMake[make].push(model);
      }
    }
  
    for (const make in modelsByMake) {
      modelsByMake[make].sort();
    }
  
    return {
      makes: makes.map((m) => m.make).sort(),
      fuelTypes: fuelTypes.map((f) => f.fuelType).sort(),
      transmissions: transmissions.map((t) => t.transmission).sort(),
      years: years
        .map((y) => y.year)
        .filter((y): y is number => typeof y === 'number')
        .sort((a, b) => b - a),
      modelsByMake,
    };
  }
  

  async getCarById(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async createCar(car: InsertCar): Promise<Car | null> {
    // Check if car already exists
    const existingCar = await db
      .select()
      .from(cars)
      .where(eq(cars.car_id, car.car_id))
      .limit(1);

    if (existingCar.length > 0) {
      // Car already exists, return it or return null based on your preference
      return existingCar[0]; // or return null;
    }

    // Insert new car
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async updateCar(
    id: number,
    car: Partial<InsertCar>,
  ): Promise<Car | undefined> {
    const [updatedCar] = await db
      .update(cars)
      .set(car)
      .where(eq(cars.id, id))
      .returning();
    return updatedCar;
  }

  async deleteCar(id: number): Promise<boolean> {
    const result = await db.delete(cars).where(eq(cars.id, id));
    return result.rowCount > 0;
  }

  async deleteEncarCar(id: number): Promise<boolean> {
    const result = await db.delete(cars).where(eq(cars.car_id, id));
    return result.rowCount > 0;
  }

  async getFeaturedCars(limit: number = 3): Promise<Car[]> {
    return await db
      .select()
      .from(cars)
      .where(eq(cars.isFeatured, true))
      .orderBy(sql`RANDOM()`)
      .limit(limit);
  }

  async getRecentCars(limit: number = 4): Promise<Car[]> {
      return await db.select().from(cars).orderBy(sql`RANDOM()`).limit(limit);
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
      conditions.push(ilike(cars.full_name, searchTerm));
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
  async createContactMessage(
    message: InsertContactMessage,
  ): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getContactMessagesForCar(carId: number): Promise<ContactMessage[]> {
    return await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.carId, carId));
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages);
  }

  // WISHLISTS
  async createWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    const [newWishlist] = await db
      .insert(wishlists)
      .values(wishlist)
      .returning();
    return newWishlist;
  }

  async getWishlistById(id: number): Promise<Wishlist | undefined> {
    const [wishlist] = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.id, id));
    return wishlist;
  }

  async getWishlistByShareId(shareId: string): Promise<Wishlist | undefined> {
    const [wishlist] = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.shareId, shareId));
    return wishlist;
  }

  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    return await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId));
  }

  async updateWishlist(
    id: number,
    wishlist: Partial<InsertWishlist>,
  ): Promise<Wishlist | undefined> {
    const [updatedWishlist] = await db
      .update(wishlists)
      .set(wishlist)
      .where(eq(wishlists.id, id))
      .returning();
    return updatedWishlist;
  }

  async deleteWishlist(id: number): Promise<boolean> {
    const result = await db.delete(wishlists).where(eq(wishlists.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new PostgresStorage();
