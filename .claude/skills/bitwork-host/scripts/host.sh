#!/usr/bin/env bash
# Helper for the bitwork host (bitwork.dk/host/<app>/ -> Firebase site bitworkhost-<app>).
#
#   host.sh list              list hosted apps (Firebase sites in project bitworkhost)
#   host.sh create <app>      create the Firebase site bitworkhost-<app>
#   host.sh deploy            deploy the current repo (needs firebase.json, built output)
#   host.sh verify <app>      check https://bitwork.dk/host/<app>/ responds
#
# Requires a Google sign-in first: scripts/google-login.sh status|start|code.
set -u
PROJECT=bitworkhost
export GOOGLE_CLOUD_QUOTA_PROJECT="$PROJECT"
FB=(npx -y firebase-tools@latest)
NAME_RE='^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$'

need_name() {
  if [ -z "${1:-}" ] || ! [[ "$1" =~ $NAME_RE ]]; then
    echo "ERROR: app name must be lowercase letters, digits and hyphens (max 40), e.g. 'todo'." >&2
    exit 2
  fi
}

case "${1:-}" in
  list)
    "${FB[@]}" hosting:sites:list --project "$PROJECT" --json 2>/dev/null | python3 -c '
import json, sys
d = json.load(sys.stdin)
if d.get("status") != "success":
    sys.exit("ERROR: " + str(d.get("error")))
r = d["result"]; sites = r.get("sites", r) if isinstance(r, dict) else r
for s in sites or []:
    sid = s["name"].split("/")[-1]
    if sid.startswith("bitworkhost-"):
        app = sid[len("bitworkhost-"):]
        print(f"{app:20} https://bitwork.dk/host/{app}/   (site {sid})")
'
    ;;
  create)
    need_name "${2:-}"
    "${FB[@]}" hosting:sites:create "bitworkhost-$2" --project "$PROJECT" 2>&1 | grep -E "✔|Error|error" | grep -v MOTD
    ;;
  deploy)
    [ -f firebase.json ] || { echo "ERROR: no firebase.json in $(pwd)" >&2; exit 1; }
    "${FB[@]}" deploy --only hosting --project "$PROJECT" 2>&1 | grep -vE "npm notice|MOTD|^\s*$" | tail -6
    ;;
  verify)
    need_name "${2:-}"
    for p in "" "index.html"; do
      curl -sS -o /dev/null -w "%{http_code} %{content_type}  https://bitwork.dk/host/$2/$p\n" "https://bitwork.dk/host/$2/$p"
    done
    ;;
  *)
    sed -n '2,9p' "$0"; exit 2 ;;
esac
