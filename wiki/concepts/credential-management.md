---
type: concept
sources: [requirements-repo-rules, requirements-app]
created: 2026-10-04
updated: 2026-10-06
---

# Credential management

Rule R3 in [[requirements-repo-rules]], obeyed by the app too (A6 in [[requirements-app]]): never store keys or passwords — not in the repository, code, or configuration files; always use the latest SDKs to manage them.

**Resolved on Android (2026-10-06, wald: "use defaults"):** the user pastes the OpenRouter key in the app's Settings screen; the app holds it in Android Keystore-backed EncryptedSharedPreferences (`androidx.security:security-crypto`), per [[mvp-implementation]]. No key ever lands in repo or config files.

## Related
- [[requirements-repo-rules]], [[requirements-app]], [[capybara]]
