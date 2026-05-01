import { getAiAdvice } from "@/lib/gemini";
import { Workout, UserProfile } from "@/types";

export const aiService = {
  /**
   * Generates an analysis of the user's recent workout performance
   */
  async analyzeRecentWorkouts(workouts: Workout[], profile?: UserProfile): Promise<string> {
    if (workouts.length === 0) {
      return "Log your first workout to get a personalized AI analysis of your performance!";
    }

    const workoutSummary = workouts.map(w => {
      const date = new Date(w.date).toLocaleDateString();
      const exercises = w.exercises.map(ex => {
        const totalSets = ex.sets.length;
        const bestWeight = Math.max(...ex.sets.map(s => s.weight || 0));
        return `${ex.name}: ${totalSets} sets, max weight ${bestWeight}kg`;
      }).join("; ");
      return `[${date}] ${w.title}: ${exercises}`;
    }).join("\n");

    const prompt = `
      You are "Gym Buddy AI", a performance-focused fitness coach. 
      Analyze the following recent workout data and provide a concise (max 3-4 sentences), motivating, and data-driven insight.
      Focus on identifying progress, suggesting a specific improvement for the next session, or pointing out a trend.
      
      User Profile: ${profile ? JSON.stringify(profile.fitnessGoals) : "General fitness"}
      
      Recent History:
      ${workoutSummary}
      
      Your advice should be technical yet encouraging, aligning with a "Performance Tech" aesthetic.
    `;

    try {
      return await getAiAdvice(prompt);
    } catch (error) {
      return "I'm having trouble analyzing your data right now. Let's keep training!";
    }
  },

  /**
   * Quick tip based on the time of day or general motivation
   */
  async getQuickTip(): Promise<string> {
    const prompt = "Give me one very short (1 sentence), high-impact fitness tip related to recovery or training efficiency.";
    try {
      return await getAiAdvice(prompt);
    } catch (error) {
      return "Consistency is the key to all progress.";
    }
  }
};
