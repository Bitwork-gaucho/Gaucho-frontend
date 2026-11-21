#!/usr/bin/env bash
# Sign gcloud (and, through Application Default Credentials, the Firebase CLI)
# in to the user's Google account from a cloud session with no browser.
#
#   login.sh status        -> "SIGNED_IN <account>" or "SIGNED_OUT"
#   login.sh start         -> starts the login and prints the sign-in link
#   login.sh code <CODE>   -> finishes the login with the code Google showed
#   login.sh gcloud ARGS   -> runs gcloud with the session's placeholder token removed
#
# Cloud sessions export CLOUDSDK_AUTH_ACCESS_TOKEN=proxy-..., which overrides any
# real login, so every gcloud call here runs with that variable removed.
set -u

STATE="${GCLOUD_LOGIN_DIR:-/tmp/gcloud-login}"
mkdir -p "$STATE"

gc() { env -u CLOUDSDK_AUTH_ACCESS_TOKEN gcloud "$@"; }

active_account() {
  gc auth list --filter=status:ACTIVE --format='value(account)' 2>/dev/null
}

case "${1:-}" in
  status)
    acct="$(active_account)"
    if [ -n "$acct" ]; then echo "SIGNED_IN $acct"; else echo "SIGNED_OUT"; fi
    ;;

  start)
    pkill -f "gcloud.py auth login" 2>/dev/null
    rm -f "$STATE/code" "$STATE/log" "$STATE/done"
    # gcloud reads the code from stdin. The process substitution keeps stdin
    # open until `login.sh code` writes the code file. Gives up after 15 min.
    nohup setsid bash -c '
      timeout 900 env -u CLOUDSDK_AUTH_ACCESS_TOKEN \
        gcloud auth login --no-launch-browser --update-adc \
        < <(until [ -s "$0/code" ]; do sleep 1; done; cat "$0/code") \
        > "$0/log" 2>&1
      echo $? > "$0/done"
    ' "$STATE" >/dev/null 2>&1 &
    for _ in $(seq 30); do
      grep -q "https://accounts.google.com" "$STATE/log" 2>/dev/null && break
      sleep 1
    done
    link="$(grep -o 'https://accounts.google.com[^[:space:]]*' "$STATE/log" 2>/dev/null | head -1)"
    if [ -z "$link" ]; then
      echo "ERROR: no sign-in link appeared. gcloud output:" >&2
      cat "$STATE/log" >&2 2>/dev/null
      exit 1
    fi
    echo "$link"
    ;;

  code)
    if [ -z "${2:-}" ]; then echo "usage: login.sh code <CODE>" >&2; exit 2; fi
    if ! pgrep -f "gcloud.py auth login" >/dev/null; then
      echo "ERROR: no login is waiting. Run 'login.sh start' first." >&2; exit 1
    fi
    printf '%s\n' "$2" > "$STATE/code"
    for _ in $(seq 60); do [ -f "$STATE/done" ] && break; sleep 1; done
    rm -f "$STATE/code"
    if [ "$(cat "$STATE/done" 2>/dev/null)" = "0" ]; then
      echo "SIGNED_IN $(active_account)"
    else
      echo "ERROR: login did not complete. gcloud output:" >&2
      tail -20 "$STATE/log" >&2
      exit 1
    fi
    ;;

  gcloud)
    shift
    gc "$@"
    ;;

  *)
    sed -n '2,10p' "$0"
    exit 2
    ;;
esac
