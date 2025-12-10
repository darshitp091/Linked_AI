// Local Development Scheduler
// This script runs in development to simulate Vercel cron jobs
// It calls the publish-scheduled endpoint every minute

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const CRON_SECRET = process.env.CRON_SECRET
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!CRON_SECRET) {
  console.error('❌ CRON_SECRET not found in environment')
  process.exit(1)
}

console.log('🚀 Local Scheduler Started')
console.log(`📡 Checking for scheduled posts every minute...`)
console.log(`🔗 API URL: ${API_URL}`)
console.log('---')

async function triggerCron() {
  try {
    const response = await fetch(`${API_URL}/api/cron/publish-scheduled`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    })

    const data = await response.json()
    const timestamp = new Date().toLocaleTimeString()

    if (data.published > 0) {
      console.log(`✅ [${timestamp}] Published ${data.published} post(s)`)
      console.log(`   Details:`, data.results)
    } else {
      console.log(`⏳ [${timestamp}] No posts to publish`)
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString()
    console.error(`❌ [${timestamp}] Error:`, error.message)
  }
}

// Run immediately on start
triggerCron()

// Then run every minute (60 seconds)
setInterval(triggerCron, 60 * 1000)

console.log('✨ Scheduler is running. Press Ctrl+C to stop.\n')
