# Repository Rules — Capybara

Status: draft for ingestion. Owner: wald. Date: 2026-10-04.

These rules apply to all work in the capybara repository.

## R1 Specification language

- R1.1 Write all specifications in ASD-STE100 Simplified Technical English.
- R1.2 Keep each sentence short. Use the active voice. Put one instruction in each sentence.

## R2 Adversarial review before release

- R2.1 Run an adversarial review before each release. No release skips this step.
- R2.2 Use the ponytail skill for the review (https://github.com/DietrichGebert/ponytail). In pi, install it with `pi install git:github.com/DietrichGebert/ponytail`. The review command is `/ponytail-review`. It reviews the current diff for over-engineering. It hands back a delete-list.
- R2.3 Use OpenAI Astra for the reviews.

## R3 Credentials

- R3.1 Never store keys or passwords. This rule applies to the repository, to code, and to configuration files.
- R3.2 Always use the latest SDKs to manage keys and passwords.

## Open questions

- Q1 OpenAI Astra: which product is "Astra"? Confirm the exact model, agent, and API before the first review.
