// Lightweight app i18n — no external deps, just a context + translations

import { createContext, useContext } from 'react'

export type AppLang = 'en' | 'fr'

// Detect language from browser or stored preference
export function detectLang(): AppLang {
  try {
    const stored = JSON.parse(localStorage.getItem('helene_profile') || '{}').lang
    if (stored === 'fr' || stored === 'en') return stored
  } catch {}
  const browserLang = navigator.language.slice(0, 2)
  return browserLang === 'fr' ? 'fr' : 'en'
}

export const LangContext = createContext<AppLang>('en')
export const useLang = () => useContext(LangContext)

// Translation function
export function useT() {
  const lang = useLang()
  return (key: string, vars?: Record<string, string | number>): string => {
    const dict = lang === 'fr' ? fr : en
    let text = (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }
}

// ─── English translations ───────────────────────

const en = {
  // Home
  'home.date_greeting': 'Hello, {name}.',
  'home.date_greeting_anon': 'Hello.',
  'home.feel_today': 'How do you',
  'home.feel_today_bold': 'feel today?',
  'home.reflection': 'Your reflection...',
  'home.todays_checkin': "Today's check-in",
  'home.edit': 'Edit',
  'home.weekly_ready': 'Weekly check-up ready',
  'home.weekly_desc': '11 questions · ~3 min',
  'home.cycle_tracking': 'Cycle tracking',
  'home.cycle_desc': 'Log your period, predict your next one',
  'home.treatments': 'Treatments & Changes',
  'home.treatments_empty': 'Tap + to log your first treatment or lifestyle change.',
  'home.for_you': 'For you',
  'home.calm_title': 'Quick calm tools',
  'home.calm_desc': 'Breathing · 1–5 min',
  'home.doctor_title': 'Prepare for your doctor',
  'home.doctor_desc': 'Generate report',
  'home.article1': 'Understanding your body',
  'home.article1_sub': "Learn what's happening",
  'home.article2': 'Track your patterns',
  'home.article2_sub': 'Spot what changes',
  'home.article3': 'Sleep disruption affects 68% of us',
  'home.article3_sub': 'Did you know? Tap to learn more',
  'home.this_week': 'THIS WEEK',

  // Guided tips
  'tip.day1.title': 'Day 1 — Just check in',
  'tip.day1.text': "Tap the card below to log how you feel. It takes 30 seconds. That's all for today.",
  'tip.day2.title': 'Keep going',
  'tip.day2.text': "You've logged your first check-in. Try adding symptoms tomorrow — that's where patterns start to show.",
  'tip.day3.title': 'Patterns emerging',
  'tip.day3.text': 'With 3+ check-ins, the Insights tab is starting to have real data. Take a look.',
  'tip.day7.title': 'One week of data',
  'tip.day7.text': "The Doctor Report now has substance. Try generating it — you'll be surprised how much your data says.",

  // Check-in
  'checkin.mood_title': 'How are you\nfeeling today?',
  'checkin.mood_sub': 'Be honest — this is just for you.',
  'checkin.great': 'Great', 'checkin.good': 'Good', 'checkin.okay': 'Okay', 'checkin.low': 'Low', 'checkin.hard': 'Hard',
  'checkin.wellbeing_title': 'A little more\nabout today',
  'checkin.wellbeing_sub': 'Optional — skip any row.',
  'checkin.symptoms_title': 'Any symptoms\ntoday?',
  'checkin.symptoms_sub': 'Select all that apply, or add your own.',
  'checkin.triggers_title': 'What may have\ninfluenced today?',
  'checkin.triggers_sub': 'Optional — helps spot patterns.',
  'checkin.note_title': "Anything you'd\nlike to add?",
  'checkin.note_sub': 'Optional — a few words or a lot more.',
  'checkin.note_placeholder': 'How was today?',
  'checkin.save': 'Save check-in',
  'checkin.continue': 'Continue',
  'checkin.back': 'Back',
  'checkin.saved': 'Check-in saved',
  'checkin.add_custom': 'Add your own symptom...',

  // Common
  'common.done': 'Done',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.send': 'Send',
  'common.close': 'Close',
  'common.delete': 'Delete',
  'common.loading': 'Loading...',

  // Community
  'community.title': 'Community',
  'community.search': 'Search posts...',
  'community.no_posts': 'No posts yet. Be the first to share.',
  'community.no_match': 'No posts match your filters.',
  'community.new_post': 'New Post',
  'community.write_comment': 'Write a comment...',
  'community.reply_to': 'Replying to {name}',

  // Insights
  'insights.title': 'Insights',
  'insights.empty': 'No check-ins in this period yet. Start logging to see your trends.',
  'insights.checkins': 'Check-ins',
  'insights.avg_mood': 'Avg mood',
  'insights.streak': 'Streak',
  'insights.mood_trend': 'Mood trend',
  'insights.mood_by_day': 'Mood by day',
  'insights.top_symptoms': 'Top symptoms',
  'insights.latest_mrs': 'Latest MRS score',

  // AI
  'ai.title': 'Hélène',
  'ai.subtitle': 'Your companion through the transition',
  'ai.welcome': "I'm here to help you understand your patterns, prepare for doctor visits, or just listen. What's on your mind?",
  'ai.placeholder': 'Message Hélène...',
  'ai.q1': 'How am I doing this week?',
  'ai.q2': 'What patterns do you see?',
  'ai.q3': 'Help me prepare for my doctor',
  'ai.q4': "I'm not feeling great today",

  // Profile
  'profile.sign_out': 'Sign out & clear data',
  'profile.feedback': 'Send feedback to the team',
  'profile.my_journey': 'My Journey',
  'profile.my_symptoms': 'My Symptoms',
  'profile.community_identity': 'Community Identity',

  // Period
  'period.title': 'Cycle',
  'period.next_expected': 'Next period expected ~{date}',
  'period.based_on': 'Based on your average {days}-day cycle',
  'period.avg_cycle': 'Avg cycle',
  'period.logged': 'Logged',
  'period.last': 'Last',
  'period.start_tracking': 'Start tracking your cycle',
  'period.start_desc': 'Tap any date on the calendar to log your period. After 2-3 cycles, Hélène will predict your next one and connect your symptoms to your cycle.',
  'period.log_today': 'Log today',
  'period.flow': 'Flow',
  'period.spotting': 'Spotting', 'period.light': 'Light', 'period.medium': 'Medium', 'period.heavy': 'Heavy',
  'period.end_date': 'Period end date (optional)',
  'period.notes': 'Notes (optional)',
  'period.notes_placeholder': 'Cramps, spotting pattern, anything notable...',
  'period.remove': 'Remove this period',
  'period.cycle_history': 'Cycle history',

  // Onboarding
  'onboard.journey': 'Where are you in your journey?',
  'onboard.journey_sub': 'This helps us personalise everything for you.',
  'onboard.regular': 'My periods are still regular',
  'onboard.irregular': "They've become irregular",
  'onboard.post': "They've stopped",
  'onboard.unsure': "I'm not sure",
  'onboard.age': "What's your age range?",
  'onboard.age_sub': 'Perimenopause affects different ages differently.',
  'onboard.symptoms': 'What symptoms have you noticed?',
  'onboard.symptoms_sub': 'Select all that apply.',
  'onboard.hrt': 'Are you on any hormonal treatment?',
  'onboard.hrt_sub': 'This helps us understand your situation.',
  'onboard.exercise': 'How often do you exercise?',
  'onboard.exercise_sub': 'Movement can significantly impact symptoms.',
  'onboard.habits': 'A few daily habits',
  'onboard.habits_sub': 'These can influence your symptoms — no judgment.',
  'onboard.goal': 'What matters most to you right now?',
  'onboard.goal_sub': "We'll tailor your experience.",
  'onboard.medical': 'Do you have medical support?',
  'onboard.medical_sub': 'A doctor or specialist following your transition?',
  'onboard.name': "What's your first name?",
  'onboard.name_sub': 'So Hélène can talk to you like a person.',
  'onboard.name_placeholder': 'Your first name',
  'onboard.begin': "Let's begin",
  // Symptoms options
  'onboard.sym.sleep': 'Sleep issues', 'onboard.sym.anxiety': 'Anxiety', 'onboard.sym.fatigue': 'Fatigue',
  'onboard.sym.hotflashes': 'Hot flashes', 'onboard.sym.brainfog': 'Brain fog', 'onboard.sym.moodswings': 'Mood swings',
  'onboard.sym.weight': 'Weight changes', 'onboard.sym.jointpain': 'Joint pain', 'onboard.sym.libido': 'Low libido', 'onboard.sym.dryness': 'Dryness',
  // HRT options
  'onboard.hrt.none': 'No, nothing', 'onboard.hrt.yes': 'Yes, HRT', 'onboard.hrt.natural': 'Natural / herbal remedies', 'onboard.hrt.considering': "I'm considering it",
  // Exercise options
  'onboard.ex.rarely': 'Rarely', 'onboard.ex.sometimes': 'Sometimes (1-2x/week)', 'onboard.ex.regularly': 'Regularly (3-4x/week)', 'onboard.ex.daily': 'Daily',
  // Habits labels
  'onboard.smoking': 'Smoking', 'onboard.alcohol': 'Alcohol', 'onboard.caffeine': 'Caffeine',
  'onboard.h.never': 'Never', 'onboard.h.former': 'Former', 'onboard.h.current': 'Current',
  'onboard.h.rarely': 'Rarely', 'onboard.h.occasionally': 'Occasionally', 'onboard.h.regularly': 'Regularly',
  'onboard.h.none': 'None', 'onboard.h.low': 'Low', 'onboard.h.moderate': 'Moderate', 'onboard.h.high': 'High',
  // Goal options
  'onboard.goal.understand': "Understanding what's happening to me", 'onboard.goal.community': 'Connecting with other women',
  'onboard.goal.track': 'Tracking my symptoms', 'onboard.goal.doctor': 'Preparing for my doctor',
  // Medical options
  'onboard.med.yes': 'Yes, regularly', 'onboard.med.sometimes': 'Sometimes', 'onboard.med.no': 'No',

  // Pseudonym
  'pseudo.title': 'Choose a pseudonym',
  'pseudo.desc': "This is how you'll appear in the community. Your real name stays private — share openly, without worrying.",
  'pseudo.placeholder': 'Your pseudonym',

  // Access
  'access.title': 'This app is invite-only',
  'access.desc': 'Enter the access code from your invitation email.',
  'access.placeholder': 'Access code',
  'access.enter': 'Enter',
  'access.invalid': 'Invalid code. Check your email.',

  // Install
  'install.title': 'Welcome to Hélène',
  'install.desc': 'Add Hélène to your home screen so it feels like a real app — fullscreen, always one tap away.',
  'install.button': 'Install Hélène',
  'install.skip': 'Continue without installing',
}

// ─── French translations ───────────────────────

const fr: Record<string, string> = {
  // Home
  'home.date_greeting': 'Bonjour, {name}.',
  'home.date_greeting_anon': 'Bonjour.',
  'home.feel_today': 'Comment vous',
  'home.feel_today_bold': 'sentez-vous ?',
  'home.reflection': 'Votre réflexion...',
  'home.todays_checkin': "Bilan du jour",
  'home.edit': 'Modifier',
  'home.weekly_ready': 'Bilan hebdomadaire prêt',
  'home.weekly_desc': '11 questions · ~3 min',
  'home.cycle_tracking': 'Suivi du cycle',
  'home.cycle_desc': 'Notez vos règles, prédisez les prochaines',
  'home.treatments': 'Traitements & changements',
  'home.treatments_empty': 'Appuyez sur + pour noter votre premier traitement.',
  'home.for_you': 'Pour vous',
  'home.calm_title': 'Outils de calme',
  'home.calm_desc': 'Respiration · 1–5 min',
  'home.doctor_title': 'Préparez votre rendez-vous',
  'home.doctor_desc': 'Générer un rapport',
  'home.article1': 'Comprendre votre corps',
  'home.article1_sub': 'Ce qui se passe vraiment',
  'home.article2': 'Suivez vos tendances',
  'home.article2_sub': 'Repérez ce qui change',
  'home.article3': '68 % des femmes ont des troubles du sommeil',
  'home.article3_sub': 'Le saviez-vous ? En savoir plus',
  'home.this_week': 'CETTE SEMAINE',

  // Guided tips
  'tip.day1.title': 'Jour 1 — Faites votre premier bilan',
  'tip.day1.text': "Appuyez sur la carte ci-dessous pour noter comment vous allez. 30 secondes, c'est tout.",
  'tip.day2.title': 'Continuez',
  'tip.day2.text': "Premier bilan fait. Essayez d'ajouter des symptômes demain — c'est là que les tendances apparaissent.",
  'tip.day3.title': 'Des tendances émergent',
  'tip.day3.text': "Avec 3+ bilans, l'onglet Insights commence à avoir de vraies données. Jetez un œil.",
  'tip.day7.title': 'Une semaine de données',
  'tip.day7.text': "Le Rapport Médecin a maintenant du contenu. Essayez de le générer — vos données parlent.",

  // Check-in
  'checkin.mood_title': 'Comment vous\nsentez-vous ?',
  'checkin.mood_sub': 'Soyez honnête — c\'est juste pour vous.',
  'checkin.great': 'Super', 'checkin.good': 'Bien', 'checkin.okay': 'Ça va', 'checkin.low': 'Difficile', 'checkin.hard': 'Dur',
  'checkin.wellbeing_title': 'Un peu plus\nsur aujourd\'hui',
  'checkin.wellbeing_sub': 'Optionnel — passez ce que vous voulez.',
  'checkin.symptoms_title': 'Des symptômes\naujourd\'hui ?',
  'checkin.symptoms_sub': 'Cochez tout ce qui s\'applique.',
  'checkin.triggers_title': 'Qu\'est-ce qui a pu\ninfluencer la journée ?',
  'checkin.triggers_sub': 'Optionnel — aide à repérer les tendances.',
  'checkin.note_title': 'Quelque chose\nà ajouter ?',
  'checkin.note_sub': 'Optionnel — quelques mots ou plus.',
  'checkin.note_placeholder': 'Comment s\'est passée la journée ?',
  'checkin.save': 'Enregistrer',
  'checkin.continue': 'Continuer',
  'checkin.back': 'Retour',
  'checkin.saved': 'Bilan enregistré',
  'checkin.add_custom': 'Ajoutez un symptôme...',

  // Common
  'common.done': 'Terminé',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.back': 'Retour',
  'common.next': 'Suivant',
  'common.send': 'Envoyer',
  'common.close': 'Fermer',
  'common.delete': 'Supprimer',
  'common.loading': 'Chargement...',

  // Community
  'community.title': 'Communauté',
  'community.search': 'Rechercher...',
  'community.no_posts': 'Aucun post. Soyez la première à partager.',
  'community.no_match': 'Aucun post ne correspond à vos filtres.',
  'community.new_post': 'Nouveau post',
  'community.write_comment': 'Écrire un commentaire...',
  'community.reply_to': 'Réponse à {name}',

  // Insights
  'insights.title': 'Tendances',
  'insights.empty': 'Pas encore de bilans. Commencez à noter pour voir vos tendances.',
  'insights.checkins': 'Bilans',
  'insights.avg_mood': 'Humeur moy.',
  'insights.streak': 'Série',
  'insights.mood_trend': 'Évolution de l\'humeur',
  'insights.mood_by_day': 'Humeur par jour',
  'insights.top_symptoms': 'Symptômes fréquents',
  'insights.latest_mrs': 'Dernier score MRS',

  // AI
  'ai.title': 'Hélène',
  'ai.subtitle': 'Votre compagne dans cette transition',
  'ai.welcome': "Je suis là pour vous aider à comprendre ce que vous vivez, préparer vos rendez-vous médicaux, ou simplement écouter. Qu'est-ce qui vous occupe ?",
  'ai.placeholder': 'Écrire à Hélène...',
  'ai.q1': 'Comment je vais cette semaine ?',
  'ai.q2': 'Quelles tendances tu vois ?',
  'ai.q3': 'Aide-moi à préparer mon rendez-vous',
  'ai.q4': 'Je ne me sens pas bien aujourd\'hui',

  // Profile
  'profile.sign_out': 'Déconnexion & effacer les données',
  'profile.feedback': 'Envoyer un retour à l\'équipe',
  'profile.my_journey': 'Mon parcours',
  'profile.my_symptoms': 'Mes symptômes',
  'profile.community_identity': 'Identité communauté',

  // Period
  'period.title': 'Cycle',
  'period.next_expected': 'Prochaines règles attendues ~{date}',
  'period.based_on': 'Basé sur votre cycle moyen de {days} jours',
  'period.avg_cycle': 'Cycle moy.',
  'period.logged': 'Notées',
  'period.last': 'Dernières',
  'period.start_tracking': 'Commencez à suivre votre cycle',
  'period.start_desc': 'Appuyez sur une date pour noter vos règles. Après 2-3 cycles, Hélène prédira les prochaines et reliera vos symptômes à votre cycle.',
  'period.log_today': 'Noter aujourd\'hui',
  'period.flow': 'Flux',
  'period.spotting': 'Spotting', 'period.light': 'Léger', 'period.medium': 'Moyen', 'period.heavy': 'Abondant',
  'period.end_date': 'Date de fin (optionnel)',
  'period.notes': 'Notes (optionnel)',
  'period.notes_placeholder': 'Crampes, schéma de spotting, tout ce qui est notable...',
  'period.remove': 'Supprimer cette période',
  'period.cycle_history': 'Historique des cycles',

  // Onboarding
  'onboard.journey': 'Où en êtes-vous ?',
  'onboard.journey_sub': 'Ça nous aide à tout personnaliser.',
  'onboard.regular': 'Mes règles sont encore régulières',
  'onboard.irregular': 'Elles sont devenues irrégulières',
  'onboard.post': 'Elles se sont arrêtées',
  'onboard.unsure': 'Je ne suis pas sûre',
  'onboard.age': 'Quelle est votre tranche d\'âge ?',
  'onboard.age_sub': 'La périménopause touche chaque âge différemment.',
  'onboard.symptoms': 'Quels symptômes avez-vous remarqués ?',
  'onboard.symptoms_sub': 'Cochez tout ce qui s\'applique.',
  'onboard.hrt': 'Prenez-vous un traitement hormonal ?',
  'onboard.hrt_sub': 'Ça nous aide à comprendre votre situation.',
  'onboard.exercise': 'À quelle fréquence faites-vous du sport ?',
  'onboard.exercise_sub': 'Le mouvement peut beaucoup influencer les symptômes.',
  'onboard.habits': 'Quelques habitudes quotidiennes',
  'onboard.habits_sub': 'Elles peuvent influencer vos symptômes — sans jugement.',
  'onboard.goal': 'Qu\'est-ce qui compte le plus pour vous ?',
  'onboard.goal_sub': 'On adaptera votre expérience.',
  'onboard.medical': 'Avez-vous un suivi médical ?',
  'onboard.medical_sub': 'Un médecin ou spécialiste qui suit votre transition ?',
  'onboard.name': 'C\'est quoi votre prénom ?',
  'onboard.name_sub': 'Pour qu\'Hélène puisse vous parler comme à une vraie personne.',
  'onboard.name_placeholder': 'Votre prénom',
  'onboard.begin': 'C\'est parti',
  // Symptoms
  'onboard.sym.sleep': 'Sommeil', 'onboard.sym.anxiety': 'Anxiété', 'onboard.sym.fatigue': 'Fatigue',
  'onboard.sym.hotflashes': 'Bouffées de chaleur', 'onboard.sym.brainfog': 'Brouillard mental', 'onboard.sym.moodswings': 'Sautes d\'humeur',
  'onboard.sym.weight': 'Poids', 'onboard.sym.jointpain': 'Douleurs articulaires', 'onboard.sym.libido': 'Libido', 'onboard.sym.dryness': 'Sécheresse',
  // HRT
  'onboard.hrt.none': 'Non, rien', 'onboard.hrt.yes': 'Oui, THS', 'onboard.hrt.natural': 'Remèdes naturels', 'onboard.hrt.considering': 'J\'y réfléchis',
  // Exercise
  'onboard.ex.rarely': 'Rarement', 'onboard.ex.sometimes': 'Parfois (1-2x/sem)', 'onboard.ex.regularly': 'Régulièrement (3-4x/sem)', 'onboard.ex.daily': 'Tous les jours',
  // Habits
  'onboard.smoking': 'Tabac', 'onboard.alcohol': 'Alcool', 'onboard.caffeine': 'Caféine',
  'onboard.h.never': 'Jamais', 'onboard.h.former': 'Ancien', 'onboard.h.current': 'Actuel',
  'onboard.h.rarely': 'Rarement', 'onboard.h.occasionally': 'Occasionnel', 'onboard.h.regularly': 'Régulier',
  'onboard.h.none': 'Aucune', 'onboard.h.low': 'Peu', 'onboard.h.moderate': 'Modérée', 'onboard.h.high': 'Beaucoup',
  // Goals
  'onboard.goal.understand': 'Comprendre ce qui m\'arrive', 'onboard.goal.community': 'Échanger avec d\'autres femmes',
  'onboard.goal.track': 'Suivre mes symptômes', 'onboard.goal.doctor': 'Préparer mes rendez-vous médicaux',
  // Medical
  'onboard.med.yes': 'Oui, régulièrement', 'onboard.med.sometimes': 'Parfois', 'onboard.med.no': 'Non',

  // Pseudonym
  'pseudo.title': 'Choisissez un pseudonyme',
  'pseudo.desc': 'C\'est comme ça que vous apparaîtrez dans la communauté. Votre vrai nom reste privé — partagez librement.',
  'pseudo.placeholder': 'Votre pseudonyme',

  // Access
  'access.title': 'Accès sur invitation',
  'access.desc': 'Entrez le code d\'accès reçu par email.',
  'access.placeholder': 'Code d\'accès',
  'access.enter': 'Entrer',
  'access.invalid': 'Code invalide. Vérifiez votre email.',

  // Install
  'install.title': 'Bienvenue sur Hélène',
  'install.desc': 'Ajoutez Hélène à votre écran d\'accueil pour une expérience comme une vraie app — plein écran, toujours à un tap.',
  'install.button': 'Installer Hélène',
  'install.skip': 'Continuer sans installer',
}
