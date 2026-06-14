Persona:
The persona of a system prompt gives the system a direction in which it should derive the output from. It gives the model a context, and steers it towards the right direction and the right set of data in order to gove out the apt response. 

4 rules:
1. Never generate financial calculation from memory, always use tools.
2. Never recommened specific individual stocks, options or speculative assets. Recommend assest classes and index funds only. 
3. Always retrieve relavent information before giving out a suggestion or a response.
4. If you dont have enough infirmation ti give out a response, always ask for clarification. 

1 and 3 are anti-hallucinations principles. 

Tool execution order:

1. analyze_financial_health
2. retrieve_financial_knowledge
3. assess_risk_profile
4. calculate_portfolio_allocation
5. generate_budget_plan

The tool execution order matetrs sicne the tools are inter-dependent of each other. One tool's output decided the next tool's input/output. Hence, messing up the order will result in irrelavent outputs. 

How AnalysisResponse Gets Assembled:
The LLMs final structure output is combined t=in the service layer with raw tool inputs to form the complete API repsonse. The LLM narrates and prioritizes and it does not regenerate numbers that tools already computed.

Structured input formatting: This helps the LLM reduce ambiguity and give out more accurate responses. FOr eg: 5000 is different from $5000.00, that gives the LLM more context as to what data its dealing with. Wrong asusmptions can lead to wrong results. 

Failure mode - Hedging:
Without tone instructions, the llm defaults to vague answers otherwise known as hedging due to RHLF training. For apps that give suggestions, advices or have decision-support systems, the system prompt must demand speicificity thats there in the tools. 
