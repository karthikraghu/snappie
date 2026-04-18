import { ItemDocument } from "../types";

/**
 * Mock Firestore Database using an in-memory Map.
 * Note: Since Next.js API routes run in a Node.js server container, 
 * global variables can persist across dev mode reloads (though they may reset on hard reloads).
 * This simulates a NoSQL document database like Firestore.
 */

// We use global to prevent hot reloading issues in Next.js development
const globalForDb = global as unknown as { mockDb: Map<string, ItemDocument> };
const db = globalForDb.mockDb || new Map<string, ItemDocument>();
if (process.env.NODE_ENV !== "production") globalForDb.mockDb = db;

export const MockDB = {
  createItem: async (doc: ItemDocument): Promise<void> => {
    db.set(doc.id, doc);
  },

  getItem: async (id: string): Promise<ItemDocument | null> => {
    return db.get(id) || null;
  },

  updateItem: async (id: string, updates: Partial<ItemDocument>): Promise<void> => {
    const existing = db.get(id);
    if (!existing) throw new Error("Document not found");
    db.set(id, { ...existing, ...updates });
  },

  getItemsByUser: async (userId: string): Promise<ItemDocument[]> => {
    const results: ItemDocument[] = [];
    db.forEach((value) => {
      if (value.userId === userId) {
        results.push(value);
      }
    });
    // Sort descending by creation date
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
