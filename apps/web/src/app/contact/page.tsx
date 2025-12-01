import { Mail, Phone, MapPin, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@lovetrip/ui/components/card"
import { Footer } from "@/components/layout/footer"
import { ContactForm } from "@/components/features/contact/contact-form"

  const contactInfo = [
    {
      icon: Mail,
      title: "이메일",
      content: "support@lovetrip.com",
      link: "mailto:support@lovetrip.com",
      color: "text-blue-500",
    },
    {
      icon: Phone,
      title: "전화",
      content: "1588-0000",
      link: "tel:1588-0000",
      color: "text-green-500",
    },
    {
      icon: MapPin,
      title: "주소",
      content: "서울특별시 강남구 테헤란로 123",
      link: "#",
      color: "text-red-500",
    },
  ]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              문의하기
            </h1>
            <p className="text-lg text-muted-foreground">
              궁금한 점이나 문의사항이 있으시면 언제든지 연락주세요. 빠르게 답변드리겠습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 group"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="inline-flex items-center justify-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <info.icon className={`h-6 w-6 ${info.color} group-hover:scale-110 transition-transform`} />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                    {info.link !== "#" ? (
                      <a 
                        href={info.link} 
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{info.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <ContactForm />

              {/* FAQ */}
              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <h4 className="font-semibold">서비스는 무료인가요?</h4>
                    <p className="text-sm text-muted-foreground">
                      네, 기본 서비스는 무료로 이용하실 수 있습니다. 프리미엄 기능은 유료 구독이 필요합니다.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <h4 className="font-semibold">여행 계획을 공유할 수 있나요?</h4>
                    <p className="text-sm text-muted-foreground">
                      네, 파트너와 함께 여행 계획을 공유하고 실시간으로 수정할 수 있습니다.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <h4 className="font-semibold">모바일 앱이 있나요?</h4>
                    <p className="text-sm text-muted-foreground">
                      현재는 웹 서비스만 제공되며, 모바일 앱은 준비 중입니다. 웹 브라우저에서도 모바일 최적화되어 있습니다.
                    </p>
                  </div>
                  <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <h4 className="font-semibold">계정을 삭제하려면 어떻게 하나요?</h4>
                    <p className="text-sm text-muted-foreground">
                      프로필 설정에서 계정 삭제를 요청하실 수 있습니다. 삭제된 계정의 데이터는 복구할 수 없습니다.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
