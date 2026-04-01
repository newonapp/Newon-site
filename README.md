# Newon 웹사이트

정적 사이트(`index.html`, `styles.css`, `ox-month.css`, `assets/**`)를 **GitHub Pages**에 올려 **www.newon.app**으로 연결하는 방법입니다.

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

## 3. 도메인 연결 (www.newon.app)

1. Settings → Pages → **Custom domain** 에 `www.newon.app` 입력 후 저장  
   (저장소 루트의 `CNAME` 파일과 맞춰 두었습니다.)
2. DNS(도메인 업체 패널) 예시:

   | 유형 | 이름 | 값 |
   |------|------|-----|
   | CNAME | www | `YOUR_USER.github.io` |

   - 저장소가 **`USERNAME.github.io`** 인 **유저/조직 사이트**이면 CNAME 값은 `USERNAME.github.io` 입니다.
   - **프로젝트 페이지**(`USERNAME.github.io/REPO/`)라도 커스텀 도메인을 쓰면 GitHub이 안내하는 대상(보통 `USERNAME.github.io`)을 넣으면 됩니다.

3. DNS 반영 후 GitHub에서 **Enforce HTTPS** 가능해질 때까지 기다립니다.

**루트 도메인만 쓰는 경우(`newon.app`)**  
업체에서 apex를 GitHub로 연결(A 레코드 또는 ALIAS)한 뒤, GitHub Pages 설정에서 필요하면 `www`로 리다이렉트를 켭니다. 루트만 쓰려면 `CNAME` 내용을 `newon.app`으로 바꾸고 DNS를 GitHub 도움말에 맞게 구성하면 됩니다.

## 4. 배포에 포함되는 것

워크플로가 `main`에 푸시될 때마다 아래만 묶어서 Pages에 올립니다.

- `index.html`, `styles.css`, `ox-month.css`
- `assets/` 이하 전체(이미지 포함)
- `CNAME`

문제가 있으면 저장소 **Actions** 탭에서 해당 실행 로그를 확인하세요.
