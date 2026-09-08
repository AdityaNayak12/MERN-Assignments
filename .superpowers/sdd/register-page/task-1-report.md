# Task 1 report: Registration page

## Changed files

- `client/package.json`
- `client/package-lock.json`
- `client/vite.config.js`
- `client/src/App.jsx`
- `client/src/index.css`
- `client/src/pages/Signup.jsx`
- `client/src/pages/Login.jsx`
- `client/src/registrationValidation.js`
- `client/src/registrationValidation.test.js`

## Implementation summary

- Replaced the Vite starter shell with a responsive Compass registration screen styled with Tailwind CSS.
- Added controlled fields for `fullName`, `email`, `phone`, and `password`.
- Added accessible inline validation with labels, `aria-invalid`, `aria-describedby`, and alert regions.
- Added loading state and API error feedback.
- Sends registration data with Axios to the relative `POST /user/register` endpoint.
- Added a Vite `/user` proxy to `http://localhost:8001` to avoid client CORS ambiguity during development.
- Added a minimal `/login` route target; successful registration navigates there with the existing lightweight history-based route switch.
- Added only `axios`, `tailwindcss`, and `@tailwindcss/vite` as new dependencies.

## Tests and verification

Commands run from `client/`:

```text
node --test src/registrationValidation.test.js
3 tests, 3 passed, 0 failed

npm run lint
exit code 0

npm run build
vite v8.2.2 building client environment for production...
✓ 74 modules transformed.
✓ built in 86ms
exit code 0
```

Browser smoke check against the local Vite server:

- `/register` rendered the registration screen with all four labeled inputs and the submit button.
- Empty submission rendered all four inline required-field messages.
- Invalid email plus a six-character password rendered the expected field-level messages.
- The “Sign in” link navigated to `/login`, which rendered the minimal login target.
- The layout rendered as a two-column desktop page and uses mobile-first Tailwind breakpoints for smaller screens.

## Self-review

- Payload field names match the server controller exactly.
- Password validation matches the server rule of length greater than six.
- No credentials are stored or logged; the password is sent only to the requested registration endpoint.
- Interactive controls are native keyboard-accessible elements with visible focus styles.
- No server features or speculative authentication behavior were added.

## Concerns

- A live successful registration POST was not exercised because it would require a running MongoDB-backed server and would create persistent test data. The Axios path, payload, loading state, API error path, and success navigation are implemented; the pure validation behavior is covered by tests.

## Final verification output

Run from `client/` immediately before commit:

```text
node --test src/registrationValidation.test.js
✔ reports missing registration fields
✔ requires a password longer than six characters
✔ accepts complete registration details
ℹ tests 3
ℹ pass 3
ℹ fail 0

npm run lint
exit code 0

npm run build
vite v8.2.2 building client environment for production...
✓ 74 modules transformed.
✓ built in 85ms
exit code 0
```

## Fix round 1

- Added the existing `client/index.html`, `client/src/main.jsx`, and `client/eslint.config.js` scaffold files unchanged so the committed client is self-contained.
- Added `w-full` to the registration card wrapper so the responsive grid uses the available page width.

Final fix-round commands run from `client/`:

```text
node --test src/registrationValidation.test.js
✔ reports missing registration fields
✔ requires a password longer than six characters
✔ accepts complete registration details
ℹ tests 3
ℹ pass 3
ℹ fail 0

npm run lint
exit code 0

npm run build
vite v8.2.2 building client environment for production...
✓ 74 modules transformed.
✓ built in 87ms
exit code 0
```
