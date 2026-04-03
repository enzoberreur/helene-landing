// Lightweight event tracking — batches events and sends to /api/track
// Never blocks UI, never throws, fails silently

type EventCategory = 'landing' | 'app' | 'community' | 'engagement'

interface TrackEvent {
  event: string
  category: EventCategory
  email?: string
  page?: string
  properties?: Record<string, unknown>
}

let queue: TrackEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function getEmail(): string {
  try {
    return JSON.parse(localStorage.getItem('helene_profile') || '{}').userEmail || ''
  } catch { return '' }
}

function flush() {
  if (queue.length === 0) return
  const batch = queue.splice(0, 10)
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: batch }),
  }).catch(() => {})
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flush()
    flushTimer = null
  }, 2000) // Batch events for 2 seconds before sending
}

export function track(event: string, category: EventCategory, properties?: Record<string, unknown>) {
  queue.push({
    event,
    category,
    email: getEmail(),
    page: window.location.pathname,
    properties,
  })
  scheduleFlush()
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

// ─── Pre-built tracking functions ───────────────────────

// Landing page
export const trackLanding = {
  pageView: () => track('page_view', 'landing'),
  scrollToSection: (section: string) => track('scroll_to_section', 'landing', { section }),
  clickWaitlist: () => track('click_waitlist', 'landing'),
  startSurvey: () => track('start_survey', 'landing'),
  completeSurvey: (periodStatus: string) => track('complete_survey', 'landing', { periodStatus }),
  signupComplete: () => track('signup_complete', 'landing'),
}

// App
export const trackApp = {
  open: () => track('app_open', 'app'),
  onboardingStart: () => track('onboarding_start', 'app'),
  onboardingStep: (step: number) => track('onboarding_step', 'app', { step }),
  onboardingComplete: () => track('onboarding_complete', 'app'),
  tabSwitch: (tab: string) => track('tab_switch', 'app', { tab }),
  checkInStart: () => track('checkin_start', 'app'),
  checkInComplete: (mood: number, symptomCount: number) => track('checkin_complete', 'app', { mood, symptomCount }),
  mrsStart: () => track('mrs_start', 'app'),
  mrsComplete: (totalScore: number, severity: string) => track('mrs_complete', 'app', { totalScore, severity }),
  treatmentAdd: (category: string) => track('treatment_add', 'app', { category }),
  articleOpen: (articleId: string) => track('article_open', 'app', { articleId }),
  calmToolStart: (exercise: string) => track('calm_tool_start', 'app', { exercise }),
  calmToolComplete: (exercise: string) => track('calm_tool_complete', 'app', { exercise }),
  doctorReportOpen: () => track('doctor_report_open', 'app'),
  profileOpen: () => track('profile_open', 'app'),
  feedbackSent: (text: string) => track('feedback_sent', 'engagement', { textLength: text.length }),
  surveyResponse: (surveyId: string, answers: string[]) => track('survey_response', 'engagement', { surveyId, answerLengths: answers.map(a => a.length) }),
}

// Community
export const trackCommunity = {
  view: () => track('community_view', 'community'),
  postView: (postId: string) => track('post_view', 'community', { postId }),
  postCreate: () => track('post_create', 'community'),
  commentCreate: (postId: string) => track('comment_create', 'community', { postId }),
  upvote: (postId: string) => track('upvote', 'community', { postId }),
  search: (query: string) => track('search', 'community', { queryLength: query.length }),
  tagFilter: (tag: string) => track('tag_filter', 'community', { tag }),
}

// AI
export const trackAI = {
  messagesSent: () => track('ai_message_sent', 'app'),
  quickAction: (action: string) => track('ai_quick_action', 'app', { action }),
}
