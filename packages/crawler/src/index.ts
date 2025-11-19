#!/usr/bin/env node

import { syncTourData } from "./sync.js"

console.log("🎯 Love Trip Crawler")
console.log("==================\n")

syncTourData().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})

