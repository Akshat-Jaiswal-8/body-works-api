# Conventional Commits — AI Commit Message Rules

Always generate commit messages that follow the **Conventional Commits v1.0.0** specification.

---

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## Types

| Type       | When to use                                                 |
| ---------- | ----------------------------------------------------------- |
| `feat`     | Introducing a new feature (→ SemVer MINOR)                  |
| `fix`      | Patching a bug (→ SemVer PATCH)                             |
| `docs`     | Documentation changes only                                  |
| `style`    | Formatting, missing semicolons, etc. — no logic change      |
| `refactor` | Code restructuring without fixing a bug or adding a feature |
| `perf`     | Performance improvements                                    |
| `test`     | Adding or correcting tests                                  |
| `build`    | Changes to the build system or dependencies                 |
| `ci`       | Changes to CI/CD configuration or scripts                   |
| `chore`    | Routine tasks, maintenance, tooling updates                 |
| `revert`   | Reverting a previous commit                                 |

---

## Rules

1. **Type is required.** Every commit MUST start with a type followed by a colon and a space: `feat: ...`
2. **Description is required.** A short summary MUST immediately follow `type: ` (or `type(scope): `). Use the imperative mood ("add", "fix", "update" — not "added" or "adding").
3. **Description must be lowercase** and must NOT end with a period.
4. **Scope is optional.** When provided, it MUST be a noun in parentheses describing the affected area: `feat(auth): add OAuth2 support`
5. **Body is optional.** If included, it MUST be separated from the description by one blank line. Use it to explain _what_ and _why_, not _how_.
6. **Footers are optional.** Each footer must be on its own line, one blank line after the body, in the format `Token: value` or `Token #value`.
7. **Breaking changes** MUST be indicated by either:
   - Appending `!` before the colon: `feat!: drop Node 14 support`
   - Adding a `BREAKING CHANGE: <description>` footer
   - Both may be used together.
8. **Keep the subject line under 72 characters.**
9. **Do not use past tense.** Prefer `fix: resolve race condition` over `fix: resolved race condition`.
10. **One concern per commit.** If a change touches multiple unrelated areas, split it into multiple commits.

---

## Examples

```
feat(api): add endpoint for user profile retrieval
```

```
fix(auth): prevent token refresh loop on 401 response
```

```
docs: update README with local setup instructions
```

```
refactor(db): extract query builder into separate module
```

```
feat!: remove support for legacy v1 API

BREAKING CHANGE: all v1 endpoints have been removed. Migrate to v2.
```

```
fix: prevent race condition in request handler

Introduce a request ID and a reference to the latest request.
Dismiss responses from stale requests.

Reviewed-by: Alice
Refs: #204
```

```
revert: let us never again speak of the noodle incident

Refs: 676104e, a215868
```

---

## SemVer Mapping

| Commit type                            | Version bump |
| -------------------------------------- | ------------ |
| `fix`                                  | PATCH        |
| `feat`                                 | MINOR        |
| Any type with `BREAKING CHANGE` or `!` | MAJOR        |

---

## Anti-patterns to Avoid

- ❌ `fixed bug` — missing type, past tense
- ❌ `feat: Added new login page.` — past tense, trailing period
- ❌ `update stuff` — vague, missing type
- ❌ `WIP` — not descriptive
- ❌ `feat: fix typo and add tests and update deps` — multiple unrelated concerns

---
