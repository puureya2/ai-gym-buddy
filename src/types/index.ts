export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  fitnessGoals: string[];
  
  // Advanced Biometrics
  height?: number;
  weight?: number;
  bodyFat?: number;
  trainingAge?: 'beginner' | 'intermediate' | 'advanced';
  injuries?: string[];
  healthConcerns?: string[];
  
  // Coach Orchestration
  coachPersonality?: 'drill_sergeant' | 'zen_master' | 'data_scientist' | 'custom';
  coachName?: string;
  customCoachSettings?: {
    intensity: number; // 1-10
    cautionLevel: number; // 1-10
    researchFocus: number; // 1-10
    styleDescription: string;
  };

  // Progression & Tenure
  totalWorkoutsCompleted: number;
  lastActive: number;
  tutorialStep: number; // 0=start, -1=done
  
  preferences: {
    unitSystem: 'metric' | 'imperial';
    theme: 'light' | 'dark';
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  intent?: 'goal_probing' | 'routine_suggestion' | 'safety_check' | 'general';
  suggestedReplies?: string[];
  pendingRoutine?: Routine; // Routine being proposed for approval
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  createdAt: number;
  updatedAt: number;
  isAiGenerated: boolean;
  weeklySchedule?: number[]; // [1, 3, 5] for Mon/Wed/Fri
}

export interface Workout {
  id: string;
  userId: string;
  routineId?: string;
  date: number;
  startTime: number;
  endTime: number;
  title: string;
  exercises: Exercise[];
  notes: string;
  status: 'completed';
  aiDebriefSummary?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'calisthenics';
  sets: Set[];
  notes?: string;
  plannedSets?: number;
  plannedReps?: string;
}

export interface Set {
  reps: number;
  weight?: number;
  rpe?: number;
  completed: boolean;
  plannedWeight?: number;
  plannedReps?: number;
}
