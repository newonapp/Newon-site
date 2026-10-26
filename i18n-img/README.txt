언어별 스크린샷 (선택)
========================

앱 UI가 보이는 이미지를 언어별로 다르게 보이게 하려면,
아래 파일 이름을 그대로 사용해 해당 언어 폴더에 넣으세요.

예:
  i18n-img/en/feature-grid.png     ← 영어 페이지에서 이 파일 사용
  i18n-img/ja/step-add-habit.png  ← 일본어 전용이 있으면 이 파일 사용

폴더 이름은 사이트 경로와 같습니다: ko, en, ja, es, pt-br, fr, de, hi, id

지원하는 파일 이름 (템플릿과 동일해야 함):
  feature-grid.png
  step-add-habit.png
  step-daily-check.png
  hero-promo.png
  step-stats.png

어떤 언어 폴더에도 넣지 않으면, 루트의 기본 PNG(/feature-grid.png 등)가 그대로 쓰입니다.

현재 en/ 폴더에는 영문 UI 스크린샷 5장이 들어 있음 (영어 페이지 전용).
ko/ 폴더에는 한국어 월간 그리드 feature-grid.png 가 있음 (한국어 페이지 전용).

빌드 후 반영:
  node scripts/build-i18n.mjs
