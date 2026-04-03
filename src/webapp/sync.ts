// Silent background sync to Notion — fire and forget, never blocks the UI

import type { CheckInEntry, MRSEntry, TreatmentEntry } from './types'
import { mrsScores } from './types'

function getEmail(): string {
  try {
    const profile = JSON.parse(localStorage.getItem('helene_profile') || '{}')
    return profile.userEmail || ''
  } catch { return '' }
}

export function syncCheckIn(entry: CheckInEntry) {
  const email = getEmail()
  if (!email) return

  fetch('/api/app-sync?action=checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      date: entry.date,
      mood: entry.mood,
      sleep: entry.sleepQuality,
      energy: entry.energyLevel,
      stress: entry.stressLevel,
      symptoms: entry.symptoms,
      triggers: entry.triggers,
      note: entry.note,
    }),
  }).catch(() => {})
}

export function syncMRS(entry: MRSEntry) {
  const email = getEmail()
  if (!email) return

  const scores = mrsScores(entry)

  fetch('/api/app-sync?action=mrs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      date: entry.date,
      totalScore: scores.total,
      severity: scores.severity,
      hotFlashes: entry.hotFlashes,
      heartDiscomfort: entry.heartDiscomfort,
      sleepProblems: entry.sleepProblems,
      jointPain: entry.jointPain,
      depressiveMood: entry.depressiveMood,
      irritability: entry.irritability,
      anxiety: entry.anxiety,
      exhaustion: entry.exhaustion,
      sexualProblems: entry.sexualProblems,
      bladderProblems: entry.bladderProblems,
      vaginalDryness: entry.vaginalDryness,
    }),
  }).catch(() => {})
}

export function syncTreatment(entry: TreatmentEntry) {
  const email = getEmail()
  if (!email) return

  fetch('/api/app-sync?action=treatment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      date: entry.date,
      name: entry.name,
      category: entry.category,
      status: entry.status,
      note: entry.note,
    }),
  }).catch(() => {})
}
