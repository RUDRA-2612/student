import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  
  if (posthogKey && posthogKey !== 'phc_posthog_client_key') {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false
    })
  } else {
    console.log('[MOCK POSTHOG] Analytics initialized in mock mode.')
  }
}

export { posthog }
