#!/usr/bin/env bash
# GitHub(newonapp/Newon-site)와 로컬이 "관련 없는 히스토리"일 때 — 로컬 내용으로 원격 main을 맞춥니다.
# 터미널에는 아래 두 줄을 각각 입력하고 Enter (한 줄에 붙이지 마세요)
#
#   cd /Users/kyungnawon/Newon
#   ./first-time-push.sh
#
set -euo pipefail
cd "$(dirname "$0")"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Git 저장소가 아닙니다."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GitHub의 main을 이 맥에 있는 코드로 덮어씁니다."
echo "  (원격에만 있던 예전 업로드 기록은 사라질 수 있습니다)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -r -p "계속하려면 y 입력 후 Enter: " ok
if [[ ! "$ok" =~ ^[yY]$ ]]; then
  echo "취소했습니다."
  exit 0
fi

echo ""
echo "→ git push --force-with-lease origin main"
git push --force-with-lease origin main

echo ""
echo "완료. GitHub → Actions 에서 배포가 돌았는지 확인하세요."
