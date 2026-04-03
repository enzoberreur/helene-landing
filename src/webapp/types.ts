// Data models — ported from Swift models

export interface CheckInEntry {
  id: string
  date: string // ISO
  mood: number // 1-5
  symptoms: string[]
  sleepQuality: number // 0-5 (0 = not logged)
  energyLevel: number
  stressLevel: number
  triggers: string[]
  note: string
}

export interface MRSEntry {
  id: string
  date: string
  // Somatic
  hotFlashes: number // 0-4
  heartDiscomfort: number
  sleepProblems: number
  jointPain: number
  // Psychological
  depressiveMood: number
  irritability: number
  anxiety: number
  exhaustion: number
  // Urogenital
  sexualProblems: number
  bladderProblems: number
  vaginalDryness: number
}

export interface TreatmentEntry {
  id: string
  date: string
  category: 'hrt' | 'supplement' | 'lifestyle' | 'medication'
  name: string
  status: 'started' | 'stopped' | 'adjusted' | 'paused'
  note: string
}

export interface UserProfile {
  firstName: string
  journeyStage: string
  ageRange: string
  hrtStatus: string
  exerciseFrequency: string
  smokingStatus: string
  alcoholFrequency: string
  caffeineIntake: string
  selectedSymptoms: string[]
  primaryGoal: string
  medicalFollowUp: string
  communityPseudonym: string
  communityAvatarSeed: number
  accountCreatedAt: string
  onboardingComplete: boolean
}

export interface CommunityPost {
  id: string
  tags: string[]
  pseudonym: string
  avatarSeed: number
  title: string
  body: string
  timestamp: string
  upvotes: number
  hasUpvoted: boolean
  isBookmarked: boolean
  comments: CommunityComment[]
  poll?: CommunityPoll
  userVotedOption?: string
}

export interface CommunityComment {
  id: string
  pseudonym: string
  avatarSeed: number
  body: string
  timestamp: string
  replies: CommunityComment[]
}

export interface CommunityPoll {
  question: string
  options: PollOption[]
}

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

// Helpers

export function mrsScores(e: MRSEntry) {
  const somatic = e.hotFlashes + e.heartDiscomfort + e.sleepProblems + e.jointPain
  const psychological = e.depressiveMood + e.irritability + e.anxiety + e.exhaustion
  const urogenital = e.sexualProblems + e.bladderProblems + e.vaginalDryness
  const total = somatic + psychological + urogenital
  const severity = total <= 4 ? 'No/Little' : total <= 8 ? 'Mild' : total <= 15 ? 'Moderate' : 'Severe'
  return { somatic, psychological, urogenital, total, severity }
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

export function isSameWeek(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  return d >= startOfWeek
}

export const moodIcons: Record<number, string> = {
  5: '☀️', 4: '🌤️', 3: '☁️', 2: '🌧️', 1: '🌧️'
}

export const moodLabels: Record<number, string> = {
  5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Hard'
}

export const moodDescriptions: Record<number, string> = {
  5: 'Feeling great today',
  4: 'Having a good day',
  3: 'Getting through the day',
  2: 'A challenging day',
  1: "A tough day — you're not alone"
}

export const moodFills: Record<number, string> = {
  5: '#D0E8E4', 4: '#E4D0EC', 3: '#FCE4A8', 2: '#FCD4C8', 1: '#FCD4C8'
}

export const symptomsList = [
  { label: 'Sleep problems', id: 'sleep', icon: '🌙' },
  { label: 'Anxiety', id: 'anxiety', icon: '🧠' },
  { label: 'Fatigue', id: 'fatigue', icon: '💤' },
  { label: 'Hot flashes', id: 'hotflashes', icon: '🌡️' },
  { label: 'Brain fog', id: 'brainfog', icon: '🌫️' },
  { label: 'Mood swings', id: 'moodswings', icon: '🔄' },
  { label: 'Weight changes', id: 'weight', icon: '⚖️' },
  { label: 'Joint pain', id: 'jointpain', icon: '🦴' },
] as const

export const triggersList = [
  { label: 'Caffeine', id: 'coffee', icon: '☕' },
  { label: 'Alcohol', id: 'alcohol', icon: '🍷' },
  { label: 'Exercise', id: 'exercise', icon: '🏃‍♀️' },
  { label: 'Work stress', id: 'workstress', icon: '💼' },
  { label: 'Medication', id: 'medication', icon: '💊' },
  { label: 'Outdoor time', id: 'outdoor', icon: '☀️' },
  { label: 'Social time', id: 'social', icon: '👥' },
  { label: 'Disrupted sleep', id: 'disruptedsleep', icon: '🌙' },
] as const
