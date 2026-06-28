from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional, Literal

# Shared state across all agents
class SupervisorState(TypedDict):
    user_query: str
    user_profile: Optional[dict]
    symptom_analysis: Optional[dict]
    severity: Optional[str]
    provider_recommendations: Optional[list]
    final_response: Optional[str]
    next_agent: Optional[str]  # supervisor sets this
    messages: list

# ── SPECIALIST AGENTS ────────────────────────────────────────────────────────

def intake_agent(state: SupervisorState) -> SupervisorState:
    """Specialist 1 — collect and summarize user health profile"""
    # Mock — in production queries PostgreSQL
    state["user_profile"] = {
        "age": 35,
        "conditions": ["hypertension"],
        "medications": ["lisinopril"],
        "allergies": ["penicillin"]
    }
    print("Intake Agent: user profile collected")
    return state

def diagnosis_agent(state: SupervisorState) -> SupervisorState:
    """Specialist 2 — analyze symptoms, classify severity"""
    query = state["user_query"].lower()
    
    if any(w in query for w in ["chest pain", "heart", "unconscious", "stroke"]):
        state["symptom_analysis"] = {"conditions": ["possible cardiac event"]}
        state["severity"] = "EMERGENCY"
    elif any(w in query for w in ["headache", "fever", "nausea", "dizzy"]):
        state["symptom_analysis"] = {"conditions": ["viral infection", "tension"]}
        state["severity"] = "MEDIUM"
    else:
        state["symptom_analysis"] = {"conditions": ["minor ailment"]}
        state["severity"] = "LOW"
    
    print(f"Diagnosis Agent: severity = {state['severity']}")
    return state

def provider_agent(state: SupervisorState) -> SupervisorState:
    """Specialist 3 — find appropriate healthcare providers"""
    severity = state["severity"]
    
    if severity == "HIGH":
        state["provider_recommendations"] = ["Urgent Care Center — 0.5 miles"]
    else:
        state["provider_recommendations"] = ["Dr. Smith, GP — 1.2 miles", 
                                              "City Medical Center — 2.1 miles"]
    
    print("Provider Agent: providers found")
    return state

# ── SUPERVISOR ───────────────────────────────────────────────────────────────

def supervisor(state: SupervisorState) -> SupervisorState:
    """
    Supervisor — decides which specialist to call next.
    Reads current state and sets next_agent accordingly.
    """
    # No user profile yet — call intake first
    if not state.get("user_profile"):
        state["next_agent"] = "intake_agent"
        print("Supervisor: delegating to Intake Agent")
        return state
    
    # Have profile but no symptom analysis — call diagnosis
    if not state.get("symptom_analysis"):
        state["next_agent"] = "diagnosis_agent"
        print("Supervisor: delegating to Diagnosis Agent")
        return state
    
    # Emergency — skip provider search
    if state.get("severity") == "EMERGENCY":
        state["next_agent"] = "end"
        state["final_response"] = "EMERGENCY: Call 911 immediately. Do not wait."
        print("Supervisor: EMERGENCY detected — bypassing provider search")
        return state
    
    # Have diagnosis but no providers — call provider agent
    if not state.get("provider_recommendations"):
        state["next_agent"] = "provider_agent"
        print("Supervisor: delegating to Provider Agent")
        return state
    
    # Have everything — assemble final response
    state["next_agent"] = "end"
    state["final_response"] = (
        f"Conditions: {state['symptom_analysis']['conditions']}. "
        f"Severity: {state['severity']}. "
        f"Providers: {state['provider_recommendations']}. "
        f"Disclaimer: This is not medical advice."
    )
    print("Supervisor: assembling final response")
    return state

# ── ROUTING ──────────────────────────────────────────────────────────────────

def route_supervisor(state: SupervisorState) -> str:
    return state["next_agent"]

# ── BUILD GRAPH ──────────────────────────────────────────────────────────────

workflow = StateGraph(SupervisorState)

workflow.add_node("supervisor", supervisor)
workflow.add_node("intake_agent", intake_agent)
workflow.add_node("diagnosis_agent", diagnosis_agent)
workflow.add_node("provider_agent", provider_agent)

workflow.set_entry_point("supervisor")

workflow.add_conditional_edges(
    "supervisor",
    route_supervisor,
    {
        "intake_agent": "intake_agent",
        "diagnosis_agent": "diagnosis_agent",
        "provider_agent": "provider_agent",
        "end": END
    }
)

# After each specialist, return to supervisor
workflow.add_edge("intake_agent", "supervisor")
workflow.add_edge("diagnosis_agent", "supervisor")
workflow.add_edge("provider_agent", "supervisor")

app = workflow.compile()

if __name__ == "__main__":
    # Test non-emergency flow
    result = app.invoke({
        "user_query":  "I have chest pain and my left arm is numb",
        "user_profile": None,
        "symptom_analysis": None,
        "severity": None,
        "provider_recommendations": None,
        "final_response": None,
        "next_agent": None,
        "messages": []
    })
    
    print("\n--- FINAL RESULT ---")
    print("SEVERITY:", result["severity"])
    print("RESPONSE:", result["final_response"])