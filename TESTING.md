# Testing Plan — Dandelionz

Handoff notes for picking up testing work. Covers all three repos:

- `Dandelionz` — Django API (branch `fixes`)
- `Dandelionz_App` — Next.js web (branch `api`)
- `Dandelionz_Mobile` — Expo/React Native (branch `fix2`)

## Honest framing

No test suite makes you "100% sure before shipping" — that isn't achievable, and
anything promising it is lying. Tests catch *deterministic* bugs: logic errors,
broken flows, regressions. They do not reliably catch intermittent,
network-dependent, or device-specific failures.

Concretely: the `TypeError: Network request failed` on product publish that
started this work would **not** have been caught by any of the tests below. It is
intermittent and unreproducible on demand. That is what the Sentry instrumentation
is for. Tests and crash reporting are complementary, not alternatives.

What tests *would* have caught: the `/user/customer/profile/` 403 and the
`/user/admin/products/` 403. Both are "wrong role hits wrong endpoint" — pure
contract bugs, trivially catchable, and they cost days of guesswork.

## Current state (verified 2026-07-17)

| Repo | Test infra | Reality |
|---|---|---|
| Django API | test files exist, no runner config | 53 test fns across 7 files — **some may never run** (see below) |
| Next.js web | none | no jest/vitest/playwright/cypress, no `test` script |
| Expo mobile | none | no jest, no test script, no test files |

### Two blockers to fix before writing a single new backend test

**1. `users/tests.py` and `users/tests/` both exist.**

Python resolves `users.tests` to the *module* (`users/tests.py`), not the
directory — confirmed via `importlib.util.find_spec`, which reports
`is package: False`. `users/tests/` has no `__init__.py`. So
`users/tests/test_withdrawal_flow.py` (534 lines, **20 test functions**) is almost
certainly never discovered or run.

Fix: pick one layout. Either move `users/tests.py` into `users/tests/test_*.py`
and add `__init__.py`, or move `test_withdrawal_flow.py` up to
`users/test_withdrawal_flow.py` and delete the directory. Then confirm the count
of collected tests goes **up**.

**2. Django won't boot without env config.**

`django.setup()` fails with `TypeError: int() argument must be ... not 'NoneType'`
— something reads an env var and casts it. This blocks any CI run. Needs a test
settings module or a committed `.env.test` with safe defaults.

Verify both are fixed with:

```bash
cd Dandelionz
python manage.py test --verbosity=2      # count should include the 20 withdrawal tests
```

## Recommended order

### 1. Get the backend tests running (highest value, cheapest)

You already have 53 test functions. Making them actually run — and adding
`pytest` + `pytest-django` so they run in CI — is more valuable than writing
anything new. Start here. Do not write new tests until the existing ones execute.

### 2. Role × endpoint contract tests

The bug class that actually bit you. Table-driven, fast, no device:

```python
# for each (role, endpoint) -> expected status
CASES = [
    ("CUSTOMER",       "/user/customer/profile/", 200),
    ("BUSINESS_ADMIN", "/user/customer/profile/", 403),   # would have caught the 403
    ("VENDOR",         "/user/customer/profile/", 403),
    ("BUSINESS_ADMIN", "/user/admin/products/",   200),
    ("VENDOR",         "/user/admin/products/",   403),   # would have caught the other
]
```

This is the single highest-leverage suite for this codebase. Roles are
`ADMIN`, `BUSINESS_ADMIN`, `VENDOR`, `CUSTOMER`, `DELIVERY_AGENT`
(`authentication/models.py:37-42`).

### 3. Unit tests for the shared error helpers

Pure functions, no device, no network — cheapest possible tests. Two already have
verified cases written; port them from the work done in this session:

- **`apiError`** (exists in *both* `Dandelionz_Mobile/lib/utils.ts` and
  `Dandelionz_App/lib/utils.ts`). Cases that must pass:
  - `{status:"FETCH_ERROR", error:"TypeError: Network request failed"}` →
    `"Network error. Check your connection and try again."` (regression guard: this
    branch was unreachable before — the raw `TypeError` leaked to users)
  - `{status:400, data:{error:{name:["category with this name already exists."]}}}` →
    `"Name: category with this name already exists."` (must **flatten** the dict —
    returning the object throws "Objects are not valid as a React child")
  - Must return a `string` for every input, including `undefined`.
