# Newon 웹사이트

저장소 **루트가 곧 배포 루트**입니다. `index.html` 기준 **상대 경로**로 `styles.css`, `ox-month.css`, 루트의 `*.png`(로고·스크린샷)를 불러옵니다. GitHub Pages **프로젝트 페이지**(`*.github.io/저장소명/`)와 **커스텀 도메인** 루트 모두에서 동일하게 동작합니다.

## 배포에 실제로 올라가는 것 (`npm run publish` → `_publish/`)

GitHub **수동 업로드**를 할 때는 `_publish` **안의 전부**(아래 폴더 포함)를 저장소 루트에 두면 됩니다. 루트 HTML·PNG만으로는 다국어 페이지가 동작하지 않습니다.

```text
_publish/   (Pages 루트와 동일하게 맞출 때)
├── index.html, styles.css, ox-month.css, .nojekyll, CNAME
├── *.png (로고·스텝·SubPing 이미지 등)
├── ko/ en/ ja/ es/ pt-br/ fr/ de/ hi/ id/
├── privacy/                    (통합 개인정보처리방침, 루트 URL)
├── oxmonth/delete-account/   (OX MONTH 계정삭제 안내)
├── subping/delete-account/   (SubPing 계정삭제 안내)
├── locales/
├── ox-img/
├── i18n-img/
└── subping-img/
```

## 소스 저장소 예시 (git push 하는 경우)

```text
.
├── scripts/ templates/ locales/ ox-img/ i18n-img/ subping-img/
├── privacy/ oxmonth/ subping/ (빌드 생성: npm run publish 시 함께 갱신)
├── ko/ en/ … (빌드 생성물)
├── .github/workflows/github-pages.yml
└── …
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
3. `main` 푸시 시 워크플로가 `node scripts/publish-site.mjs`로 `_publish` 전체를 만든 뒤, 그 결과(언어 폴더·`locales`·이미지 폴더 포함)를 Pages에 배포합니다.

## 3. 도메인 (www.newon.app)

저장소 루트 **`CNAME`** 파일에는 `www.newon.app` 이 들어 있습니다. GitHub **Settings → Pages → Custom domain** 에도 동일하게 `www.newon.app` 을 넣으면 됩니다.

- **www 서브도메인:** DNS에서 `www` 를 GitHub Pages용 호스트로 [CNAME 설정](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain) (일반적으로 `YOURNAME.github.io`).
- **루트 `newon.app`만 쓰는 경우:** apex용 A/ALIAS 레코드는 [GitHub 문서](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)를 따르고, 필요하면 GitHub에서 apex → www 리다이렉트를 켭니다.

## 4. 워크플로 / 수동 업로드 공통

- **한 줄 요약:** `_publish`와 같은 구조가 Pages 루트에 있어야 합니다 (위 트리 참고).
- 워크플로 아티팩트는 `_publish` 디렉터리 전체이며, 루트의 `netlify.toml`·`vercel.json`은 Pages 배포 패키지에 넣지 않습니다.

빠짐 방지: **`업로드-체크리스트.txt`** 참고.
