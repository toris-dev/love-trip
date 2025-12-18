import { Heart, Sparkles, Users, MapPin, Target, Zap, Shield, Globe, Wallet } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import Link from "next/link"

const features = [
  {
    icon: Sparkles,
    title: "AI 기반 맞춤 추천",
    description: "커플의 취향과 예산에 맞는 최적의 여행 코스를 AI가 추천해드립니다",
    color: "text-yellow-500",
  },
  {
    icon: MapPin,
    title: "실시간 지도 연동",
    description: "네이버 지도와 연동하여 실제 위치 기반으로 정확한 여행 계획을 세울 수 있습니다",
    color: "text-green-500",
  },
  {
    icon: Wallet,
    title: "스마트 예산 관리",
    description: "실시간 지출 추적과 예산 분석으로 여행 경비를 완벽하게 관리하세요",
    color: "text-blue-500",
  },
  {
    icon: Users,
    title: "커플 협업 기능",
    description: "파트너와 함께 실시간으로 여행 계획을 공유하고 수정할 수 있습니다",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "안전한 정보 보호",
    description: "개인정보를 안전하게 보호하며, 모든 데이터는 암호화되어 저장됩니다",
    color: "text-purple-500",
  },
  {
    icon: Globe,
    title: "다양한 여행지",
    description: "전국 어디든, 다양한 테마의 여행지를 추천하고 관리할 수 있습니다",
    color: "text-cyan-500",
  },
]

const stats = [
  { number: "10,000+", label: "활성 사용자" },
  { number: "5,000+", label: "공개된 코스" },
  { number: "42,000+", label: "추천 장소" },
  { number: "98%", label: "재방문율" },
]

// ISR: 1시간마다 재생성 (Incremental Static Regeneration)
export const revalidate = 3600

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <Heart className="h-16 w-16 text-primary fill-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-ping" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              LOVETRIP에 오신 것을 환영합니다
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              커플을 위한 완벽한 여행 계획 서비스로, 특별한 순간을 함께 만들어가세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="group">
                <Link href="/">
                  여행 계획 시작하기
                  <Zap className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">문의하기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center border-2 hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">우리의 미션</h2>
              <p className="text-xl text-muted-foreground">
                모든 커플이 특별한 여행을 계획하고 추억을 만들 수 있도록 돕는 것
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                <CardHeader>
                  <Target className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>비전</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    기술과 로맨스가 만나는 곳에서, 모든 커플이 쉽고 즐겁게 여행을 계획할 수 있는
                    세계 최고의 플랫폼이 되는 것입니다.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-xl">
                <CardHeader>
                  <Heart className="h-10 w-10 text-primary mb-4 fill-primary" />
                  <CardTitle>가치</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    사용자 중심의 서비스, 혁신적인 기술, 그리고 커플들의 행복한 추억을 만드는 것이
                    우리의 핵심 가치입니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">주요 기능</h2>
            <p className="text-xl text-muted-foreground">
              LOVETRIP이 제공하는 특별한 기능들을 만나보세요
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="mb-4">
                    <feature.icon
                      className={`h-10 w-10 ${feature.color} group-hover:scale-110 transition-transform`}
                    />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="pt-12 pb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">지금 바로 시작해보세요</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                특별한 여행 계획을 세우고 소중한 추억을 만들어보세요
              </p>
              <Button asChild size="lg" className="group">
                <Link href="/">
                  무료로 시작하기
                  <Heart className="ml-2 h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
