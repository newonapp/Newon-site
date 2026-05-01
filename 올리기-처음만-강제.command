#!/bin/bash
# GitHub와 처음 연결할 때 "unrelated histories" 때문에 push 안 될 때만 사용.
# 원격 main 을 이 맥 내용으로 덮습니다. (원격에만 있던 옛 파일 기록은 사라질 수 있음)
set -e
cd "$(dirname "$0")"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  강제 push (--force-with-lease)"
echo "  계속하려면 y 입력 후 Enter"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -r ok
if [[ ! "$ok" =~ ^[yY]$ ]]; then
  echo "취소했습니다."
  read -r -p "Enter 로 종료..."
  exit 0
fi
BRANCH=$(git branch --show-current)
git push --force-with-lease origin "$BRANCH"
echo "✓ 완료"
read -r -p "Enter 로 종료..."
