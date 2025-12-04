import { Sparkles } from "lucide-react"

export function HomeHeroSection() {
  return (
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">커플을 위한 특별한 여행</span>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        완벽한 여행을
        <br />
        함께 계획해보세요
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        여행 계획으로 특별한 추억을 만들어보세요
      </p>
    </div>
  )
}
