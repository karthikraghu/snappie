import { Firestore } from '@google-cloud/firestore';
import { ItemDocument } from '../types';

// We initialize firestore outside functions. Next.js caches this in the Node process.
const firestore = new Firestore();
const COLLECTION_NAME = process.env.FIRESTORE_COLLECTION || "items";

export const GCPFirestore = {
  createItem: async (doc: ItemDocument): Promise<void> => {
    const docRef = firestore.collection(COLLECTION_NAME).doc(doc.id);
    await docRef.set(doc);
  },

  getItem: async (id: string): Promise<ItemDocument | null> => {
    const docRef = firestore.collection(COLLECTION_NAME).doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;
    return snapshot.data() as ItemDocument;
  },

  updateItem: async (id: string, updates: Partial<ItemDocument>): Promise<void> => {
    const docRef = firestore.collection(COLLECTION_NAME).doc(id);
    // Firestore update syntax merges with existing
    await docRef.update(updates as any);
  },

  getItemsByUser: async (userId: string): Promise<ItemDocument[]> => {
    const querySnapshot = await firestore
      .collection(COLLECTION_NAME)
      .where("userId", "==", userId)
      .get();
    
    const items: ItemDocument[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as ItemDocument);
    });

    // In-memory sort to avoid requiring a formal Firestore Composite Index for (userId ASC + createdAt DESC)
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
