import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workout } from "@/types";

const WORKOUTS_COLLECTION = "workouts";

export const workoutService = {
  /**
   * Save a new workout
   */
  async saveWorkout(userId: string, workout: Omit<Workout, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), {
        ...workout,
        userId,
        date: Timestamp.now().toMillis(), // Ensure we use server-side style timestamps
      });
      return docRef.id;
    } catch (error) {
      console.error("Error saving workout:", error);
      throw error;
    }
  },

  /**
   * Get recent workouts for a user
   */
  async getRecentWorkouts(userId: string, count: number = 10): Promise<Workout[]> {
    try {
      const q = query(
        collection(db, WORKOUTS_COLLECTION),
        where("userId", "==", userId),
        orderBy("date", "desc"),
        limit(count)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Workout));
    } catch (error) {
      console.error("Error fetching workouts:", error);
      throw error;
    }
  },

  /**
   * Delete a workout
   */
  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, WORKOUTS_COLLECTION, workoutId));
    } catch (error) {
      console.error("Error deleting workout:", error);
      throw error;
    }
  }
};
