Here is a comprehensive, CEO-level **SPEC.md** for **Kalories® Foreplay AI**. This document is designed to be the "source of truth" for your AI agents in Antigravity. It balances technical requirements with the brand’s vision of premium, frictionless wellness.

---

# SPEC.md: Kalories® Foreplay AI Platform

## ## 1. Project Overview

**Kalories® Foreplay AI** is a premium wellness ecosystem that bridges the gap between daily lifestyle data and nutraceutical optimization. The platform uses AI to analyze biometrics and provide "Life Moment Engineering," recommending specific Kalories™ functional chocolates (Intimacy, Sport, Sleep, Gym) to optimize human performance.

## ## 2. Core Vision & Branding

* **Persona:** A high-end health concierge. Supportive, scientific, and discreet.
* **Visual Identity:** "Luxury Performance" (Deep Black, Emerald Green, and Ruby Red accents).
* **Guiding Principle:** **Context over Tracking.** Don't just log data; explain what it means for the user's vitality.

---

## ## 3. Feature Architecture

### ### Pillar 1: The Vitality Engine (The Brain)

* **The Single Ring:** A deconstructed circular UI element representing the "Vitality Score" (0-100).
* **Emerald Segment:** Physical Activity (Steps, active minutes, blood flow).
* **Amber Segment:** Nutrition (Micro/Macro density, specifically Zinc, Magnesium, D3).
* **Indigo Segment:** Recovery (Sleep stages, HRV, Stress levels).
* **Ruby Segment:** Subjective Vitality (Daily user energy/libido check-in).


* **Gap Analysis:** Logic that identifies *why* a score is low (e.g., "Circulation Gap detected due to 6 hours of sedentary behavior").

### ### Pillar 2: Hybrid Logging (The Senses)

* **Activity:** * **Auto:** Integration via **Terra API** (Google Fit, Apple Health, Garmin).
* **Manual:** A "Quick-Tap" grid for common activities (Run, Gym, Yoga, Cycle).


* **Nutrition:**
* **Auto:** **Photo-to-Insight** module. AI analyzes food images to estimate nutrient density.
* **Manual:** **Macro-Sliders** (Protein/Carb/Fat sliders) for users who prefer speed over text entry.



### ### Pillar 3: Anonymous Medical Vault (The Trust)

* **Doctor 1:1:** A secure, encrypted chat interface for anonymous consultations with onboarded wellness doctors.
* **AI Triage:** Foreplay AI handles initial health queries before escalating to a human doctor.

### ### Pillar 4: The Intelligent Marketplace (The Solution)

* **Gap-Match Engine:** Every product recommendation must be tied to a data insight.
* *Example:* Low Deep Sleep → Recommend **Melatonin/Sleep Squares**.
* *Example:* High Stress + Gym Day → Recommend **Pre-workout/Gym Squares**.


* **Product Tab:** A standalone store for the full Kalories™ range.

---

## ## 4. Technical Stack

* **Frontend:** React (Vite) + Tailwind CSS (v4).
* **Backend/Database:** **Supabase** (PostgreSQL) for Auth, User Profiles, and Encrypted Chat.
* **AI Models:** * **Gemini 1.5 Pro:** For multi-modal food image analysis and Vitality Engine reasoning.
* **Terra API:** For unified wearable data ingestion.


* **Deployment:** Vercel (Frontend) + Supabase Edge Functions (Backend logic).

---

## ## 5. Data Schema (Supabase)

| Table | Fields |
| --- | --- |
| **profiles** | id, username, bio_data, wearable_id |
| **daily_vitals** | date, user_id, sleep_score, stress_score, movement_pts, nutrition_pts |
| **food_logs** | timestamp, photo_url, macro_breakdown (JSON), micro_gaps (JSON) |
| **recommendations** | user_id, product_id, triggered_by_gap, is_purchased |

---

## ## 6. Interaction Rules for AI Agents

1. **Safety First:** Never make a medical diagnosis. Use phrases like "Your data suggests a trend..." or "Consult our doctors for more insight."
2. **Design Consistency:** All components must use the Emerald/Black/Ruby theme. Use `lucide-react` for iconography.
3. **Frictionless UX:** Minimize clicks. If data can be pulled automatically, do not ask the user for it.

---

### ## Next Step: Initializing the Project

You can now copy this entire block and paste it into `SPEC.md` in your Antigravity folder. Once done, give the Agent Manager this command:

> *"Read SPEC.md. Based on the Pillar 1 and Pillar 2 requirements, generate the first iteration of the **Vitality Ring component** and the **Hybrid Logging UI**. Use Tailwind for styling and ensure the ring is interactive to show data contributions."*

**Would you like me to find a few high-quality UI library suggestions that match the "Luxury Wellness" aesthetic for your agent to use?**