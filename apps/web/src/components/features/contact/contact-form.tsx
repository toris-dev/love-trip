"use client"

import { useState } from "react"
import { Send, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Textarea } from "@lovetrip/ui/components/textarea"
import { Label } from "@lovetrip/ui/components/label"
import { toast } from "sonner"

export function ContactForm() {
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

  return (
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
  )
}

