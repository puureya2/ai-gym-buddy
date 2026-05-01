"use client";

import { useState } from "react";
import { authService } from "@/services/authService";

interface OnboardingModalProps {
  userId: string;
  onComplete: () => void;
}

const GOALS = [
  "Build Muscle",
  "Lose Weight",
  "Increase Endurance",
  "Improve Flexibility",
  "General Health",
  "Powerlifting"
];

export default function OnboardingModal({ userId, onComplete }: OnboardingModalProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSave = async () => {
    if (selectedGoals.length === 0) return;
    setIsSaving(true);
    try {
      await authService.updateUserGoals(userId, selectedGoals);
      onComplete();
    } catch (error) {
      console.error("Failed to save goals");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card-tech bg-white w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-tight italic">DEFINE YOUR MISSION</h2>
          <p className="text-gray-500 text-sm">Select your primary fitness goals to personalize your AI Coach.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`p-3 rounded-xl border-2 text-xs font-bold transition-all uppercase tracking-wider ${
                selectedGoals.includes(goal)
                  ? "border-brand-electric bg-brand-electric/5 text-brand-electric"
                  : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={selectedGoals.length === 0 || isSaving}
          className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-brand-electric transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-brand-electric/20"
        >
          {isSaving ? "CONFIGURING..." : "READY TO TRAIN"}
        </button>
      </div>
    </div>
  );
}
