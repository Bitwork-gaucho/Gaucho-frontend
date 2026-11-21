---
name: google-cloud-login
description: Sign in to the user's Google account so gcloud, gsutil, bq and the Firebase CLI work in a cloud session. Use this before the first Google Cloud or Firebase command whenever the user asks for anything in Google Cloud, GCP, gcloud, Firebase, Cloud Run, Cloud Storage, BigQuery or their Google Cloud / Firebase projects — listing projects, deploying, reading config, billing, logs, and so on.
---

# Google Cloud / Firebase login

Cloud sessions have `gcloud` installed but no Google account signed in, and the
login does not survive the container. This skill signs in through a link the
user opens on any device (phone included) and a code they paste back.

All steps use the helper next to this file:

```
H=.claude/skills/google-cloud-login/login.sh   # path from the repo root
```

## 1. Check whether already signed in

Run `bash $H status`. If it prints `SIGNED_IN <account>`, skip to step 3.

## 2. Sign in

1. Run `bash $H start`. It prints a `https://accounts.google.com/...` link and
   leaves gcloud waiting in the background (for up to 15 minutes).
2. Send the user the full link as a clickable markdown link, and tell them:
   - open it, choose their Google account, and allow access;
   - Google then shows a verification code — copy it and paste it into the chat.
   Mention that the code is single-use, works only with the login waiting in
   this container, and expires within minutes. Then end your turn and wait.
3. When the user replies with the code, run `bash $H code '<CODE>'`.
   - `SIGNED_IN <account>` → continue.
   - An error about an invalid or expired code → run `start` again and send a
     fresh link. Do not reuse the old one.
   - A proxy refusal (403 / `[agent-proxy]` lines naming a host) → report the
     blocked host; do not work around it.

The login also writes Application Default Credentials (`--update-adc`), which
the Firebase CLI and Google client libraries pick up.

## 3. Run commands

**gcloud** — the session exports a placeholder `CLOUDSDK_AUTH_ACCESS_TOKEN`
that overrides the real login, so never call plain `gcloud`. Use either:

```
bash $H gcloud projects list
env -u CLOUDSDK_AUTH_ACCESS_TOKEN gcloud projects list
```

`gsutil` and `bq` need the same `env -u CLOUDSDK_AUTH_ACCESS_TOKEN` prefix.

**Firebase CLI** — not preinstalled; run it with npx. It uses the Application
Default Credentials from the login:

```
npx -y firebase-tools@latest projects:list
```

If a Firebase or Google API call fails with a message about a missing **quota
project**, set one of the user's projects (ask which if unclear):

```
env -u CLOUDSDK_AUTH_ACCESS_TOKEN gcloud auth application-default set-quota-project <PROJECT_ID>
```

If the Firebase CLI still reports it is not logged in, fall back to its own
login: `npx -y firebase-tools@latest login --no-localhost`, which likewise
prints a link and asks for a code.

## Rules

- Ask before anything that changes or costs something (deploys, deletes,
  enabling APIs or billing, IAM changes). Listing and reading are fine.
- Never print or store access tokens, refresh tokens or credential files, and
  never commit anything from `~/.config/gcloud`.
- The login lasts only for this container. A new session starts at step 1.
