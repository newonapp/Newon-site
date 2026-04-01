#!/usr/bin/env bash
# 프로젝트 루트에서 실행: ./scripts/prepare-publish.sh
# 결과물 publish/ 폴더 전체를 호스팅 루트(또는 ZIP)로 올리면 됩니다.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="$ROOT/publish"
rm -rf "$OUT"
mkdir -p "$OUT"

cp index.html styles.css ox-month.css "$OUT/"
[ -f CNAME ] && cp CNAME "$OUT/" || true
[ -f "$ROOT/업로드-체크리스트.txt" ] && cp "$ROOT/업로드-체크리스트.txt" "$OUT/" || true
cp -R assets "$OUT/assets"

cat > "$OUT/UPLOAD.txt" << 'EOF'
Newon 사이트 업로드용 묶음
============================

이 폴더 안의 모든 파일·폴더를 웹 서버의 문서 루트에 그대로 올리세요.

필수 구조 (이름·위치 유지):
  index.html     ← 반드시 루트
  styles.css
  ox-month.css
  assets/        ← 로고·OX 이미지 전부 여기
  CNAME          ← GitHub Pages가 아니면 삭제해도 됨

FTP/다른 호스팅: 이 폴더 내용을 public_html(또는 www)에 업로드.
현재 폴더에 있는 "업로드-체크리스트.txt" 에서 빠진 파일 없는지 확인하세요.

【한 번에 올리기】
  프로젝트 루트에 생기는 newon-site.zip 파일 하나를
  호스팅 파일관리자에서 업로드한 뒤 "압축 풀기" 하세요.
  (풀었을 때 index.html 이 그 폴더에 바로 보여야 합니다.)

소스 수정 후 다시 만들려면 프로젝트 루트에서:
  ./scripts/prepare-publish.sh
EOF

ZIP="$ROOT/newon-site.zip"
rm -f "$ZIP"
(
  cd "$OUT"
  zip -r -q "$ZIP" . -x "*.DS_Store"
)

echo "OK → $OUT"
echo "ZIP → $ZIP (한 파일 업로드 후 압축 해제)"
echo "  $(find "$OUT" -type f | wc -l | tr -d ' ') files inside publish/ (including images)"
