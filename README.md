# Newon 웹사이트

정적 사이트(`index.html`, `styles.css`, `ox-month.css`, `assets/**`)를 **GitHub Pages**에 올려 **newon.app**(루트 도메인)으로 연결하는 방법입니다.

## 1. 저장소에 올리기

```bash
cd Newon
git init
git add index.html styles.css ox-month.css assets CNAME .github .gitignore README.md
git commit -m "Initial site for GitHub Pages"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

- **`assets` 폴더 전체**에 로고·OX MONTH 스크린샷 등이 들어 있습니다. 이 폴더를 커밋하면 워크플로에서 **이미지까지 한 번에** 배포됩니다.
- `vercel.json`, `netlify.toml`은 배포 아티팩트에는 넣지 않습니다(로컬·다른 호스트용).

## 2. GitHub에서 Pages 켜기

1. 저장소 **Settings → Pages**
2. **Build and deployment** → **Source**: **GitHub Actions**
3. `Deploy static site to GitHub Pages` 워크플로가 `main` 푸시 때 실행되는지 확인

## 3. 도메인 연결 (newon.app)

1. 저장소 **Settings → Pages → Custom domain** 에 **`newon.app`** 입력 후 저장  
   (루트의 `CNAME` 파일 내용과 동일하게 맞춰 두었습니다.)
2. DNS에서 **apex(`newon.app`)** 를 GitHub Pages로 붙입니다. 도메인 업체 패널 예시(A 레코드, 값은 [GitHub 문서](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)와 동일한지 확인):

   | 유형 | 이름(호스트) | 값 |
   |------|----------------|-----|
   | A | `@`(또는 비움) | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |

   IPv6를 쓰는 업체라면 문서에 나온 **AAAA** 레코드도 추가합니다.
3. DNS가 퍼진 뒤 GitHub에서 **Enforce HTTPS** 를 켤 수 있게 될 때까지 기다립니다.

**`www.newon.app` 도 같이 쓰려면**  
DNS에 `www` → **`YOUR_USER.github.io`** CNAME을 추가하고, Pages 설정에서 `www`를 추가(또는 GitHub이 안내하는 대로)하면 됩니다.

## 4. 배포에 포함되는 것

워크플로가 `main`에 푸시될 때마다 아래만 묶어서 Pages에 올립니다.

- `index.html`, `styles.css`, `ox-month.css`
- `assets/` 이하 전체(이미지 포함)
- `CNAME`

문제가 있으면 저장소 **Actions** 탭에서 해당 실행 로그를 확인하세요.
