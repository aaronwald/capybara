# App Requirements — Capybara (Android)

Status: draft for ingestion. Owner: wald. Date: 2026-10-04.
Written per rule R1 in `requirements-repo-rules.md` (ASD-STE100 Simplified Technical English).

The capybara app is an Android task manager. The app sends tasks to agents. The app records what the agents send back.

## A1 Platform

- A1.1 The app runs on Android.
- A1.2 Test the app with the Android simulator.

## A2 Tasks and categories

- A2.1 The app shows a list of tasks in a category.
- A2.2 Each task has an optional due date.

## A3 Prompts

- A3.1 The user sends a task to an agent with a custom prompt.
- A3.2 The user sends a task to an agent with an existing prompt.
- A3.3 The app manages a list of existing prompts. The user can add, edit, and delete prompts in this list.

## A4 Wrapper prompt and return data

- A4.1 When the app sends a task out, the app wraps the task and the prompt in a wrapper prompt.
- A4.2 The wrapper prompt tells the agent to return data in a structured form.
- A4.3 The returned data lets the app update the task that was sent.
- A4.4 The returned data can tell the app to make follow-up tasks. The app makes these follow-up tasks from the returned data.

## A5 Dispatch targets

- A5.1 The app sends tasks to more than one target.
- A5.2 The app sends tasks to hermes.
- A5.3 The app sends tasks to openroute.
- A5.4 The app sends tasks to muse.
- A5.5 These targets are different agents and harnesses.

## A6 Credentials

- A6.1 The app obeys rule R3 in `requirements-repo-rules.md`. The app never stores keys or passwords.

## Open questions

- Q1 Is openroute the same as OpenRouter (openrouter.ai)?
- Q2 Which agent or harness is muse?
- Q3 Is hermes the Hermes Agent harness (a ponytail-supported host)?
- Q4 Which data format does the wrapper prompt return? A JSON schema is one option.
