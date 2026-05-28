#!/bin/bash
# Finder 더블클릭 → 업로드용 zip 생성
set -e
cd "$(dirname "$0")"
echo ""
echo "=============================================="
echo "  Newon-site-upload.zip 만들기"
echo "=============================================="
echo ""
npm run 묶기
echo ""
read -r -p "끝. 창을 닫으려면 Enter..."
