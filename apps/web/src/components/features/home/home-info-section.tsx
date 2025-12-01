import { Card, CardContent, CardHeader, CardTitle } from "@lovetrip/ui/components/card"
import { Sparkles, MapPin, Heart } from "lucide-react"

export function HomeInfoSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      <Card>
        <CardHeader>
          <CardTitle>왜 LOVETRIP인가요?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">AI 기반 맞춤 추천</h4>
              <p className="text-sm text-muted-foreground">
                커플의 취향과 선호도를 분석하여 최적의 여행 코스를 추천합니다
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">실시간 지도 탐색</h4>
              <p className="text-sm text-muted-foreground">
                네이버 지도 기반으로 장소를 확인하고 코스를 계획할 수 있습니다
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">커플 맞춤 기능</h4>
              <p className="text-sm text-muted-foreground">
                공유 캘린더와 일정 관리를 통해 함께 여행을 계획하세요
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>시작하기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="font-medium">원하는 코스 선택</span>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              여행 코스 또는 데이트 코스 중 선택하세요
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="font-medium">지도에서 코스 탐색</span>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              지도에서 장소를 확인하고 상세 정보를 살펴보세요
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="font-medium">일정 저장 및 공유</span>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              캘린더에 일정을 저장하고 커플과 공유하세요
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
