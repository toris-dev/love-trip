"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/footer"
import { toast } from "sonner"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 실제로는 API 호출로 처리
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      toast.success("문의가 성공적으로 전송되었습니다!")
      setFormData({ name: "", email: "", subject: "", message: "" })
      
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

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
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="h-5 w-5 mr-2 text-primary" />
                    문의 양식
                  </CardTitle>
                  <CardDescription>
                    아래 양식을 작성해주시면 빠르게 답변드리겠습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
                      <h3 className="text-xl font-semibold mb-2">문의가 전송되었습니다!</h3>
                      <p className="text-muted-foreground">
                        빠른 시일 내에 답변드리겠습니다.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">이름</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="이름을 입력해주세요"
                          required
                          className="transition-all focus:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="이메일을 입력해주세요"
                          required
                          className="transition-all focus:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">제목</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="문의 제목을 입력해주세요"
                          required
                          className="transition-all focus:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">메시지</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="문의 내용을 입력해주세요"
                          rows={6}
                          required
                          className="transition-all focus:scale-[1.01] resize-none"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full group" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            전송 중...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            문의 보내기
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>자주 묻는 질문</CardTitle>
                  <CardDescription>
                    빠른 답변을 원하시나요? 자주 묻는 질문을 확인해보세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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

