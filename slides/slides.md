---
marp: true
theme: workshop
paginate: true
---

<!-- _class: title -->
<!-- _paginate: false -->

# Build a Simple Agent — No Frameworks

<div class="subtitle">AI Collective Workshop</div>

---

<!-- _class: center -->

# We all use agents.

## But how do they actually work?

---

<!-- _class: center -->
<!-- _paginate: false -->

# Demo.

---

<!-- _class: center -->

# Model. System prompt. Tools.

## In a loop.

---

# Setup

```bash
./setup.sh
```

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 1</div>

# The agentic loop

---

<!-- _class: diff -->

<div class="caption">src/index.ts</div>

![](../diff-images/baseline/src_index.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/llm.ts</div>

![](../diff-images/baseline/src_llm.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/cli.ts</div>

![](../diff-images/baseline/src_cli.ts.png)

---

<!-- _class: diff -->

<div class="caption">package.json</div>

![](../diff-images/baseline/package.json.png)

---

<!-- _class: center -->

# Break it.

> "Tell it your name. Then ask what your name is."

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# LLMs are stateless

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 2</div>

# Conversation history

---

<!-- _class: replay -->

## It works now.

```
> Hey I'm Steven
> What's my name?
Your name is Steven.
```

---

<!-- _class: diff -->

<div class="caption">src/index.ts</div>

![](../diff-images/L1-to-L2/src_index.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/llm.ts</div>

![](../diff-images/L1-to-L2/src_llm.ts.png)

---

<!-- _class: center -->

# Break it.

> "Ask it what today's date is."

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# No concept of time

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 3</div>

# First tool — get_current_date_time

---

<!-- _class: replay -->

## It works now.

```
> What's today's date?
Today is May 16, 2026.
```

---

<!-- _class: diff -->

<div class="caption">src/index.ts</div>

![](../diff-images/L2-to-L3/src_index.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/llm.ts</div>

![](../diff-images/L2-to-L3/src_llm.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/tools.ts</div>

![](../diff-images/L2-to-L3/src_tools.ts.png)

---

<!-- _class: center -->

# Break it.

> "How do you know it actually called the tool — vs. made it up?"

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# Agent is a black box

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 4</div>

# Observability

---

<!-- _class: diff -->

<div class="caption">src/llm.ts</div>

![](../diff-images/L3-to-L4/src_llm.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/conversation.ts</div>

![](../diff-images/L3-to-L4/src_conversation.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/logger.ts</div>

![](../diff-images/L3-to-L4/src_logger.ts.png)

---

<!-- _class: center -->

# Break it.

> "Find a prompt where the log surprises you."

---

<!-- _class: diff -->

<div class="caption">The agentic loop</div>

![](../docs/agentic-loop-explained.png)

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# Useful tools

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 5</div>

# External API integration

---

<!-- _class: diff -->

<div class="caption">src/index.ts</div>

![](../diff-images/L4-to-L5/src_index.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/tools.ts</div>

![](../diff-images/L4-to-L5/src_tools.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/giphyClient.ts</div>

![](../diff-images/L4-to-L5/src_giphyClient.ts.png)

---

<!-- _class: diff -->

<div class="caption">.env.example</div>

![](../diff-images/L4-to-L5/.env.example.png)

---

<!-- _class: center -->

# Break it.

> "Ask it about AI Collective."

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# No guardrails or role

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 6</div>

# The system prompt is the product

---

<!-- _class: replay -->

## It stays in scope now.

```
> Tell me about AI Collective
I help with gifs and quotes — not company info.
```

---

<!-- _class: diff -->

<div class="caption">src/llm.ts</div>

![](../diff-images/L5-to-L6/src_llm.ts.png)

---

<!-- _class: diff -->

<div class="caption">prompt.md</div>

![](../diff-images/L5-to-L6/prompt.md.png)

---

<!-- _class: center -->

# Break it.

> "Try to jailbreak the system prompt."

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# More tools

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 7</div>

# Adding another tool

---

<!-- _class: diff -->

<div class="caption">src/tools.ts</div>

![](../diff-images/L6-to-L7/src_tools.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/quoteClient.ts</div>

![](../diff-images/L6-to-L7/src_quoteClient.ts.png)

---

<!-- _class: center -->

# Break it.

> "Ask for a quote AND a gif in one message."

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# No way to execute tools in parallel

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 8</div>

# Parallel tool calls

---

<!-- _class: replay -->

## It works now.

```
> give me a quote and a gif
[quote] [gif]
```

---

<!-- _class: diff -->

<div class="caption">src/index.ts</div>

![](../diff-images/L7-to-L8/src_index.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/llm.ts</div>

![](../diff-images/L7-to-L8/src_llm.ts.png)

---

<!-- _class: center -->

# Break it.

> "Ask for 3 gifs in one prompt. What order do they come back?"

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# MCP integration

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 9</div>

# MCP — discover tools at runtime

---

<!-- _class: diff -->

<div class="caption">src/index.ts</div>

![](../diff-images/L8-to-L9/src_index.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/llm.ts</div>

![](../diff-images/L8-to-L9/src_llm.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/tools.ts</div>

![](../diff-images/L8-to-L9/src_tools.ts.png)

---

<!-- _class: diff -->

<div class="caption">src/mcpClient.ts</div>

![](../diff-images/L8-to-L9/src_mcpClient.ts.png)

---

<!-- _class: diff -->

<div class="caption">prompt.md</div>

![](../diff-images/L8-to-L9/prompt.md.png)

---

<!-- _class: diff -->

<div class="caption">package.json</div>

![](../diff-images/L8-to-L9/package.json.png)

---

<!-- _class: center -->

# Break it.

> "Call an MCP-provided tool and trace it through the logs."

---

<!-- _class: diff -->

<div class="caption">Architecture</div>

![](assets/architecture.png)

---

<!-- _class: missing -->

<div class="label">What's missing?</div>

# Reliability

---

<!-- _class: lesson-title -->

<div class="lesson-num">Lesson 10</div>

# Evals — measure what the agent actually does

---

<!-- _class: diff -->

<div class="caption">promptfoo/promptfooconfig.yaml</div>

![](../diff-images/L9-to-L10/promptfoo_promptfooconfig.yaml.png)

---

<!-- _class: diff -->

<div class="caption">promptfoo/prompts/agent.cjs</div>

![](../diff-images/L9-to-L10/promptfoo_prompts_agent.cjs.png)

---

<!-- _class: diff -->

<div class="caption">promptfoo/judges/qwen.yaml</div>

![](../diff-images/L9-to-L10/promptfoo_judges_qwen.yaml.png)

---

<!-- _class: diff -->

<div class="caption">promptfoo/README.md</div>

![](../diff-images/L9-to-L10/promptfoo_README.md.png)

<!-- _class: center -->

# The loop IS the agent.

---

# Scaffolding

**Core** — loop · history · system prompt · tools

**Trust** — observability · evals

**Reach** — external APIs · MCP

---

# Where next

- Production: cost, latency, retries, streaming
- Agents as tools
- Eval-driven agent development
- Frameworks — now you know what they abstract

---

<!-- _class: center -->

# Questions?

[github.com/stevendiamante/simple-agent-demo](https://github.com/stevendiamante/simple-agent-demo)
steven@diamantetechcoaching.com
