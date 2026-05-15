import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { UserProfile } from "@/types";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists in Firestore, if not create one
      await this.ensureUserProfile(user);
      
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  /**
   * Ensures a user profile exists in Firestore
   */
  async ensureUserProfile(user: User): Promise<void> {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: Date.now(),
        fitnessGoals: [],
        preferences: {
          unitSystem: 'metric',
          theme: 'light',
        },
        totalWorkoutsCompleted: 0,
        lastActive: 0,
        tutorialStep: 0
      };
      await setDoc(userDocRef, newProfile);
    }
  },

  /**
   * Update any part of the user profile
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  /**
   * Update user fitness goals
   */
  async updateUserGoals(userId: string, goals: string[]): Promise<void> {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { fitnessGoals: goals });
    } catch (error) {
      console.error("Error updating user goals:", error);
      throw error;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
