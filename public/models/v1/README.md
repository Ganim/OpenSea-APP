# face-api.js Models — v1

Source: `@vladmandic/face-api@1.7.15` — `node_modules/@vladmandic/face-api/model/`.

Weight naming convention: single `.bin` per model (not sharded). The companion
`_manifest.json` points at that `.bin` file via its `paths` field.

Committed files:

- `tiny_face_detector_model.bin` + `tiny_face_detector_model-weights_manifest.json`
- `face_landmark_68_model.bin` + `face_landmark_68_model-weights_manifest.json`
- `face_recognition_model.bin` + `face_recognition_model-weights_manifest.json`

Total size: ~6 MB. Served as static assets under `/models/v1/` by Next.js.
The service worker (kiosk plan 05-10) will cache these paths as cache-first.

## Why committed to the repo (not downloaded at build time)

Per `05-RESEARCH.md` §A6 (assumptions): deploy simplicity. No runtime dependency
on the npm package for the models themselves. Git integrity guarantees no tampering.

## Bumping versions

1. Upgrade `@vladmandic/face-api` in `package.json`.
2. Copy new weights to `public/models/v2/` (do NOT overwrite v1).
3. Update `src/lib/face-api/load-models.ts` default `baseUrl` to `'/models/v2'`.
4. Service-worker cache name bumps automatically via the versioned path.
5. Delete `public/models/v1/` in a follow-up cleanup commit once the new SW
   has rolled out to all clients.

## Model purposes

- **Tiny Face Detector** — fast, low-resource face localization (input size 320).
- **Face Landmark 68** — 68-point landmarks used for blink / liveness (EAR).
- **Face Recognition** — 128-d descriptor used for face match.

Additional models shipped by `@vladmandic/face-api` (age/gender, expression,
SSD MobileNet v1, tiny landmarks) are intentionally NOT committed — phase 5
does not use them.
