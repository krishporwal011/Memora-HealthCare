# Rule 05: Simple enough for one person
- Prefer boring, documented tech already in AGENTS.md section 4. Managed services over self-hosting.
- No Redis, queues, microservices, Kubernetes, or new ORMs without a written reason in the brief.
- Every function has a test when it touches adaptive, anomaly, consent, sync, or LLM validation.
- Explain non-obvious code with a short comment; the developer must be able to defend it in front of judges.
