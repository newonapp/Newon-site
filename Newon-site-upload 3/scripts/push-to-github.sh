#!/usr/bin/env bash
# 저장소 변경분을 한 번에 커밋하고 현재 브랜치로 push 합니다.
# 사용: ./upload-to-github.sh  또는  ./scripts/push-to-github.sh
#       npm run push  또는  npm run upload
#       ./upload-to-github.sh "커밋 메시지"
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "오류: Git 저장소가 아닙니다."
  exit 1
fi

BRANCH="$(git branch --show-current)"
MSG="${1:-Update site $(date -u +%Y-%m-%dT%H:%MZ)}"

echo "→ git add -A"
git add -A

if git diff --cached --quiet; then
  echo "커밋할 변경이 없습니다. (이미 최신이거나 무시된 파일만 있음)"
  exit 0
fi

echo "→ git commit -m \"$MSG\""
git commit -m "$MSG"

echo "→ git push origin $BRANCH"
git push origin "$BRANCH"

echo "완료: origin/$BRANCH 에 올렸습니다."
