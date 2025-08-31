# Naver Map Service

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ironjustlikethatgmailcoms-projects/v0-naver-map-service)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/yapw73VdOBf)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/ironjustlikethatgmailcoms-projects/v0-naver-map-service](https://vercel.com/ironjustlikethatgmailcoms-projects/v0-naver-map-service)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/yapw73VdOBf](https://v0.app/chat/projects/yapw73VdOBf)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Getting Started (KR)

1) 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 예시를 채워주세요. 예시는 `.env.local.example`에 있습니다.

```
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=네이버_클라우드_플랫폼_지도_Client_ID
NEXT_PUBLIC_SUPABASE_URL=옵션값
NEXT_PUBLIC_SUPABASE_ANON_KEY=옵션값
```

2) 개발 서버 실행

```
pnpm install
pnpm dev
```

브라우저에서 앱을 열면 기본 탭이 "지도"로 열리고 네이버 지도가 표시됩니다. 지도 로딩 실패 시 Client ID 설정을 다시 확인하세요.