import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { ChatMessage, UserProfile, Workout, Routine } from "@/types";
import { getAiAdvice } from "@/lib/gemini";

const MESSAGES_COLLECTION = "chat_messages";

export const chatService = {
  async sendMessage(userId: string, content: string, profile: UserProfile, recentWorkouts: Workout[]): Promise<ChatMessage> {
    // 1. Save user report
    const userMsg: Omit<ChatMessage, 'id'> = {
      userId,
      role: 'user',
      content,
      timestamp: Date.now()
    };
    await addDoc(collection(db, MESSAGES_COLLECTION), userMsg);

    // 2. Context Aggregation
    const history = await this.getChatHistory(userId, 8);
    const workoutSummary = recentWorkouts.slice(0, 3).map(w => {
      const duration = w.endTime && w.startTime ? Math.round((w.endTime - w.startTime) / 60000) : 'N/A';
      return `[${new Date(w.date).toLocaleDateString()}] ${w.title}: ${w.exercises.length} objectives. Duration: ${duration}m. Notes: ${w.notes}`;
    }).join("\n");

    const personalityPrompt = profile.coachPersonality === 'custom' && profile.customCoachSettings
      ? `Custom Traits (Intensity: ${profile.customCoachSettings.intensity}/10, Caution: ${profile.customCoachSettings.cautionLevel}/10, Research: ${profile.customCoachSettings.researchFocus}/10. Style: ${profile.customCoachSettings.styleDescription})`
      : profile.coachPersonality || 'data_scientist';

    // 3. Unified Orchestration Prompt
    const prompt = `
      System: You are "Gym Buddy AI", acting as ${personalityPrompt}. 
      Act as a high-tier professional fitness orchestrator.
      
      Athlete Dossier:
      - Vitals: ${profile.height}cm / ${profile.weight}kg
      - Primary Mission: ${profile.fitnessGoals.join(", ")}
      - Health/Injuries: ${profile.injuries?.join(", ") || "None"} / ${profile.healthConcerns?.join(", ") || "None"}
      - Training Age: ${profile.trainingAge}
      
      Recent Field Performance:
      ${workoutSummary || "No missions logged yet."}
      
      Comm History:
      ${history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}
      
      LATEST REPORT: "${content}"
      
      OPERATIONAL GUIDELINES:
      1. INTENT SCRUBBING: If report is junk ("...", "asdf") or impossible ("I want to grow 1000kg today"), politely redirect them to their mission goals.
      2. ROUTINE PROTOCOL: If suggesting a workout, first provide a SUMMARY and ask "Shall I generate this protocol for your library?". 
         ONLY include the JSON block if they have explicitly confirmed or asked for the plan.
      3. SUGGESTED REPLIES: You MUST provide exactly 2 or 3 short (max 4 words) user-centric follow-up questions.
         IMPORTANT: These MUST be phrased as things the USER would ask YOU (e.g., "Can I share my diet?" or "Is this weight safe?") not questions you ask them.
      4. FORMATTING: Use Markdown (bold, bullet points) for readability. Keep responses concise and summarized.
      
      REQUIRED RESPONSE FORMAT:
      Your technical/character response here...
      
      SUGGESTED_REPLIES: ["Short reply 1", "Short reply 2"]
      
      SERIALIZED_ROUTINE: {"name": "...", "exercises": [{"name": "Exercise Name", "category": "strength", "sets": [], "plannedSets": 3, "plannedReps": "10-12"}]}
    `;

    const aiResponse = await getAiAdvice(prompt);
    
    // 4. Data Extraction
    let pendingRoutine: any | undefined;
    let suggestedReplies: string[] = [];
    let cleanContent = aiResponse;

    // Extract Replies
    if (aiResponse.includes("SUGGESTED_REPLIES:")) {
      const parts = aiResponse.split("SUGGESTED_REPLIES:");
      cleanContent = parts[0].trim();
      try {
        const replyPart = parts[1].split("SERIALIZED_ROUTINE:")[0].trim();
        suggestedReplies = JSON.parse(replyPart);
      } catch (e) { console.error("Reply parse fail"); }
    }

    // Extract Routine
    if (aiResponse.includes("SERIALIZED_ROUTINE:")) {
      const routinePart = aiResponse.split("SERIALIZED_ROUTINE:")[1].trim();
      const startIdx = routinePart.indexOf('{');
      const endIdx = routinePart.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        try {
          const rawRoutine = JSON.parse(routinePart.substring(startIdx, endIdx + 1));
          
          // Data Integrity: Ensure exercises have required fields for Firestore
          if (rawRoutine.exercises && Array.isArray(rawRoutine.exercises)) {
            rawRoutine.exercises = rawRoutine.exercises.map((ex: any) => ({
              id: ex.id || Math.random().toString(36).substr(2, 9),
              name: ex.name || "Unknown Objective",
              category: ex.category || "strength",
              sets: ex.sets || [],
              notes: ex.notes || "",
              plannedSets: ex.plannedSets || 0,
              plannedReps: ex.plannedReps || ""
            }));
          }
          
          pendingRoutine = rawRoutine;
          // Further clean content if it wasn't already
          cleanContent = cleanContent.replace(/SERIALIZED_ROUTINE:[\s\S]*/g, "").trim();
        } catch (e) { console.error("Routine parse fail"); }
      }
    }

    const aiMsg: any = {
      userId,
      role: 'model',
      content: cleanContent,
      timestamp: Date.now(),
    };
    
    if (suggestedReplies.length > 0) aiMsg.suggestedReplies = suggestedReplies;
    if (pendingRoutine) aiMsg.pendingRoutine = pendingRoutine;

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), aiMsg);

    return { id: docRef.id, ...aiMsg };
  },

  async getChatHistory(userId: string, count: number = 20): Promise<ChatMessage[]> {
    const q = query(collection(db, MESSAGES_COLLECTION), where("userId", "==", userId), orderBy("timestamp", "desc"), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
  }
};
