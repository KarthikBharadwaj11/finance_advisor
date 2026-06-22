how tool calling works mechanically and why we require json.loads()?
The LLm cannot create python ibjects, dictionaries or any other programming language data structure. It can only generate text, one token at a time. JSOn is just a text format with strict, parseable syntax. When the LLM "returns arguments", it is generating text that happens to follow JSON syntax rules. The backend then parses the text string into actual python object using Json.loads()

Actual stoppign condition:
The agent loop checks if not msg.tool_calls. If the LLM's response has no tool_calls, it means the LLM produced a final text answer and the loop returns immediately. If tool_calls are present, the loop executes each one and continues. max_iterations is a safety net in case the LLM never naturally reaches a no-tool-call response.

Tool choise options:
"auto" -> LLm decides freely whether to call a tool and which one.
"none" -> LLM is forbidden from calling any tool, must reponse with a text.
"required" -> LLM must call atleast one tool.
{"type": "function", "function": {"name": "specific_tool_name"}}  
           → Forces the LLM to call THIS exact tool

Why tool_call_id matters? 
Every tool result message must be paired with the assistant message that requested it, linked via tool_call_id. This isn't just for the LLM's understanding — the OpenAI API enforces this structure. A tool result without its corresponding request breaks the conversation.

Graceful error handling:
Catching tool errors and feeding them back as a "tool" message allows the LLM to see the failure and adapt — it might try the tool again with different arguments, skip that tool and proceed with available data, or explain to the user that a specific piece of analysis couldn't be completed. This is called graceful degradation. The system continues functioning in a reduced capacity rather than failing completely.


1. Append assistant's tool-call request to messages
2. Execute the tool → get output
3. Append tool result (with tool_call_id) to messages
4. Call LLM again with updated messages
5. Check if not msg.tool_calls → stop or continue
