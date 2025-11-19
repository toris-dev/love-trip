"use client"

import { FileText, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  const sections = [
    {
      title: "제1조 (목적)",
      content: `이 약관은 LOVETRIP(이하 "회사")이 제공하는 여행 계획 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
    },
    {
      title: "제2조 (정의)",
      content: `① "서비스"란 회사가 제공하는 여행 계획, 예산 관리, 장소 추천 등과 관련된 모든 서비스를 의미합니다.
② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
③ "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
④ "비회원"이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 말합니다.`,
    },
    {
      title: "제3조 (약관의 게시와 개정)",
      content: `① 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
③ 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
④ 회원은 개정된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있으며, 개정된 약관의 적용일자 이후에도 서비스를 계속 이용할 경우 약관의 변경사항에 동의한 것으로 간주됩니다.`,
    },
    {
      title: "제4조 (서비스의 제공 및 변경)",
      content: `① 회사는 다음과 같은 서비스를 제공합니다:
1. 여행 계획 수립 및 관리 서비스
2. 여행지 추천 및 정보 제공 서비스
3. 예산 관리 및 지출 추적 서비스
4. 지도 기반 여행 코스 안내 서비스
5. 기타 회사가 추가 개발하거나 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스

② 회사는 서비스의 내용을 변경할 수 있으며, 변경 시에는 사전에 공지합니다.`,
    },
    {
      title: "제5조 (서비스의 중단)",
      content: `① 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
② 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.`,
    },
    {
      title: "제6조 (회원가입)",
      content: `① 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
② 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
1. 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우
2. 등록 내용에 허위, 기재누락, 오기가 있는 경우
3. 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우`,
    },
    {
      title: "제7조 (개인정보보호)",
      content: `① 회사는 이용자의 개인정보 수집 시 서비스 제공에 필요한 최소한의 정보를 수집합니다.
② 회사는 회원가입 시 구매계약이행에 필요한 정보를 미리 수집하지 않습니다.
③ 회사는 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.
④ 회사는 수집된 개인정보를 목적 외의 용도로 이용할 수 없으며, 새로운 이용목적이 발생한 경우 또는 제3자에게 제공하는 경우에는 이용·제공단계에서 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.`,
    },
    {
      title: "제8조 (회원의 의무)",
      content: `① 회원은 다음 행위를 하여서는 안 됩니다:
1. 신청 또는 변경 시 허위내용의 등록
2. 타인의 정보 도용
3. 회사가 게시한 정보의 변경
4. 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시
5. 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해
6. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
7. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위`,
    },
    {
      title: "제9조 (저작권의 귀속 및 이용제한)",
      content: `① 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
② 이용자는 회사를 이용함으로써 얻은 정보 중 회사에 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.`,
    },
    {
      title: "제10조 (면책조항)",
      content: `① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
③ 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.`,
    },
    {
      title: "제11조 (분쟁의 해결)",
      content: `① 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.
② 회사와 이용자 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.`,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              이용약관
            </h1>
            <p className="text-lg text-muted-foreground">
              LOVETRIP 서비스 이용약관입니다. 서비스를 이용하시기 전에 반드시 읽어보시기 바랍니다.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              최종 수정일: {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2" />
                  약관 동의 안내
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  본 약관은 LOVETRIP 서비스 이용에 필요한 사항을 규정하고 있습니다. 
                  서비스를 이용하시면 본 약관에 동의한 것으로 간주됩니다.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
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
                  약관에 대한 문의사항이 있으시면{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    고객센터
                  </a>
                  로 연락주시기 바랍니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

