"use client";

import { useState } from "react";
import { Exercise, Workout, Set } from "@/types";
import { workoutService } from "@/services/workoutService";
import { useAuth } from "@/hooks/useAuth";

export default function WorkoutLogger() {
  const { user } = useAuth();
  const [title, setTitle] = useState("Morning Session");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      category: "strength",
      sets: [{ reps: 0, weight: 0 }]
    };
    setExercises([...exercises, newExercise]);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof Set, value: number) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const workoutData: Omit<Workout, "id"> = {
        userId: user.uid,
        title,
        date: Date.now(),
        exercises,
      };
      await workoutService.saveWorkout(user.uid, workoutData);
      setMessage("Workout saved successfully!");
      setExercises([]); // Reset after save
    } catch (error) {
      setMessage("Failed to save workout.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus:ring-0 w-full"
          placeholder="Workout Title"
        />
      </div>

      <div className="space-y-8">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="card-tech animate-in fade-in slide-in-from-bottom-2">
            <input
              type="text"
              placeholder="Exercise Name (e.g. Bench Press)"
              value={exercise.name}
              onChange={(e) => {
                setExercises(exercises.map(ex => 
                  ex.id === exercise.id ? { ...ex, name: e.target.value } : ex
                ));
              }}
              className="w-full text-lg font-semibold bg-transparent border-b border-gray-100 focus:border-brand-electric transition-colors mb-4 outline-none"
            />

            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                <span>Set</span>
                <span>Weight (kg)</span>
                <span>Reps</span>
                <span></span>
              </div>
              
              {exercise.sets.map((set, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-2 rounded-lg">
                  <span className="text-center font-mono">{idx + 1}</span>
                  <input
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) => updateSet(exercise.id, idx, "weight", parseFloat(e.target.value))}
                    className="bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-brand-electric outline-none"
                  />
                  <input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) => updateSet(exercise.id, idx, "reps", parseInt(e.target.value))}
                    className="bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-brand-electric outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exercise.id)}
              className="mt-4 text-sm text-brand-electric font-semibold hover:underline"
            >
              + Add Set
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 pt-6">
        <button
          onClick={addExercise}
          className="w-full border-2 border-dashed border-gray-300 py-4 rounded-xl text-gray-500 hover:border-brand-electric hover:text-brand-electric transition-all font-medium"
        >
          + Add Exercise
        </button>

        {exercises.length > 0 && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-brand-electric transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Finish Workout"}
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-center font-medium ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message}
        </div>
      )}
    </div>
  );
}
