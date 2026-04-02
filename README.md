# Newon 웹사이트

저장소 **루트가 곧 배포 루트**입니다. `index.html` 기준 **상대 경로**로 `styles.css`, `ox-month.css`, 루트의 `*.png`(로고·스크린샷)를 불러옵니다. GitHub Pages **프로젝트 페이지**(`*.github.io/저장소명/`)와 **커스텀 도메인** 루트 모두에서 동일하게 동작합니다.

## 저장소 구조 (GitHub에 올리는 그대로)

```text
.
├── index.html
├── styles.css
├── ox-month.css
├── CNAME
├── .nojekyll
├── logo.png
├── ox-month-logo.png
├── feature-grid.png
├── hero-promo.png
├── step-add-habit.png
├── step-daily-check.png
├── step-stats.png
├── .github/workflows/github-pages.yml
└── … (README, .gitignore, 업로드-체크리스트.txt 등 메타)
```

## 1. GitHub에 올리기

```bash
cd Newon
git add index.html styles.css ox-month.css \
  logo.png ox-month-logo.png feature-grid.png hero-promo.png \
  step-add-habit.png step-daily-check.png step-stats.png \
  CNAME .nojekyll .github .gitignore README.md 업로드-체크리스트.txt
# 선택: netlify.toml vercel.json
git commit -m "Deploy site"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## 2. GitHub Pages (Actions)

1. 저장소 **Settings → Pages**  
2. **Source**: **GitHub Actions**  
3. `main` 푸시 시 워크플로가 `index.html`, CSS, **위 PNG 목록**을 Pages에 배포합니다.

## 3. 도메인 (newon.app)

**Settings → Pages → Custom domain** 에 `newon.app` 입력. DNS A 레코드는 [GitHub 문서](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) 참고.

## 4. 워크플로가 올리는 것

- `index.html`, `styles.css`, `ox-month.css`
- `logo.png`, `ox-month-logo.png`, `feature-grid.png`, `hero-promo.png`, `step-add-habit.png`, `step-daily-check.png`, `step-stats.png`
- `CNAME`

`netlify.toml`, `vercel.json` 은 워크플로 아티팩트에 포함하지 않습니다.

빠짐 방지: **`업로드-체크리스트.txt`** 참고.
