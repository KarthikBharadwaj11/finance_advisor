from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional

# State definition
class HealthAgentState(TypedDict):
    user_id: str
    user_query: str
    user_profile: dict
    symptom_analysis: dict
    severity: str
    knowledge_context: list
    final_response: str
    disclaimer: str
    emergency_resources: Optional[dict]
    doctor_recommendation: Optional[str]
    messages: list

# Step 1 — Define your nodes as functions
def get_user_profile(state: HealthAgentState) -> HealthAgentState:
    """Node 1 — fetch user health profile"""
    # In production this queries PostgreSQL
    # For now, simulate with mock data
    state["user_profile"] = {
        "age": 35,
        "medications": ["lisinopril"],
        "conditions": ["hypertension"],
        "allergies": ["penicillin"]
    }
    return state

def research_symptoms(state: HealthAgentState) -> HealthAgentState:
    """Node 2 — analyze symptoms and classify severity"""
    query = state["user_query"]
    
    # Simulate symptom analysis
    # In production this calls your research_symptoms tool
    if any(word in query.lower() for word in ["chest pain", "heart", "stroke", "unconscious"]):
        state["symptom_analysis"] = {"possible_conditions": ["cardiac event"]}
        state["severity"] = "EMERGENCY"
    elif any(word in query.lower() for word in ["headache", "nausea", "fever"]):
        state["symptom_analysis"] = {"possible_conditions": ["viral infection", "tension headache"]}
        state["severity"] = "MEDIUM"
    else:
        state["symptom_analysis"] = {"possible_conditions": ["minor ailment"]}
        state["severity"] = "LOW"
    
    return state

def retrieve_knowledge(state: HealthAgentState) -> HealthAgentState:
    """Node 3 — retrieve relevant medical knowledge"""
    # In production this calls your RAG pipeline
    state["knowledge_context"] = [
        "Headaches lasting more than 3 days warrant medical evaluation",
        "Stay hydrated and rest for mild symptoms"
    ]
    return state

def generate_response(state: HealthAgentState) -> HealthAgentState:
    """Node 4 — generate final response for non-emergency"""
    severity = state["severity"]
    
    if severity == "MEDIUM":
        state["doctor_recommendation"] = "Please consult a doctor within the next few days"
    elif severity == "HIGH":
        state["doctor_recommendation"] = "Please seek medical attention today"
    
    state["final_response"] = f"Based on your symptoms: {state['symptom_analysis']['possible_conditions']}"
    state["disclaimer"] = "This is not medical advice. Consult a healthcare professional."
    return state

def emergency_response(state: HealthAgentState) -> HealthAgentState:
    """Node 5 — emergency branch"""
    state["emergency_resources"] = {
        "emergency_number": "911",
        "message": "These symptoms require immediate emergency care. Call 911 now.",
    }
    state["disclaimer"] = "This is not a diagnosis. Call emergency services immediately."
    state["final_response"] = state["emergency_resources"]["message"]
    return state

# Step 2 — Build the graph
def route_by_severity(state: HealthAgentState) -> str:
    """Conditional edge — decides next node based on severity"""
    if state["severity"] == "EMERGENCY":
        return "emergency_response"
    else:
        return "retrieve_knowledge"

# Create the graph
workflow = StateGraph(HealthAgentState)

# Add nodes
workflow.add_node("get_user_profile", get_user_profile)
workflow.add_node("research_symptoms", research_symptoms)
workflow.add_node("retrieve_knowledge", retrieve_knowledge)
workflow.add_node("generate_response", generate_response)
workflow.add_node("emergency_response", emergency_response)

# Add edges
workflow.set_entry_point("get_user_profile")
workflow.add_edge("get_user_profile", "research_symptoms")
workflow.add_conditional_edges(
    "research_symptoms",
    route_by_severity,
    {
        "emergency_response": "emergency_response",
        "retrieve_knowledge": "retrieve_knowledge"
    }
)
workflow.add_edge("retrieve_knowledge", "generate_response")
workflow.add_edge("generate_response", END)
workflow.add_edge("emergency_response", END)

# Compile
app = workflow.compile()

# Test the graph
if __name__ == "__main__":
    # Test emergency flow
    result = app.invoke({
        "user_id": "test_user",
        "user_query": "I have had a mild headache for the past 3 days",
        "user_profile": {},
        "symptom_analysis": {},
        "severity": "",
        "knowledge_context": [],
        "final_response": "",
        "disclaimer": "",
        "emergency_resources": None,
        "doctor_recommendation": None,
        "messages": [],
        "steps": []
    })
    
    print("SEVERITY:", result["severity"])
    print("RESPONSE:", result["final_response"])
    print("DISCLAIMER:", result["disclaimer"])
    print("EMERGENCY:", result["emergency_resources"])
    print("DOCTOR RECOMMENDATION:", result["doctor_recommendation"])