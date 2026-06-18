Langchain: Its an orchestration framework that provides pre-built, tested abstractions for the most common AI enginering components: chains, agents, tools, memory, retrievals and prompt template. 
When to use: While prototyping, in Standard use cases that dont need much of customization, Integrations and when you're familiar with the tool. 
Three reasons not to use it: Limited customizability, Difficult to debug, Performace overhead. 

The LCEL pipe "|" tells the program to use the output of the previous component as the inout of the next. Eg: a|b|c. Use output oa a as input of b and so on..

Mapping between Langchain component and our app:
ChatPromptTemplate - Analysis_Input_Template in prompts.py
ChatOpenAI - Raw openai.ChatCompletion call in executor.py 
StrOutputParser - Manual response parsing in agent_service.py
retriever | format_docs  →  similarity_search() in vector_store.py

At this stage, I would chosoe to migrate to Langchain since this is a generic use case without much customization. The problem statement is simple and the solution wouldn't required much changes. 
