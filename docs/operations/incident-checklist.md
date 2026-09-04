# NEWON INCIDENT CHECKLIST

Print or keep open during an incident.

## Immediate

- [ ] Confirm impact: Public site / HQ / Firestore / Auth / External
- [ ] Severity: SEV-1 / SEV-2 / SEV-3 / SEV-4
- [ ] If alert came from monitoring: re-verify (`npm run monitor:production` or Actions → Production monitor)
- [ ] Stop further deploys and risky data edits
- [ ] Decide if Firestore writes must pause

## Preserve

- [ ] Note time (UTC) and symptoms
- [ ] Capture Actions run / commit SHA if deploy-related
- [ ] HQ → Settings → **Export HQ backup** (if data at risk)
- [ ] Copy current Console Rules text (if rules at risk)

## Recover

- [ ] Identify Last Known Good (commit / backup file / rules)
- [ ] Prefer `git revert` for code; manual restore for Firestore docs
- [ ] Do **not** force-push `main` unless explicitly decided
- [ ] Do **not** auto-deploy Rules from CI in panic

## Validate

- [ ] Public: Home, Business, Inquiry
- [ ] HQ: sign-in, Projects, CRM, Documents, Finance
- [ ] Spot-check restored document IDs / counts

## Close

- [ ] Resume normal operations
- [ ] Write short incident note (what / when / fix / follow-up)
- [ ] Schedule prevention item

See `docs/operations/backup-recovery.md` for full runbooks.
