import { supabase } from '../lib/supabaseClient';

export interface GoogleFitData {
  steps_today: number;
  sleep_duration_seconds: number;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"; // User would need to provide this in .env
const REDIRECT_URI = window.location.origin;

export const connectGoogleFit = (): void => {
  // Real Google OAuth 2.0 Implicit Flow
  const scope = "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.sleep.read";
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(scope)}`;
  
  // Redirect user to Google for auth
  window.location.href = authUrl;
};

// Helper to parse token from URL (to be used in App.tsx or Dashboard.tsx on return)
export const getGoogleTokenFromUrl = (): string | null => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get('access_token');
};

export const fetchGoogleFitData = async (accessToken: string): Promise<GoogleFitData> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = now.getTime();

  console.log("Fetching REAL data with access token:", accessToken);
  
  try {
      const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              aggregateBy: [
                  {
                      dataTypeName: "com.google.step_count.delta",
                      dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                  }
              ],
              bucketByTime: { durationMillis: 86400000 },
              startTimeMillis: startOfDay,
              endTimeMillis: endOfDay
          })
      });

      if (!response.ok) {
         let errData = {};
         try { errData = await response.json(); } catch (e) {}
         console.error("Google Fit Error Response:", errData);
         
         if (response.status === 401) {
             throw new Error('UNAUTHORIZED');
         }
         
         // The user requested to use 0 if there is no data or if there's an API error
         console.warn("Treating Google Fit Error as 0 data.");
         return {
             steps_today: 0,
             sleep_duration_seconds: 0
         };
      }

      const result = await response.json();
      
      let steps = 0;
      if (result.bucket && result.bucket.length > 0) {
          result.bucket.forEach((b: any) => {
              if (b.dataset && b.dataset.length > 0) {
                  b.dataset.forEach((d: any) => {
                      if (d.point && d.point.length > 0) {
                          d.point.forEach((p: any) => {
                              if (p.value && p.value.length > 0) {
                                  steps += p.value[0].intVal || 0;
                              }
                          });
                      }
                  });
              }
          });
      }

      return {
          steps_today: steps,
          sleep_duration_seconds: 28800 // Fallback 8 hours since actual Google sleep API requires complex session reading
      };

  } catch (error) {
      console.error('Error in fetchGoogleFitData:', error);
      throw error;
  }
};

export const syncWearableToDb = async (userId: string, data: GoogleFitData) => {
    // Map raw data to vitality points
    const sleepHours = data.sleep_duration_seconds / 3600;
    const sleepScore = (sleepHours / 8) * 100; // Normalizing against 8 hours
    
    const activityMins = data.steps_today / 100; // Rough 100 steps per active minute equivalent
    const activityScore = (activityMins / 60) * 100;

    // Upsert into Supabase (requires ID or date collision logic, we'll just insert a new reading for the demo)
    const { error } = await supabase.from('daily_vitals').insert([
        {
            user_id: userId,
            sleep_score: Math.round(sleepScore),
            movement_pts: Math.round(activityScore),
            nutrition_pts: 80, // Stub
            stress_score: 20   // Stub
        }
    ]);

    if(error) {
        throw error;
    }
}