- **The `baseApi` mutex** (`Dandelionz_Mobile/lib/api/baseApi.ts`). The regression
  test: lock, park 3 waiters, unlock, assert **all 3** resolve. The old
  single-resolver version woke only the last one and hung the rest forever.

Suggested tooling: `jest-expo` for mobile, `vitest` for web (fast, minimal config
with Next.js).

### 4. Maestro E2E (see below)

### 5. Staged rollout

Play Console **internal testing track** + Sentry. This catches what tests can't.
Given the bug that started this, arguably worth more than #4.

## Maestro

**Is it free?** The **Maestro CLI is free and open source (Apache 2.0)** — run it
locally against an emulator, simulator, or a real device over USB/wifi, no account,
no limits. That's the part you'd start with.

**Maestro Cloud** (the hosted product from mobile.dev, for running flows on real
devices in CI) is a **separate commercial product**. It has historically offered a
free tier. Pricing and tier structure change — check
<https://www.mobile.dev/> for current terms rather than trusting this note.

**Why Maestro over the alternatives, for this project:**

- Works against your **release build** — Detox needs a special test build, which
  matters because your bugs show up in production APKs.
- Handles Expo without ejecting or prebuilding.
- Flows are YAML, not code. Low barrier.
- Tolerant of timing/flakiness by design (built-in waits), which is the usual
  reason RN E2E suites get abandoned.

**Skip Detox** for now — gray-box, faster than Appium, but real setup cost and it
fights Expo. **Skip Appium** unless you need cross-platform black-box.

First two flows worth writing (they cover your actual bug classes):

```yaml
# .maestro/login-roles.yaml
appId: com.dandelionz
---
- launchApp: { clearState: true }
- tapOn: "Login"
- tapOn: { id: "email" }
- inputText: "admin@example.com"
- tapOn: { id: "password" }
- inputText: "<password>"
- tapOn: "Sign In"
- assertVisible: "Dashboard"        # BUSINESS_ADMIN must land on /admin
```

Second: publish a product end-to-end (vendor), since that's the flow that breaks.

Run with `maestro test .maestro/`. App id is `com.dandelionz`.

## Device notes (for whoever picks this up)

- Test device: TECNO KI5q, Android 13, USB debugging works (`adb devices`).
- **The device has a "Dual Space" profile (user 999) running.** `adb shell` commands
  default to user 999 and fail with `SecurityException: Shell does not have
  permission to access user 999`. Always pass `--user 0`:
  `adb shell pm list packages --user 0`.
- Logcat is extremely noisy on this device — the sensor HAL
  (`android.hardware.sensors@2.0-service.multihal-mediatek`) writes ~50 lines/sec
  and flooded a full capture (6.9 MB in 5 min, adb exited 255). Filter by app PID:
  `adb logcat --pid=$(adb shell pidof com.dandelionz)`.
- Release builds still log `console.log` to logcat under `ReactNativeJS` —
  `babel.config.js` has no `transform-remove-console`.
- Android 13 supports wireless debugging (Developer options → Wireless debugging →
  pair with code), so a cable isn't required.

## Open threads

- **The `TypeError: Network request failed` on publish is still unexplained.** It is
  intermittent and currently not reproducing. Sentry is now instrumented to capture
  it (`lib/observability.ts` + `lib/api/sentryErrorMiddleware.ts`), with HTTP
  breadcrumbs and a mobile replay (`replaysOnErrorSampleRate: 1.0`). **This
  instrumentation is not on any installed build yet — it needs an
  `eas build --profile production` + reinstall to be live.** Until then the phone
  reports nothing.
- The mutex deadlock that was fixed produces a *hang*, not that error — it was a
  real bug but is not the explanation.
- Web: 4 product pages have `apiError` conversions interleaved with an in-progress
  category refactor, left uncommitted deliberately.
- Deliberately not done: tokens live in **unencrypted AsyncStorage** (key `"auth"`,
  written by a store subscriber in `app/_layout.tsx:273-289`). `expo-secure-store`
  is a dependency and there is vestigial dead code writing `access_token` to it
  (`lib/api/baseApi.ts`, never read back). Moving tokens to SecureStore needs a
  migration or every user gets logged out on update.
- `apiError` does not read DRF's `detail` key. Adding it would surface DRF's
  built-in messages ("Authentication credentials were not provided.",
  `Method "POST" not allowed.`) to end users — deliberately skipped. The API is
  inconsistent: `message` 206 uses, `error` 44, `detail` 23.
