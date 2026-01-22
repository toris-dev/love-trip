"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lovetrip/ui/components/card"
import { Button } from "@lovetrip/ui/components/button"
import { Input } from "@lovetrip/ui/components/input"
import { Label } from "@lovetrip/ui/components/label"
import { Badge } from "@lovetrip/ui/components/badge"
import { Heart, UserPlus, Check, X, Mail, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@lovetrip/ui/components/avatar"
import { calendarService, type Couple } from "@lovetrip/couple/services"
import { createClient } from "@lovetrip/api/supabase/client"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface SearchedUser {
  id: string
  nickname: string
  display_name: string | null
  email: string
  avatar_url: string | null
}

export function CoupleConnection() {
  const [couple, setCouple] = useState<Couple | null>(null)
  const [searchNickname, setSearchNickname] = useState("")
  const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<Couple[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [partnerInfo, setPartnerInfo] = useState<{
    nickname?: string
    display_name?: string
    email: string
  } | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user ? { id: user.id, email: user.email || "" } : null)

      const coupleData = await calendarService.getMyCouple()
      setCouple(coupleData)

      if (coupleData && user) {
        // 파트너 정보 가져오기
        const partnerId =
          coupleData.user1_id === user.id ? coupleData.user2_id : coupleData.user1_id
        const response = await fetch(`/api/users/find?id=${partnerId}`).catch(() => null)
        if (response && response.ok) {
          const partner = await response.json()
          // 프로필 정보도 가져오기
          const profileResponse = await supabase
            .from("profiles")
            .select("nickname, display_name")
            .eq("id", partnerId)
            .single()

          if (profileResponse.data) {
            setPartnerInfo({
              email: partner.email,
              nickname: profileResponse.data.nickname,
              display_name: profileResponse.data.display_name,
            })
          } else {
            setPartnerInfo({ email: partner.email })
          }
        }
      }

      // pending 요청 가져오기
      if (user) {
        const { data: requests } = await supabase
          .from("couples")
          .select("*")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .eq("status", "pending")

        setPendingRequests(requests || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchNickname.trim()) {
      toast.error("닉네임을 입력해주세요")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/users/search?nickname=${encodeURIComponent(searchNickname.trim())}`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || "사용자를 찾을 수 없습니다")
        setSearchedUser(null)
        return
      }

      const userData = await response.json()
      setSearchedUser(userData)
    } catch (error) {
      console.error("Error searching user:", error)
      toast.error("검색 중 오류가 발생했습니다")
      setSearchedUser(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRequestCouple = async () => {
    if (!searchedUser) {
      toast.error("먼저 사용자를 검색해주세요")
      return
    }

    const result = await calendarService.requestCouple(searchedUser.nickname)
    if (result.success) {
      toast.success("커플 연결 요청을 보냈습니다")
      setSearchedUser(null)
      setSearchNickname("")
      loadData()
    } else {
      toast.error(result.error || "요청에 실패했습니다")
    }
  }

  const handleRespondToRequest = async (coupleId: string, accept: boolean) => {
    const result = await calendarService.respondToCoupleRequest(coupleId, accept)
    if (result.success) {
      toast.success(accept ? "커플 연결이 완료되었습니다" : "요청을 거절했습니다")
      loadData()
    } else {
      toast.error(result.error || "처리에 실패했습니다")
    }
  }

  const handleGenerateInviteLink = async () => {
    setIsGeneratingInvite(true)
    try {
      const response = await fetch("/api/couples/invite", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "초대 링크 생성에 실패했습니다")
      }

      const { inviteLink: link } = await response.json()
      setInviteLink(link)
      toast.success("초대 링크가 생성되었습니다")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "초대 링크 생성에 실패했습니다")
    } finally {
      setIsGeneratingInvite(false)
    }
  }

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return

    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success("초대 링크가 클립보드에 복사되었습니다")
    } catch (error) {
      toast.error("링크 복사에 실패했습니다")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="px-6 sm:px-8 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (couple) {
    return (
      <Card>
        <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            커플 연결됨
          </CardTitle>
          <CardDescription>커플과 일정을 공유하고 있습니다</CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">
                {partnerInfo?.display_name || partnerInfo?.nickname || "파트너"}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                {partnerInfo?.nickname && (
                  <Badge variant="outline" className="text-xs">
                    @{partnerInfo.nickname}
                  </Badge>
                )}
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {partnerInfo?.email || "로딩 중..."}
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
              <Check className="h-3 w-3 mr-1" />
              연결됨
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          커플 연결
        </CardTitle>
        <CardDescription>파트너의 닉네임을 검색하여 커플 연결을 요청하세요</CardDescription>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-4">
        {/* 닉네임 검색 */}
        <div className="space-y-2">
          <Label htmlFor="partner-nickname">커플 닉네임</Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              id="partner-nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={searchNickname}
              onChange={e => setSearchNickname(e.target.value)}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchNickname.trim()}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  검색
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 검색 결과 */}
        {searchedUser && (
          <motion.div
            className="p-4 border rounded-lg bg-card"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={searchedUser.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {searchedUser.display_name?.[0] || searchedUser.nickname[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="font-semibold flex flex-wrap items-center gap-2">
                  <span className="truncate">{searchedUser.display_name || "이름 없음"}</span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    @{searchedUser.nickname}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{searchedUser.email}</span>
                </div>
              </div>
              <Button onClick={handleRequestCouple} className="w-full sm:w-auto shrink-0">
                <UserPlus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">연결 요청</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* 초대 링크 생성 */}
        <div className="space-y-2 pt-4 border-t">
          <Label>초대 링크로 연결하기</Label>
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateInviteLink}
              disabled={isGeneratingInvite}
              variant="outline"
              className="flex-1"
            >
              {isGeneratingInvite ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  초대 링크 생성
                </>
              )}
            </Button>
          </div>
          {inviteLink && (
            <motion.div
              className="p-3 border rounded-lg bg-muted/50 space-y-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-sm font-medium">초대 링크</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input value={inviteLink} readOnly className="flex-1 text-xs" />
                <Button size="sm" onClick={handleCopyInviteLink} className="w-full sm:w-auto">
                  복사
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                이 링크를 파트너에게 공유하세요. 링크는 7일 후 만료됩니다.
              </p>
            </motion.div>
          )}
        </div>

        {/* 대기 중인 요청 */}
        {pendingRequests.length > 0 && (
          <div className="space-y-2">
            <Label>대기 중인 요청</Label>
            {pendingRequests.map(request => {
              const isIncoming = request.user2_id === user?.id
              return (
                <motion.div
                  key={request.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{isIncoming ? "받은 요청" : "보낸 요청"}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                  {isIncoming && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespondToRequest(request.id, false)}
                        className="flex-1 sm:flex-initial"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRespondToRequest(request.id, true)}
                        className="flex-1 sm:flex-initial"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {!isIncoming && (
                    <Badge variant="secondary" className="w-full sm:w-auto text-center">
                      대기 중
                    </Badge>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
