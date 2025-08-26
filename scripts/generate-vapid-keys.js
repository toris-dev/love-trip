const webpush = require("web-push")

// VAPID 키 쌍 생성
const vapidKeys = webpush.generateVAPIDKeys()

console.log("=== VAPID Keys Generated ===")
console.log("Public Key:", vapidKeys.publicKey)
console.log("Private Key:", vapidKeys.privateKey)
console.log("")
console.log("=== Environment Variables ===")
console.log("Add these to your Vercel project settings:")
console.log("")
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + vapidKeys.publicKey)
console.log("VAPID_PRIVATE_KEY=" + vapidKeys.privateKey)
console.log("")
console.log("=== Contact Information ===")
console.log("Also add your contact email:")
console.log("VAPID_SUBJECT=mailto:your-email@example.com")
