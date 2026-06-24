Agent vs LLM Call: An agent consists of a loop, which is the major differentiating factor. 
ReAct pattern: In the Healthcare agent, the LLM reasons about symptom severity and knowledge gaps at each step — deciding whether to retrieve more knowledge, ask for clarification, or proceed to a final response.
Reason: LLM decideswhat to do next based on the current context. 
Act: The backebd executes the choosen tool. In our app, the tools go in order starting from get user health profile, analyse health baseline,.. to research symptoms. In case of an emergency, it skips the other tools and runs only research symtoms first. 
Observe: The tool result is sppended to messages. 
Repeat: The LLM is called again with uodated context. 

Fully constrained (fixed pipeline)   →    Guided    →    Fully autonomous (free reasoning)
 Our app sits in the middle. 

 Emergecy flow: 
  Severity classification -> Emergency protocol -> Skips analysis and returns emergency -> emergency response sent to user.

Non-emergency flow:
Severity classification -> Low/medium/high -> Continues to LLm response -> LLM generates fixed reponse -> Disclaimer check -> APi response -> user

Early exit patterrn:
Emergency reponse bypasses the full agent loop and returns immediately with: emergency mamber, nearest ER, mandatory disclaimer, and optional emergency contact notifications. No diagnosis, no speculation. 
The loop is bypassed to ensure the user is able to take action quicker. 

Severity pattern is enforced in the service layer and not in the LLM so that it doesnt get omitted due to LLM variablity, since its critical. 

 
