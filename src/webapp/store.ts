// LocalStorage-backed store — mirrors SwiftData + UserDefaults

import { useState, useCallback } from 'react'
import type { CheckInEntry, MRSEntry, TreatmentEntry, UserProfile, CommunityPost, ChatMessage, PeriodEntry } from './types'
import { syncCheckIn, syncMRS, syncTreatment } from './sync'

const KEYS = {
  profile: 'helene_profile',
  checkIns: 'helene_checkins',
  mrs: 'helene_mrs',
  periods: 'helene_periods',
  treatments: 'helene_treatments',
  posts: 'helene_posts',
  chat: 'helene_chat',
} as const

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data))
}

// Default profile
const defaultProfile: UserProfile = {
  firstName: '',
  userEmail: '',
  lang: '',
  journeyStage: '',
  ageRange: '',
  hrtStatus: '',
  exerciseFrequency: '',
  smokingStatus: 'never',
  alcoholFrequency: 'rarely',
  caffeineIntake: 'moderate',
  selectedSymptoms: [],
  primaryGoal: '',
  medicalFollowUp: '',
  communityPseudonym: '',
  communityAvatarSeed: Math.floor(Math.random() * 1000),
  accountCreatedAt: new Date().toISOString(),
  onboardingComplete: false,
}

// Seed community posts
const seedPosts: CommunityPost[] = [
  {
    id: 'seed-1', tags: ['sleep'], pseudonym: 'NightOwl42', avatarSeed: 101,
    title: 'Anyone else wide awake at 3am every single night?',
    body: "It started about 6 months ago. I fall asleep fine but wake up at 3am like clockwork. My mind starts racing about everything. I've tried melatonin, herbal tea, even meditation apps. Nothing works consistently. Is this perimenopause or am I just stressed?",
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    upvotes: 24, hasUpvoted: false, isBookmarked: false,
    comments: [
      { id: 'c1', pseudonym: 'MoonWalker', avatarSeed: 202, body: "Same here! My doctor said it's very common in perimenopause. The 3am wake-up is almost a signature symptom.", timestamp: new Date(Date.now() - 86400000).toISOString(), replies: [] }
    ],
  },
  {
    id: 'seed-2', tags: ['mind'], pseudonym: 'ClearSkies', avatarSeed: 303,
    title: "The brain fog is making me doubt myself at work",
    body: "I'm a project manager and I used to be sharp. Now I forget words mid-sentence, lose track of what I was doing, and feel like I'm moving through molasses. Has anyone found anything that actually helps with brain fog?",
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    upvotes: 31, hasUpvoted: false, isBookmarked: false,
    comments: [
      { id: 'c2', pseudonym: 'FogLifter', avatarSeed: 404, body: 'Exercise has been the only thing that consistently helps mine. Even a 20-minute walk makes a difference.', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), replies: [] }
    ],
  },
  {
    id: 'seed-3', tags: ['body'], pseudonym: 'WarmWave', avatarSeed: 505,
    title: 'Hot flashes in meetings — how do you cope?',
    body: "Had my first hot flash during a client presentation. I turned beet red and couldn't concentrate. Any tips for managing these in professional settings?",
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    upvotes: 18, hasUpvoted: false, isBookmarked: false, comments: [],
  },
  {
    id: 'seed-4', tags: ['relationships'], pseudonym: 'HonestHeart', avatarSeed: 606,
    title: 'How do you explain this to your partner?',
    body: "My husband thinks I'm just being moody. He doesn't understand why I'm suddenly anxious, exhausted, and have zero libido. I don't even fully understand it myself. How have you talked to your partners about perimenopause?",
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
    upvotes: 42, hasUpvoted: false, isBookmarked: false,
    comments: [
      { id: 'c3', pseudonym: 'TeamWork', avatarSeed: 707, body: "I sat down with mine and showed him a list of 34 symptoms. His jaw dropped. Sometimes they just need to see the facts.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), replies: [] }
    ],
  },
  {
    id: 'seed-5', tags: ['work'], pseudonym: 'QuietStorm', avatarSeed: 808,
    title: 'Taking a mental health day because of perimenopause — is that okay?',
    body: "Some days I just can't. The fatigue, the anxiety, the feeling of being overwhelmed. I called in sick today and I feel guilty. Does anyone else do this?",
    timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
    upvotes: 56, hasUpvoted: false, isBookmarked: false, comments: [],
    poll: {
      question: 'Have you taken time off because of perimenopause symptoms?',
      options: [
        { id: 'p1', text: 'Yes, and I was honest about why', votes: 12 },
        { id: 'p2', text: 'Yes, but I said something else', votes: 34 },
        { id: 'p3', text: "No, but I've wanted to", votes: 28 },
        { id: 'p4', text: "No, my symptoms don't affect work", votes: 8 },
      ],
    },
  },
  {
    id: 'seed-6', tags: ['lounge'], pseudonym: 'SilverLining', avatarSeed: 909,
    title: "What's one good thing about this week?",
    body: "I'll start: I finally slept 6 hours straight for the first time in months. It felt like winning the lottery. Your turn ✨",
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
    upvotes: 38, hasUpvoted: false, isBookmarked: false,
    comments: [
      { id: 'c4', pseudonym: 'GardenGal', avatarSeed: 111, body: 'I went for a hike and forgot about my symptoms for 3 whole hours. Nature therapy is real.', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), replies: [] }
    ],
  },
]

