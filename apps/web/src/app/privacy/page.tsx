import type { Metadata } from "next"
import { Shield, Lock, Eye, FileCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import dynamic from "next/dynamic"

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description:
    "LOVETRIP의 개인정보 처리방침입니다. 회원의 개인정보 보호를 위해 최선을 다하고 있습니다.",
  keywords: ["개인정보처리방침", "개인정보보호", "프라이버시", "LOVETRIP"],
  openGraph: {
    title: "개인정보 처리방침 | LOVETRIP",
    description: "LOVETRIP의 개인정보 처리방침입니다.",
    url: "https://lovetrip.vercel.app/privacy",
    type: "website",
  },
  alternates: {
    canonical: "/privacy",
  },
}

const sections = [
  {
    icon: FileCheck,
    title: "제1조 (개인정보의 처리목적)",
    content: `LOVETRIP은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

1. 회원 가입 및 관리
- 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적

2. 재화 또는 서비스 제공
- 여행 계획 수립, 예산 관리, 장소 추천, 지도 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공

3. 마케팅 및 광고에의 활용
- 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공`,
  },
  {
    icon: Eye,
    title: "제2조 (개인정보의 처리 및 보유기간)",
    content: `① LOVETRIP은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.

② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
1. 회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)
2. 재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료 시까지
3. 마케팅 및 광고 활용: 회원 탈퇴 시까지 또는 동의 철회 시까지`,
  },
  {
    icon: Lock,
    title: "제3조 (처리하는 개인정보의 항목)",
    content: `LOVETRIP은 다음의 개인정보 항목을 처리하고 있습니다:

1. 회원 가입 및 관리
- 필수항목: 이메일, 비밀번호, 닉네임
- 선택항목: 프로필 사진, 생년월일, 성별

2. 서비스 이용 과정에서 자동 수집되는 정보
- IP주소, 쿠키, MAC주소, 서비스 이용 기록, 방문 기록, 불량 이용 기록 등

3. 여행 계획 관련 정보
- 여행지, 일정, 예산 정보, 방문 장소 정보 등`,
  },
  {
    icon: Shield,
    title: "제4조 (개인정보의 제3자 제공)",
    content: `① LOVETRIP은 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.

② LOVETRIP은 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
1. 정보주체가 사전에 동의한 경우
2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우`,
  },
  {
    icon: Lock,
    title: "제5조 (개인정보처리의 위탁)",
    content: `① LOVETRIP은 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:

1. 네이버 클라우드 플랫폼 (지도 서비스)
- 위탁업무 내용: 지도 서비스 제공
- 위탁기간: 서비스 이용 기간

2. 클라우드 호스팅 서비스
- 위탁업무 내용: 데이터 저장 및 관리
- 위탁기간: 서비스 이용 기간

② LOVETRIP은 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.`,
  },
  {
    icon: Eye,
    title: "제6조 (정보주체의 권리·의무 및 행사방법)",
    content: `① 정보주체는 LOVETRIP에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
1. 개인정보 처리정지 요구권
2. 개인정보 열람요구권
3. 개인정보 정정·삭제요구권
4. 개인정보 처리정지 요구권

② 제1항에 따른 권리 행사는 LOVETRIP에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 LOVETRIP은 이에 대해 지체 없이 조치하겠습니다.

③ 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 LOVETRIP은 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.`,
  },
  {
    icon: Shield,
    title: "제7조 (개인정보의 파기)",
    content: `① LOVETRIP은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.

② 개인정보 파기의 절차 및 방법은 다음과 같습니다:
1. 파기절차: LOVETRIP은 파기 사유가 발생한 개인정보를 선정하고, LOVETRIP의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
2. 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.`,
  },
  {
    icon: Lock,
    title: "제8조 (개인정보 보호책임자)",
    content: `① LOVETRIP은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

▶ 개인정보 보호책임자
- 성명: LOVETRIP 개인정보보호팀
- 직책: 개인정보 보호책임자
- 연락처: privacy@lovetrip.com

② 정보주체께서는 LOVETRIP의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.`,
  },
  {
    icon: AlertCircle,
    title: "제9조 (개인정보의 안전성 확보조치)",
    content: `LOVETRIP은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
1. 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등
2. 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
3. 물리적 조치: 전산실, 자료보관실 등의 접근통제`,
  },
]

// ISR: 개인정보처리방침은 자주 변경되지 않으므로 24시간마다 재생성
export const revalidate = 86400

export default function PrivacyPage() {
  const lastModifiedDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              개인정보처리방침
            </h1>
            <p className="text-lg text-muted-foreground">
              LOVETRIP은 이용자의 개인정보를 소중히 다루며, 관련 법령을 준수합니다.
            </p>
            <p className="text-sm text-muted-foreground mt-4">최종 수정일: {lastModifiedDate}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2" />
                  개인정보 보호 안내
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  LOVETRIP은 이용자의 개인정보를 보호하기 위해 최선을 다하고 있으며, 개인정보 보호법
                  및 관련 법령을 준수합니다. 본 방침은 관련 법령의 변경 및 내부 정책 변경에 따라
                  변경될 수 있으며, 변경 시 사전에 공지하겠습니다.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <section.icon className="h-5 w-5 text-primary mr-2" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8 border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  개인정보 처리방침에 대한 문의사항이 있으시면{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    고객센터
                  </a>
                  또는 privacy@lovetrip.com으로 연락주시기 바랍니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
