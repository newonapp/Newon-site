/** Shared account-deletion copy for all Newon apps (Google Play / App Store compliance). */

const BODY_KO =
  '<p>사용자는 앱 내에서 직접 계정을 삭제할 수 있습니다.</p><h2>계정 삭제 방법</h2><ol class="legal-steps"><li>앱 실행</li><li>설정(Settings) 메뉴로 이동</li><li>계정(Account) 선택</li><li>「계정 삭제(Delete Account)」 버튼을 탭합니다</li></ol><h2>삭제 시 처리</h2><ul class="legal-bullets"><li>모든 사용자 데이터는 즉시 삭제됩니다.</li><li>삭제된 데이터는 복구할 수 없습니다.</li></ul><h2>문의</h2><p><a href="mailto:newon@newon.app">newon@newon.app</a></p>';

const BODY_EN =
  '<p>You can delete your account directly in the app.</p><h2>How to delete your account</h2><ol class="legal-steps"><li>Open the app</li><li>Go to Settings</li><li>Select Account</li><li>Tap <strong>Delete Account</strong></li></ol><h2>When you delete</h2><ul class="legal-bullets"><li>All user data is deleted immediately.</li><li>Deleted data cannot be recovered.</li></ul><h2>Contact</h2><p><a href="mailto:newon@newon.app">newon@newon.app</a></p>';

export function deleteAccountFields(appName, lang) {
  const isKo = lang === "ko";
  const link = isKo ? "계정 삭제" : "Delete account";
  const title = isKo ? `${appName} 계정 삭제 안내` : `${appName} — Delete your account`;
  const metaDesc = isKo
    ? `${appName} 앱에서 계정을 삭제하는 방법과 삭제 시 데이터 처리 안내입니다.`
    : `How to delete your ${appName} account and what happens to your data.`;
  const appMeta = isKo ? `앱 이름: ${appName} · 개발자: Newon` : `App: ${appName} · Developer: Newon`;
  return {
    deleteAccountLink: link,
    deleteAccount: {
      seoTitle: title,
      metaDescription: metaDesc,
      title,
      appMeta,
      bodyHtml: isKo ? BODY_KO : BODY_EN,
    },
  };
}

/** ns = locale key prefix; slug = URL path segment under {lang}/ */
export const DELETE_ACCOUNT_APPS = [
  { ns: "ox", slug: "oxmonth", name: "OX MONTH", skipLocale: true },
  { ns: "sp", slug: "subping", name: "SubPing" },
  { ns: "pm", slug: "pillmate", name: "Pillmate" },
  { ns: "sv", slug: "savy", name: "SAVY" },
  { ns: "bl", slug: "babylog", name: "BabyLog" },
  { ns: "pl", slug: "petlog", name: "PetLog" },
  { ns: "pu", slug: "piggyup", name: "PiggyUp" },
  { ns: "gu", slug: "goalup", name: "GoalUp" },
  { ns: "cu", slug: "countup", name: "CountUp" },
  { ns: "np", slug: "newon", name: "Newon" },
  { ns: "nt", slug: "noting", name: "Noting" },
];
