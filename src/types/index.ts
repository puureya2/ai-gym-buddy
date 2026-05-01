export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  fitnessGoals: string[];
  preferences: {
    unitSystem: 'metric' | 'imperial';
    theme: 'light' | 'dark';
  };
}

export interface Workout {
  id: string;
  userId: string;
  date: number;
  title: string;
  exercises: Exercise[];
  notes?: string;
  durationMinutes?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  category: 'strength' | 'cardio' | 'flexibility' | 'calisthenics';
}

export interface Set {
  reps: number;
  weight?: number;
  rpe?: number; // Rate of Perceived Exertion
}
