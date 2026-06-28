A single agent trying to do everything becomes a generalist that does nothing particularly well. When one agent carries too much responsibility, its reasoning quality degrades because it's juggling too many concerns simultaneously, this is called context pollution.

User Request
     ↓
Supervisor Agent
  ↓           ↓           ↓
Intake     Diagnosis   Provider
Agent      Agent       Agent

Supervisor — receives the user query, decides which specialist to call, assembles the final response.
Specialist agents — each focused on one domain, with their own tools and prompts.

Agent 1 — Intake Agent

Collects and summarizes user health profile, parses the query, identifies what information is needed. Tools: get_user_health_profile, analyze_health_baseline.
Agent 2 — Diagnosis Agent

Analyzes symptoms, retrieves medical knowledge, classifies severity. Tools: research_symptoms, retrieve_health_knowledge, escalate_emergency.
Agent 3 — Provider Agent

Based on severity and diagnosis analysis, recommends next steps, finds appropriate healthcare providers. Tools: find_healthcare_providers, location services.



Supervisor agent loop:


User query arrives at Supervisor
          ↓
Supervisor decides: "I need user context first"
          ↓
Supervisor delegates to → Intake Agent
Intake Agent returns: user profile summary
          ↓
Supervisor decides: "Now I need symptom analysis"
          ↓
Supervisor delegates to → Diagnosis Agent
Diagnosis Agent returns: severity = EMERGENCY
          ↓
Supervisor decides: "Emergency — skip provider search"
          ↓
Supervisor assembles emergency response → User

--- OR ---

Diagnosis Agent returns: severity = MEDIUM
          ↓
Supervisor decides: "Need provider recommendations"
          ↓
Supervisor delegates to → Provider Agent
Provider Agent returns: nearby doctors
          ↓
Supervisor assembles final response → User



Two flows (emergency and non-emergency):

Non-emergency: Supervisor → Intake → Supervisor → Diagnosis → Supervisor → Provider → Supervisor → END
Emergency: Supervisor → Intake → Supervisor → Diagnosis → Supervisor → END


Currently, for the healthcare app at this tage, multi-agent setup isnt worth the complexity. In case, the scale goes higher and we introduce more users/other distinguished features, the multi agent setup might be better. 
