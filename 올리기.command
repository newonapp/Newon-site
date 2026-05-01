#!/bin/bash
# Finder에서 이 파일을 더블클릭 → 터미널이 열리며 GitHub로 한 번에 올림
# (명령을 한 줄로 붙여 넣을 필요 없음)
set -e
cd "$(dirname "$0")"
echo ""
echo "=============================================="
echo "  Newon 저장소: add → commit → push"
echo "=============================================="
BRANCH=$(git branch --show-current)
echo "브랜치: $BRANCH"
echo ""

git add -A
if git diff --cached --quiet; then
  echo "→ 커밋할 변경 없음. 바로 push 만 시도합니다."
else
  git commit -m "Site update $(date -u +%Y-%m-%dT%H:%MZ)"
  echo "→ 커밋 완료"
fi

echo "→ git push origin $BRANCH"
git push origin "$BRANCH"
echo ""
echo "✓ 완료"
echo ""
read -r -p "창을 닫으려면 Enter 키..."
