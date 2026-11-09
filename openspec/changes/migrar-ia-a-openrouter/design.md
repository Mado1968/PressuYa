# Design

## Context

See [proposal.md](./proposal.md) for the motivation. The current IA module uses
the OpenAI SDK and Responses API in three server-side operations. The selected
OpenRouter model exposes Chat Completions and does not advertise native
structured-output support. Existing Zod schemas define the accepted shapes.

## Goals / Non-Goals

**Goals:**

- Reuse the installed `openai` SDK against OpenRouter's compatible endpoint.
- Preserve server-only access and reject invalid model output at the Zod
  boundary.
- Keep provider configuration and defaults consistent between the app, smoke
  test, and environment documentation.

**Non-Goals:**

- Add a provider abstraction or support multiple providers simultaneously.
- Add retries, response healing, or a new dependency.
- Change IA prompts' business behavior or send existing customer data for
  migration.

## Decisions

- **Use Chat Completions for all three IA operations.** The selected model's
  OpenRouter endpoint advertises Chat Completions; the application sends prior
  system instructions as a system message and task input as a user message.
  Responses API is not used because the model page does not confirm that API
  for this model.
- **Request JSON in the system prompt and validate locally.** Include each
  operation's Zod-generated JSON Schema in its instructions, parse the returned
  content as JSON, then validate it with the same Zod schema before proceeding.
  This was chosen over `response_format` because the selected endpoint does not
  advertise structured-output support. Invalid JSON gets the existing explicit
  no-structure error; schema mismatches remain Zod validation errors.
- **Use one cached SDK client with explicit configuration.** Pass
  `OPENROUTER_API_KEY` and `OPENROUTER_BASE_URL` when constructing the OpenAI
  SDK client. Keep model selection in `OPENROUTER_MODEL`, so the smoke script
  and app use the same defaults and overrides.
- **Do not translate `OPENAI_EFFORT`.** The previous knob was coupled to the
  OpenAI Responses API. The new implementation omits it rather than sending an
  unverified provider-specific parameter.

## Risks / Trade-offs

- [The model may return malformed or schema-invalid JSON because output
  enforcement is prompt-based] → Validate every response with Zod, fail
  explicitly, and retain the existing fallback for follow-up messages.
- [OpenRouter endpoint or model capabilities may change] → The smoke script
  exercises the configured model and validates a real JSON response; rerun it
  after provider or model changes.
- [Provider keys are environment-specific] → Keep `.env.example` blank for the
  key, keep `.env.local` ignored, and configure the three variables separately
  in each deployment environment.

## Migration Plan

1. Replace the old environment variable names with `OPENROUTER_*` in local
   configuration and deployment settings.
2. Deploy the application with the new variables and run `npm run humo`.
3. If rollback is needed, restore the previous application revision and its
   OpenAI environment variables; no database migration is involved.
