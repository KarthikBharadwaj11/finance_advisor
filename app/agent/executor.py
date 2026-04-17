"""
Raw OpenAI agent loop — no LangChain.

How it works:
  1. Build a messages list: [system, ...chat_history, user]
  2. Call OpenAI with tool schemas attached
  3. If the model returns tool_calls → execute each tool → append results → go to 2
  4. If the model returns plain text → that's the final answer, return it

This loop is the entire "agent" concept. Every framework (LangChain, LlamaIndex, etc.)
is just a wrapper around exactly this logic.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import date

import structlog
from openai import OpenAI

from app.agent.prompts import SYSTEM_PROMPT
from app.agent.tools import ALL_SCHEMAS, TOOL_REGISTRY
from app.config import settings

logger = structlog.get_logger(__name__)


@dataclass
class AgentStep:
    """Records one tool call made during a run — for logging and API response."""
    tool_name: str
    tool_input: dict
    tool_output: str


@dataclass
class AgentResult:
    final_answer: str
    steps: list[AgentStep] = field(default_factory=list)
    total_input_tokens: int = 0
    total_output_tokens: int = 0


def _get_client() -> OpenAI:
    return OpenAI(api_key=settings.OPENAI_API_KEY.get_secret_value())


def run_agent(user_message: str, chat_history: list[dict] | None = None) -> AgentResult:
    """
    Synchronous agent loop. Runs in a thread pool when called from async code.

    chat_history: list of {"role": "user"/"assistant", "content": str} dicts
                  from previous turns in this session.
    """
    client = _get_client()
    system_msg = {"role": "system", "content": SYSTEM_PROMPT.format(current_date=date.today().isoformat())}
    messages: list[dict] = [system_msg, *(chat_history or []), {"role": "user", "content": user_message}]

    result = AgentResult(final_answer="")
    iteration = 0

    while iteration < settings.MAX_AGENT_ITERATIONS:
        iteration += 1
        log = logger.bind(iteration=iteration)

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            messages=messages,
            tools=ALL_SCHEMAS,
            tool_choice="auto",
        )

        usage = response.usage
        if usage:
            result.total_input_tokens += usage.prompt_tokens
            result.total_output_tokens += usage.completion_tokens

        choice = response.choices[0]
        msg = choice.message

        # No tool calls → model produced its final answer
        if not msg.tool_calls:
            result.final_answer = msg.content or ""
            log.info("agent_finished", steps=len(result.steps))
            return result

        # Append the assistant message (with tool_calls) to the conversation
        messages.append(msg.model_dump(exclude_unset=True))

        # Execute each tool call and append the result
        for tc in msg.tool_calls:
            tool_name = tc.function.name
            try:
                tool_args = json.loads(tc.function.arguments)
            except json.JSONDecodeError:
                tool_args = {}

            log.info("tool_call", tool=tool_name, args=tool_args)

            tool_fn = TOOL_REGISTRY.get(tool_name)
            if tool_fn is None:
                tool_output = json.dumps({"error": f"Unknown tool: {tool_name}"})
            else:
                try:
                    tool_output = tool_fn(**tool_args)
                except Exception as exc:
                    tool_output = json.dumps({"error": str(exc)})
                    log.warning("tool_error", tool=tool_name, error=str(exc))

            result.steps.append(AgentStep(
                tool_name=tool_name,
                tool_input=tool_args,
                tool_output=tool_output,
            ))

            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": tool_output,
            })

    # Hit max iterations without a final answer
    result.final_answer = "Analysis incomplete: maximum reasoning steps reached."
    logger.warning("agent_max_iterations_reached", iterations=iteration)
    return result
