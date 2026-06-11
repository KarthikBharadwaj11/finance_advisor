### Database Architecture

4 major tables:
1. Users table: Consists of details of all users, along with their full name, email ID, password, age, annual income, risk tolerance, crrated at and updated at valued etc.
                All these information is required to give the user suitable suggestions and analyze his portfolio well. USER ID is important to store all the data in out db and it also acts as a foreign key.
                We use hashed password so that its more secure and we never store password as a normal text.
   We use UUID instead of Integer IDs is because UUID is random and cannot be easily guessed. It's more secure.
   
2. Conversations history table: Table consists of ID, User ID, session ID, role, content, tool name, tool call ID, tokens used and created at fields.
                                This table acts as a memory system. every message from the user, AI, or tool gets stored here. The tokens used is to track the number of tokes used per conversation. 
                                There are 3 roles - Human, AI and Tool. Thats maps to the agent loop. 
3. Portfolio table: The portfolio table consists of Portfolio ID, user iD, name, total value and currency. 
4. Portfolio allocations table: This table consists of portfolio ID, assest class, percentage and current value.
In both these tables, we use numeric (15,2) instead of float since float would be inaccurate for money and portfolio values.

We have 3 indices: 
email index - To look up users by email, when they log in
session_id index - we load by session_id while querying a convo
created_at index - used while loading convo history in order

We have 3 major problems memory associated with this, they are:
Context window - Context windows will take up memory if we feed in all information (especially the unwanted ones_ every time.
Query performance - Fetching messages from a large database with millions of rows and columns will take time
Cost - Every token has a cost and the content costs money. Loading more messages means more cost

The solutions for tehse are:
Solution 1. Only load the last 10-20 messages to give the LLM recent contact thats enough to give out a response.
Solution 2: Summary: When a convo reaches a certain limit, summaries the older messages and store them. When a new query comes in, check the summary and recent messages.
Solution 3:  FAISS: Embed all messages in Faiss. When a query comes in, retrieve most relevant past messages using similarity search
