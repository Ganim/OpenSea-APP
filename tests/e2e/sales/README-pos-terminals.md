# E2E pos-terminals setup

These specs cover the Emporion WS Plan 02 flows on `/devices/pos-terminals`:

- `pos-terminals-realtime.spec.ts` — verifies the listing reacts to a
  `terminal.synced` event emitted by the backend after a device hits
  `POST /v1/pos/sync/notify`.
- `pos-terminals-revoke-flow.spec.ts` — exercises the revoke flow 4b:
  no-session happy path + 409 force fallback (open POS session).

## Prereqs

- Backend (`OpenSea-API`) with Plan 01 deployed and running on
  `API_URL` (default `http://127.0.0.1:3333`).
- Seeded admin: `admin@teste.com` / `Teste@123` belonging to the
  "Empresa Demo" tenant.
- The admin user has an Action PIN set (`E2E_ADMIN_PIN`).

## Required env vars

| Variable                       | Used by       | Description                                              |
| ------------------------------ | ------------- | -------------------------------------------------------- |
| `E2E_DEVICE_TOKEN`             | realtime spec | Bearer device token for a pre-paired POS terminal.       |
| `E2E_TERMINAL_NO_SESSION_ID`   | revoke spec   | Id of a paired terminal **without** an open POS session. |
| `E2E_TERMINAL_OPEN_SESSION_ID` | revoke spec   | Id of a paired terminal **with** an open POS session.    |
| `E2E_ADMIN_PIN`                | revoke spec   | Admin Action PIN (default `1234`).                       |
| `API_URL`                      | both          | Backend base URL (default `http://127.0.0.1:3333`).      |

## How to seed

1. Start backend: `cd OpenSea-API && npm run dev`
2. Seed db: `npx prisma db seed`
3. Pair a test terminal via the admin UI (`/devices/pos-terminals` →
   "Parear Este Dispositivo") and copy the `pos_device_token` from
   localStorage.
4. Open another terminal session and start an open POS session for a
   second terminal.
5. Export ids/tokens, e.g. on PowerShell:

   ```pwsh
   $env:E2E_DEVICE_TOKEN="<token>"
   $env:E2E_TERMINAL_NO_SESSION_ID="<terminal-id>"
   $env:E2E_TERMINAL_OPEN_SESSION_ID="<terminal-id>"
   $env:E2E_ADMIN_PIN="1234"
   ```

## Run

```bash
npm run test:e2e -- tests/e2e/sales/pos-terminals-realtime.spec.ts \
                    tests/e2e/sales/pos-terminals-revoke-flow.spec.ts
```

The specs `test.skip()` themselves when their required env vars are
missing — CI without seeded fixtures will report them as skipped, not
failed.
