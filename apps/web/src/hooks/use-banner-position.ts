"use client"

import { useState, useEffect } from "react"

export function useBannerPosition(showBanner: boolean, otherBannerSelector: string) {
  const [bottomOffset, setBottomOffset] = useState(16) // 4rem = 16px

  useEffect(() => {
    if (!showBanner) {
      setBottomOffset(16)
      return
    }

    // 다른 배너가 표시되는지 확인
    const checkOtherBanner = () => {
      const otherBanner = document.querySelector(otherBannerSelector)
      
      if (otherBanner) {
        const otherHeight = (otherBanner as HTMLElement).offsetHeight
        setBottomOffset(16 + otherHeight + 16) // 다른 배너 높이 + 간격
      } else {
        setBottomOffset(16)
      }
    }

    // 초기 확인
    setTimeout(checkOtherBanner, 100)

    // 주기적으로 확인 (간단한 방법)
    const interval = setInterval(checkOtherBanner, 500)

    return () => clearInterval(interval)
  }, [showBanner, otherBannerSelector])

  return bottomOffset
}

