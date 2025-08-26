# VAPID 키 설정 가이드

## VAPID 키란?

VAPID (Voluntary Application Server Identification) 키는 웹 푸시 알림을 위한 인증 키 쌍입니다.

- **공개키 (Public Key)**: 클라이언트에서 푸시 구독 시 사용
- **개인키 (Private Key)**: 서버에서 푸시 메시지 전송 시 사용

## 1. VAPID 키 생성

스크립트를 실행하여 키를 생성하세요:

\`\`\`bash
node scripts/generate-vapid-keys.js
\`\`\`

## 2. 환경 변수 설정

생성된 키를 Vercel 프로젝트 설정에 추가하세요:

### Vercel Dashboard에서 설정:
1. 프로젝트 → Settings → Environment Variables
2. 다음 변수들을 추가:

\`\`\`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=생성된_공개키
VAPID_PRIVATE_KEY=생성된_개인키
VAPID_SUBJECT=mailto:your-email@example.com
\`\`\`

### 로컬 개발용 (.env.local):
\`\`\`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=생성된_공개키
VAPID_PRIVATE_KEY=생성된_개인키
VAPID_SUBJECT=mailto:your-email@example.com
\`\`\`

## 3. 키 사용 위치

### 클라이언트 (hooks/use-push-notifications.ts):
\`\`\`typescript
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
\`\`\`

### 서버 (app/api/push/send/route.ts):
\`\`\`typescript
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)
\`\`\`

## 4. 보안 주의사항

- **개인키는 절대 클라이언트에 노출하지 마세요**
- **공개키만 NEXT_PUBLIC_ 접두사를 사용하세요**
- **개인키는 서버 환경에서만 사용하세요**

## 5. 테스트

푸시 알림이 제대로 작동하는지 확인:

1. 브라우저에서 알림 권한 허용
2. 푸시 알림 구독
3. 서버에서 테스트 알림 전송

\`\`\`typescript
// 테스트 알림 전송
await notificationService.sendToCurrentUser(
  "테스트 알림",
  "VAPID 키 설정이 완료되었습니다!"
)
