import { supabase } from '../lib/supabaseClient';

export const analyzeFoodWithAI = async (mealDescription: string, imageBase64?: string | null) => {
  // We call a secure Supabase Edge Function to protect the Gemini API key
  const { data, error } = await supabase.functions.invoke('analyze-food', {
    body: { meal: mealDescription, imageBase64 }
  });

  if (error) {
    console.error("AI Service Error:", error);
    throw error;
  }

  return data;
};

export const getDoctorConsultation = async (message: string, context?: any) => {
  // We call a secure Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('chat-doctor', {
    body: { message, context }
  });

  if (error) {
    console.error("AI Service Error:", error);
    throw error;
  }

  return data;
};

export const analyzeStressEvent = async (incident: string) => {
  // Simulate an AI evaluation of psychological load severity since we don't have an edge function for it yet
  let severity = 30; 
  const lowerDesc = incident.toLowerCase();
  
  if (lowerDesc.includes('intense') || lowerDesc.includes('awful') || lowerDesc.includes('breakup') || lowerDesc.includes('fired') || lowerDesc.includes('death')) {
      severity = 85;
  } else if (lowerDesc.includes('mild') || lowerDesc.includes('annoying') || lowerDesc.includes('traffic') || lowerDesc.includes('late')) {
      severity = 15;
  }
  
  // In a real app we'd update the DB here and reload the app state.
  return { severity, analysis: `Forkplay AI evaluated this load at ${severity}% capacity.` };
};
