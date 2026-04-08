#!/usr/bin/env bash
# 루트에서 실행: 모든 변경 파일을 한 번에 커밋·푸시
#   ./upload-to-github.sh
#   ./upload-to-github.sh "커밋 메시지"
exec "$(dirname "$0")/scripts/push-to-github.sh" "$@"
