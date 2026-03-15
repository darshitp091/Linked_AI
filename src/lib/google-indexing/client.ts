import { google } from 'googleapis'

export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  try {
    const serviceAccountJson = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON

    if (!serviceAccountJson) {
      console.warn('[Google Indexing] No service account JSON found in ENV. Skipping indexing notification.')
      return
    }

    const credentials = JSON.parse(serviceAccountJson)
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/indexing']
    })

    const indexing = google.indexing({
      version: 'v3',
      auth
    })

    console.log(`[Google Indexing] Notifying Google about ${type}: ${url}...`)

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type
      }
    })

    console.log(`[Google Indexing] Successfully notified Google. Response:`, response.data)
    return response.data
  } catch (error) {
    console.error('[Google Indexing] Error notifying Google:', error)
    // Don't throw, just log. We don't want to break the whole flow if indexing fails.
  }
}