// Hooks

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(() => load(KEYS.profile, defaultProfile))

  const setProfile = useCallback((updater: (prev: UserProfile) => UserProfile) => {
    setProfileState(prev => {
      const next = updater(prev)
      save(KEYS.profile, next)
      return next
    })
  }, [])

  return { profile, setProfile }
}

export function useCheckIns() {
  const [entries, setEntries] = useState<CheckInEntry[]>(() => load(KEYS.checkIns, []))

  const addEntry = useCallback((entry: CheckInEntry) => {
    setEntries(prev => {
      const next = [entry, ...prev]
      save(KEYS.checkIns, next)
      return next
    })
    syncCheckIn(entry)
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<CheckInEntry>) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updates } : e)
      save(KEYS.checkIns, next)
      return next
    })
  }, [])

  return { entries, addEntry, updateEntry }
}

export function useMRS() {
  const [entries, setEntries] = useState<MRSEntry[]>(() => load(KEYS.mrs, []))

  const addEntry = useCallback((entry: MRSEntry) => {
    setEntries(prev => {
      const next = [entry, ...prev]
      save(KEYS.mrs, next)
      return next
    })
    syncMRS(entry)
  }, [])

  return { entries, addEntry }
}

export function useTreatments() {
  const [entries, setEntries] = useState<TreatmentEntry[]>(() => load(KEYS.treatments, []))

  const addEntry = useCallback((entry: TreatmentEntry) => {
    setEntries(prev => {
      const next = [entry, ...prev]
      save(KEYS.treatments, next)
      return next
    })
    syncTreatment(entry)
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id)
      save(KEYS.treatments, next)
      return next
    })
  }, [])

  return { entries, addEntry, deleteEntry }
}

export function usePosts() {
  const [posts, setPosts] = useState<CommunityPost[]>(() => load(KEYS.posts, seedPosts))

  const savePosts = useCallback((next: CommunityPost[]) => {
    setPosts(next)
    save(KEYS.posts, next)
  }, [])

  const toggleUpvote = useCallback((id: string) => {
    setPosts(prev => {
      const next = prev.map(p => {
        if (p.id !== id) return p
        return { ...p, hasUpvoted: !p.hasUpvoted, upvotes: p.hasUpvoted ? p.upvotes - 1 : p.upvotes + 1 }
      })
      save(KEYS.posts, next)
      return next
    })
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setPosts(prev => {
      const next = prev.map(p => p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p)
      save(KEYS.posts, next)
      return next
    })
  }, [])

  const addPost = useCallback((post: CommunityPost) => {
    setPosts(prev => {
      const next = [post, ...prev]
      save(KEYS.posts, next)
      return next
    })
  }, [])

  const addComment = useCallback((postId: string, comment: { id: string; pseudonym: string; avatarSeed: number; body: string }) => {
    setPosts(prev => {
      const next = prev.map(p => {
        if (p.id !== postId) return p
        return { ...p, comments: [...p.comments, { ...comment, timestamp: new Date().toISOString(), replies: [] }] }
      })
      save(KEYS.posts, next)
      return next
    })
  }, [])

  return { posts, savePosts, toggleUpvote, toggleBookmark, addPost, addComment }
}

export function usePeriods() {
  const [entries, setEntries] = useState<PeriodEntry[]>(() => load(KEYS.periods, []))

  const addEntry = useCallback((entry: PeriodEntry) => {
    setEntries(prev => {
      const next = [entry, ...prev].sort((a, b) => b.startDate.localeCompare(a.startDate))
      save(KEYS.periods, next)
      return next
    })
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<PeriodEntry>) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...updates } : e)
      save(KEYS.periods, next)
      return next
    })
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id)
      save(KEYS.periods, next)
      return next
    })
  }, [])

  return { entries, addEntry, updateEntry, deleteEntry }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => load(KEYS.chat, []))

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => {
      const next = [...prev, msg]
      save(KEYS.chat, next)
      return next
    })
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    save(KEYS.chat, [])
  }, [])

  return { messages, addMessage, clearChat }
}
