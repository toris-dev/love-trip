# Supabase 커스텀 SMTP 설정 가이드

Supabase Authentication에서 커스텀 SMTP를 설정하여 이메일 인증, 비밀번호 재설정 등의 이메일을 직접 관리할 수 있습니다.

## 📋 목차

1. [SMTP 서비스 선택](#1-smtp-서비스-선택)
2. [Supabase 대시보드 설정](#2-supabase-대시보드-설정)
3. [이메일 템플릿 커스터마이징](#3-이메일-템플릿-커스터마이징)
4. [테스트](#4-테스트)

## 1. SMTP 서비스 선택

다음과 같은 SMTP 서비스를 사용할 수 있습니다:

### 추천 SMTP 서비스

- **SendGrid** (무료: 100개/일)
- **Mailgun** (무료: 5,000개/월)
- **Amazon SES** (무료: 62,000개/월)
- **Gmail SMTP** (개인용, 제한적)
- **Naver Mail** (한국 서비스)
- **Daum Mail** (한국 서비스)

### SMTP 정보 확인

선택한 SMTP 서비스에서 다음 정보를 확인하세요:

- **SMTP Host**: 예) `smtp.sendgrid.net`
- **SMTP Port**: 보통 `587` (TLS) 또는 `465` (SSL)
- **SMTP User**: SMTP 사용자명 또는 API 키
- **SMTP Password**: SMTP 비밀번호 또는 API 키
- **Sender Email**: 발신자 이메일 주소
- **Sender Name**: 발신자 이름 (선택사항)

## 2. Supabase 대시보드 설정

### 2.1 SMTP 활성화

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Settings** → **Auth** → **SMTP Settings** 이동
4. **Enable Custom SMTP** 토글 활성화

### 2.2 SMTP 정보 입력

다음 정보를 입력하세요:

```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey (또는 실제 사용자명)
SMTP Password: YOUR_SMTP_PASSWORD
Sender Email: noreply@yourdomain.com
Sender Name: LOVETRIP (선택사항)
```

### 2.3 SendGrid 예시

```env
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Sender Email: noreply@lovetrip.com
Sender Name: LOVETRIP
```

### 2.4 Mailgun 예시

```env
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: postmaster@mg.yourdomain.com
SMTP Password: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Sender Email: noreply@yourdomain.com
Sender Name: LOVETRIP
```

### 2.5 Amazon SES 예시

```env
SMTP Host: email-smtp.ap-northeast-2.amazonaws.com
SMTP Port: 587
SMTP User: YOUR_SES_SMTP_USERNAME
SMTP Password: YOUR_SES_SMTP_PASSWORD
Sender Email: noreply@yourdomain.com
Sender Name: LOVETRIP
```

### 2.6 Gmail SMTP 예시 (개인용, 제한적)

```env
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: 앱 비밀번호 (2단계 인증 필요)
Sender Email: your-email@gmail.com
Sender Name: LOVETRIP
```

> ⚠️ **주의**: Gmail SMTP는 보안상의 이유로 앱 비밀번호를 사용해야 하며, 일일 전송 제한이 있습니다.

## 3. 이메일 템플릿 커스터마이징

Supabase 대시보드에서 이메일 템플릿을 커스터마이징할 수 있습니다:

1. **Settings** → **Auth** → **Email Templates** 이동
2. 다음 템플릿을 커스터마이징할 수 있습니다:
   - **Confirm signup**: 회원가입 확인 이메일
   - **Magic Link**: 매직 링크 로그인 이메일
   - **Change Email Address**: 이메일 변경 확인
   - **Reset Password**: 비밀번호 재설정 이메일
   - **Reauthentication**: 재인증 이메일

### 템플릿 변수

템플릿에서 사용할 수 있는 변수:

- `{{ .ConfirmationURL }}`: 확인 URL
- `{{ .Token }}`: 토큰
- `{{ .TokenHash }}`: 토큰 해시
- `{{ .SiteURL }}`: 사이트 URL
- `{{ .Email }}`: 사용자 이메일
- `{{ .RedirectTo }}`: 리다이렉트 URL

### 예시 템플릿 (회원가입 확인)

```html
<h2>LOVETRIP에 오신 것을 환영합니다!</h2>
<p>아래 링크를 클릭하여 이메일을 확인해주세요:</p>
<p><a href="{{ .ConfirmationURL }}">이메일 확인하기</a></p>
<p>링크가 작동하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>
<p>감사합니다,<br />LOVETRIP 팀</p>
```

## 4. 비밀번호 변경 및 이메일 변경 알림 설정

### 4.1 비밀번호 변경 알림

Supabase는 비밀번호 변경 시 자동으로 알림 이메일을 전송합니다. 다음 템플릿을 커스터마이징할 수 있습니다:

1. **Settings** → **Auth** → **Email Templates** 이동
2. **Password changed** 템플릿 선택
3. 다음 예시 템플릿을 사용하거나 커스터마이징:

```html
<h2>비밀번호가 변경되었습니다</h2>
<p>안녕하세요,</p>
<p>귀하의 계정 비밀번호가 성공적으로 변경되었습니다.</p>
<p>만약 본인이 비밀번호를 변경하지 않았다면, 즉시 계정 보안을 확인해주세요.</p>
<p>변경 일시: {{ .TokenHash }}</p>
<p>감사합니다,<br />LOVETRIP 팀</p>
```

### 4.2 이메일 주소 변경 알림

이메일 주소 변경 시 Supabase는 자동으로 확인 이메일을 전송합니다. 다음 템플릿을 커스터마이징할 수 있습니다:

1. **Settings** → **Auth** → **Email Templates** 이동
2. **Change Email Address** 템플릿 선택
3. 다음 예시 템플릿을 사용하거나 커스터마이징:

```html
<h2>이메일 주소 변경 확인</h2>
<p>안녕하세요,</p>
<p>귀하의 계정 이메일 주소 변경 요청이 접수되었습니다.</p>
<p>아래 링크를 클릭하여 새 이메일 주소를 확인해주세요:</p>
<p><a href="{{ .ConfirmationURL }}">이메일 주소 확인하기</a></p>
<p>링크가 작동하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:</p>
<p>{{ .ConfirmationURL }}</p>
<p>만약 본인이 이메일 주소를 변경하지 않았다면, 이 이메일을 무시해주세요.</p>
<p>감사합니다,<br />LOVETRIP 팀</p>
```

### 4.3 이메일 변경 완료 알림 (선택사항)

이메일 변경이 완료된 후 사용자에게 알림을 보내려면, Supabase Database Trigger를 사용할 수 있습니다:

1. **Database** → **Functions** 이동
2. 새 Edge Function 생성 또는 Database Trigger 생성
3. `auth.users` 테이블의 `email` 변경 감지
4. 변경 완료 시 알림 이메일 전송

또는 애플리케이션 레벨에서 `/api/auth/notify-email-change` 엔드포인트를 통해 처리할 수 있습니다.

## 5. 테스트

### 5.1 비밀번호 변경 테스트

1. 프로필 페이지에서 "비밀번호 변경" 클릭
2. 현재 비밀번호, 새 비밀번호 입력
3. 변경 완료 후 이메일 확인

### 5.2 이메일 변경 테스트

1. 프로필 페이지에서 "이메일 주소 변경" 클릭
2. 새 이메일 주소 및 비밀번호 입력
3. 새 이메일 주소로 확인 메일 확인
4. 확인 링크 클릭하여 변경 완료

## 4. 테스트

### 4.1 회원가입 테스트

1. 앱에서 회원가입 시도
2. 입력한 이메일 주소로 확인 이메일 수신 확인
3. 이메일의 확인 링크 클릭
4. 계정 활성화 확인

### 4.2 비밀번호 재설정 테스트

1. 로그인 페이지에서 "비밀번호 찾기" 클릭
2. 이메일 주소 입력
3. 비밀번호 재설정 이메일 수신 확인
4. 이메일의 링크를 통해 비밀번호 재설정

## 5. 문제 해결

### 이메일이 전송되지 않는 경우

1. **SMTP 설정 확인**
   - Host, Port, User, Password가 정확한지 확인
   - SMTP 서비스에서 발신자 이메일이 인증되었는지 확인

2. **포트 확인**
   - 포트 587 (TLS) 또는 465 (SSL) 사용
   - 방화벽에서 포트가 차단되지 않았는지 확인

3. **SPF/DKIM 설정**
   - 도메인에 SPF 레코드 추가
   - DKIM 서명 설정 (선택사항, 권장)

4. **스팸 필터 확인**
   - 수신자의 스팸 폴더 확인
   - 발신자 이메일이 스팸으로 분류되지 않도록 설정

### SendGrid 설정 예시

SendGrid를 사용하는 경우:

1. [SendGrid](https://sendgrid.com/) 계정 생성
2. **Settings** → **API Keys**에서 API 키 생성
3. **Settings** → **Sender Authentication**에서 발신자 인증
4. Supabase에 다음 정보 입력:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: SG.생성한_API_키
   ```

### Mailgun 설정 예시

Mailgun을 사용하는 경우:

1. [Mailgun](https://www.mailgun.com/) 계정 생성
2. 도메인 추가 및 DNS 설정
3. **Sending** → **Domain Settings**에서 SMTP 정보 확인
4. Supabase에 SMTP 정보 입력

## 6. 보안 권장사항

1. **환경 변수 사용**: SMTP 비밀번호는 환경 변수로 관리
2. **API 키 보호**: API 키는 절대 공개 저장소에 커밋하지 않기
3. **도메인 인증**: 발신자 도메인을 인증하여 신뢰도 향상
4. **Rate Limiting**: SMTP 서비스의 전송 제한 확인

## 7. 추가 리소스

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [SendGrid 문서](https://docs.sendgrid.com/)
- [Mailgun 문서](https://documentation.mailgun.com/)
- [Amazon SES 문서](https://docs.aws.amazon.com/ses/)
