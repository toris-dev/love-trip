"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/service-worker-register"

export function ServiceWorkerScript() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return null
}

