The Three Hallucination Risk Types In the app:

Type 1 — Knowledge Hallucination
Source: FAISS corpus is outdated or retrieval returns irrelevant chunks
Risk: LLM gives advice based on wrong or irrelevant financial principles
Fix: Keep corpus updated, use reranking to improve retrieval quality

Type 2 — Data Hallucination  
Source: LLM bypasses tools and generates user data from memory
Risk: Fabricated numbers presented as the user's actual financial data
Fix: Grounding rules (Rule 1), tool_choice="required", output validation

Type 3 — Faithfulness Hallucination
Source: LLM misquotes or modifies numbers from tool outputs in narrative
Risk: Real data retrieved correctly but misrepresented in final answer
Fix: Structured output validation, citation prompting, number cross-checking

Existing anti-hallucination mechanisms:
1. grounding rules:
Rule 1: Never calculate from memory, always use tools → prevents Type 2
Rule 3: Always retrieve knowledge before advising → prevents Type 1
JSON structured output → forces the LLM into a predictable format

2. tool calling:
   tool_choice="auto" with strong prompt instructions → soft Type 2 prevention
   Tool error handling → graceful degradation instead of fabrication

3. RAG retrieval and reranking:
   FAISS retrieval → grounds responses in documented knowledge
   Reranking (Day 9) → improves relevance of retrieved chunks

Output validation:
The numbers of inout and ouout are compared against each other to validate the accuracy of the output. If there is a numebr mismatch, it is flagged. The main limitation of this method is that the output may contain numerics that werent a part of the input but are logically correct. The system may identify this as incorrect and flag it. 

3 validation approaches:
1. LLm as a judge: a Second llm call is made to verify the output and its accurateness. This adds more cost since we are calling the LLM twice as whats needed.
2. Citation prompting: The citation/reference of where the output came from is cited with its source letting the user know the source. This is complex for the program to validate.
3. Confidence scoring: The model rates its own output with a confidence rating between low,medium or high. The tradeoff for this is soft signal. We're trusting the LLm to rate itself.

We chose confidence scoring since its the best approach for an app of this size. We arent really compromising on anything. Approach 1 is expensive and Approach 2 is complex. For our data and user base, approach 3 is best suited. 

When the confidence is low, the backend tells the user to not consider this current suggestion and aks the user to submit more data thats required by the LLM to give out a better response. 

Updated JSON:
"narrative_summary": "2-3 paragraph plain-English summary",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "priority_actions": ["action 1", "action 2", "action 3"],
  "disclaimer": "This is AI-generated financial guidance...",
  "confidence": "HIGH | MEDIUM | LOW — based on data completeness and tool execution success",
  "data_completeness": "Plain English description of which tools succeeded and what data was available"
