"use client";

import { useState, useEffect } from "react";
import { aiService } from "@/services/aiService";
import { Workout, UserProfile } from "@/types";

interface AICoachProps {
  workouts: Workout[];
  profile?: UserProfile;
}

export default function AICoach({ workouts, profile }: AICoachProps) {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateInsight = async () => {
    setIsLoading(true);
    try {
      const result = await aiService.analyzeRecentWorkouts(workouts, profile);
      setInsight(result);
    } catch (error) {
      setInsight("Unable to reach the coach. Check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workouts.length > 0 && !insight) {
      generateInsight();
    }
  }, [workouts, profile]);

  return (
    <div className="card-tech border-brand-electric/30 bg-gradient-to-br from-white to-brand-electric/5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-brand-electric flex items-center justify-center">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <h2 className="text-lg font-bold">Coach Insights</h2>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed italic">
            "{insight || "Log a workout to get started!"}"
          </p>
          
          <button 
            onClick={generateInsight}
            className="text-xs font-bold text-brand-electric uppercase tracking-widest hover:underline"
          >
            Refresh Analysis
          </button>
        </div>
      )}
    </div>
  );
}
