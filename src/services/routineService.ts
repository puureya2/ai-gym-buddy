import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Routine } from "@/types";

const COLLECTION = "routines";

export const routineService = {
  async createRoutine(userId: string, name: string, exercises: any[], isAi = false): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      userId,
      name,
      exercises,
      isAiGenerated: isAi,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return docRef.id;
  },

  async getRoutines(userId: string): Promise<Routine[]> {
    const q = query(collection(db, COLLECTION), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine));
  },

  async updateRoutine(id: string, data: Partial<Routine>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: Date.now() });
  },

  async deleteRoutine(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }
};
