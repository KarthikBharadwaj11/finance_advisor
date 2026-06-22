LLMs have no memory by default, the backend resonstructs the memory from the database and feeds it in as context every single time.

PostgreSQL:
So when a user comes back for a second conversation, the app
1.Queries conversation_history from PostgreSQL for that user's previous messages
2.Injects those messages into the messages list before calling the LLM
3.The LLM sees the history as if it were part of the current conversation

3 problems of this:
1. Context Window pollution: A lot of messages max extend the LLMs context window and even if doesnt, it might polloute it with irrelavent information. 
2. Query performace degradation: Fetching a lot of rows from postgreSQL for every iteration causes latency.
3. Token cost per request: Every LLM call comes at a cost.

Window Memory:
The app uses window memory backed by PostgreSQL. Every message is stored in a conversation_history table with role, content, session_id, and tokens_used. On each request, the last WINDOW_K conversation turns are loaded and injected into the LLM's context.

Tool messages are not saved because each time the tool is called freshly, it ensures current updated data. A lot might have chanegs from the last tool call. It also keeps converstion history cleaner. 
The tradeoffs are that it possibly might have better context with deep understanding if the older tool messages are stored and avoids redundant tool calls. 

Summary Memory: 
Instead of cutting off old messages entirely, we periodically summarize them into a compressed representation and store that summary. When loading context, we load the summary plus the recent window. The LLM gets the gist of the earlier conversation without the full token cost.
It gets triggered when the total number of messages exceeds the legenth of Window_K. 
Summary memory should be cached — generate the summary once, store it in the database, and reuse it on subsequent requests. Only regenerate when new messages have been added beyond the summary boundary. This avoids an expensive LLM call on every request for long conversations.

Semantic memory:
Embed all messages, retrieve most relevant ones to current query.
It is the most sophisticated, most accurate, most expensive. 

I would add summary memory to my app next as its the most reasonable one for an app with the current size of data ( will definitely accomodate more). Since its a financial app, the chances of a user hacing long conversations with the LLm is high.. and summary memory can help in reducing clutetr and over use of memory. 
