"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface VapidStatus {
  publicKey: boolean
  privateKey: boolean
  subject: boolean
}

export function VapidKeyChecker() {
  const [status, setStatus] = useState<VapidStatus>({
    publicKey: false,
    privateKey: false,
    subject: false,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkVapidKeys = async () => {
      try {
        // Check public key (client-side)
        const publicKey = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        // Check private key and subject (server-side)
        const response = await fetch("/api/push/check-vapid")
        const serverStatus = await response.json()

        setStatus({
          publicKey,
          privateKey: serverStatus.privateKey,
          subject: serverStatus.subject,
        })
      } catch (error) {
        console.error("[v0] Error checking VAPID keys:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkVapidKeys()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            VAPID 키 상태 확인 중...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const allConfigured = status.publicKey && status.privateKey && status.subject

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          VAPID 키 설정 상태
        </CardTitle>
        <CardDescription>푸시 알림을 위한 VAPID 키 설정 상태를 확인합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span>공개키 (NEXT_PUBLIC_VAPID_PUBLIC_KEY)</span>
          <Badge variant={status.publicKey ? "default" : "destructive"}>{status.publicKey ? "설정됨" : "미설정"}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>개인키 (VAPID_PRIVATE_KEY)</span>
          <Badge variant={status.privateKey ? "default" : "destructive"}>
            {status.privateKey ? "설정됨" : "미설정"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>연락처 (VAPID_SUBJECT)</span>
          <Badge variant={status.subject ? "default" : "destructive"}>{status.subject ? "설정됨" : "미설정"}</Badge>
        </div>
        {!allConfigured && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              VAPID 키가 완전히 설정되지 않았습니다.
              <code className="mx-1 px-1 bg-yellow-100 rounded">scripts/generate-vapid-keys.js</code>를 실행하여 키를
              생성하고 환경 변수를 설정하세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
