import { theme } from '../theme'

interface ArticleSection { heading?: string; body: string }
interface Article { id: string; title: string; subtitle: string; fill: string; readTime: string; sections: ArticleSection[] }

export const articles: Article[] = [
  {
    id: 'understanding-body', title: 'Understanding your body',
    subtitle: "What's really happening during perimenopause",
    fill: theme.lavenderFill, readTime: '4 min read',
    sections: [
      { body: "If your body feels like it's changing in ways you don't recognise, that's because it is. Perimenopause isn't a sudden event — it's a gradual hormonal shift that can begin years before your last period, often in your early 40s (sometimes sooner)." },
      { heading: "What's actually happening", body: "Your ovaries begin producing less oestrogen and progesterone. These hormones don't just regulate your cycle — they influence your brain, bones, cardiovascular system, skin, and mood. As levels fluctuate unpredictably, your body adapts, and that adaptation is what you feel as symptoms.\n\nOestrogen affects serotonin and dopamine pathways, which is why mood and sleep can shift dramatically. It also regulates your body's thermostat, explaining why hot flashes can strike out of nowhere." },
      { heading: 'Common symptoms — and why they happen', body: "Hot flashes occur because falling oestrogen confuses the hypothalamus, your internal thermostat. It reads normal body temperature as too warm and triggers sweating to cool you down.\n\nBrain fog is real and documented. Oestrogen supports cognitive function, and its fluctuation can temporarily affect memory and concentration — not permanently, but enough to be unsettling.\n\nJoint aches, heart palpitations, anxiety, skin changes, and irregular periods are all part of the same hormonal story." },
      { heading: 'How long does this last?', body: "Perimenopause typically lasts 4 to 10 years. Menopause itself is defined as 12 consecutive months without a period. After that, you're in post-menopause — and for many women, symptoms gradually ease.\n\nBut every journey is different. Some women have mild symptoms for a few years; others experience significant disruption for longer." },
      { heading: 'What can help', body: "Lifestyle factors make a real difference: regular movement, especially strength training and yoga; a diet rich in phytoestrogens (flaxseeds, soy, legumes); reducing alcohol and processed sugar; and prioritising sleep.\n\nFor moderate to severe symptoms, HRT (Hormone Replacement Therapy) is the most evidence-based medical treatment available. Speak to a menopause-informed GP or gynaecologist about your options — the conversation is worth having." },
    ],
  },
  {
    id: 'track-patterns', title: 'Track your patterns',
    subtitle: 'Why logging symptoms changes everything',
    fill: theme.marigoldFill, readTime: '3 min read',
    sections: [
      { body: "One of the most powerful things you can do during perimenopause is also one of the simplest: pay attention. Not obsessively — but intentionally. Tracking your symptoms, mood, sleep, and energy creates a picture that's impossible to hold in memory alone." },
      { heading: 'The fog makes it harder to remember', body: "Brain fog is a real symptom of perimenopause — and it makes it genuinely difficult to recall how you felt last week, let alone last month. Writing it down isn't just helpful; it compensates for something your brain is temporarily less equipped to do on its own." },
      { heading: 'What to track', body: "You don't need to log everything. Focus on:\n\n• Mood (a single 1–5 rating is enough)\n• Sleep quality\n• Physical symptoms (hot flashes, joint pain, headaches)\n• Energy level\n• Notable triggers (alcohol, stress, certain foods)\n\nEven 30 seconds a day adds up to meaningful data over weeks." },
      { heading: 'Finding your triggers', body: "Patterns only become visible with time. You might notice that hot flashes peak around specific cycle days, or that anxiety spikes after poor sleep, or that certain foods reliably disrupt your rest. Without a log, these connections are invisible. With one, they become actionable." },
      { heading: 'Preparing for your doctor', body: "A symptom log transforms a 10-minute appointment. Instead of trying to describe 'how you've been feeling lately', you can show your doctor concrete data: frequency, severity, duration, and context. Many women report that their appointments become dramatically more productive once they arrive with written records.\n\nYour Hélène check-in history is yours to reference and share whenever you're ready." },
    ],
  },
  {
    id: 'sleep-menopause', title: 'Sleep & menopause',
    subtitle: 'Why you wake at 3am — and what to do',
    fill: theme.sageFill, readTime: '4 min read',
    sections: [
      { body: "Sleep disruption affects up to 68% of women in perimenopause. If you're waking at 3am, lying awake for an hour or two, or waking drenched in sweat — you're not imagining it, and it's not stress alone. There are clear biological reasons this happens." },
      { heading: 'Why sleep changes during menopause', body: "Oestrogen and progesterone both play roles in sleep regulation. Progesterone has a mild sedative effect — as it drops, falling asleep becomes harder. Oestrogen influences REM sleep and emotional regulation.\n\nNight sweats are the most disruptive factor for many women: your body's overactive thermostat wakes you up to cool you down. Once awake at 3am, cortisol (your morning alert hormone) is already beginning to rise, making it genuinely difficult to fall back asleep." },
      { heading: 'Evidence-based strategies', body: "Temperature control is the highest-impact change most women can make. Keep your bedroom at 16–18°C. Use moisture-wicking bedding. A cooling pillow or fan pointed at you can make a significant difference.\n\nSleep hygiene matters more during menopause: consistent wake times (even on weekends), no screens 90 minutes before bed, and limiting alcohol — which fragments sleep and worsens night sweats despite feeling like a relaxant.\n\nMagnesium glycinate (300–400mg before bed) has emerging evidence for improving sleep quality and reducing anxiety. Speak to your doctor before starting any supplement.\n\nMind-body practices — yoga nidra, progressive muscle relaxation, or even slow breathing — activate the parasympathetic nervous system and can ease the hyperarousal that keeps you awake." },
      { heading: 'When to seek help', body: "If sleep disruption is significantly affecting your daily functioning, it's worth discussing with a doctor. Cognitive Behavioural Therapy for Insomnia (CBT-I) is the gold-standard non-hormonal treatment. HRT, if appropriate for you, often dramatically improves sleep by addressing night sweats at their hormonal root.\n\nPoor sleep is not something to push through. It compounds every other symptom — mood, cognition, pain tolerance, weight. Treating it is treating everything." },
    ],
  },
]

export default function ArticleView({ articleId, onClose }: { articleId: string; onClose: () => void }) {
  const article = articles.find(a => a.id === articleId)
  if (!article) return null

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: theme.background }}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Hero header */}
        <div className="px-6 py-8" style={{ background: article.fill }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: theme.textSecondary }}>{article.readTime}</p>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textPrimary }}>{article.title}</h1>
          <p className="text-base leading-relaxed" style={{ color: theme.textSecondary }}>{article.subtitle}</p>
        </div>

        {/* Sections */}
        <div className="px-6 pt-8 pb-12">
          {article.sections.map((section, i) => (
            <div key={i} className="mb-8">
              {section.heading && (
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>{section.heading}</h3>
              )}
              <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: theme.textSecondary }}>{section.body}</p>
            </div>
          ))}

          {/* Disclaimer */}
          <div className="flex gap-2.5 p-4 rounded-2xl" style={{ background: theme.surface }}>
            <div className="w-1 rounded-full flex-shrink-0" style={{ background: theme.separator }} />
            <p className="text-xs leading-5" style={{ color: theme.textLight }}>
              This article is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional about your symptoms.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 pt-2">
        <button onClick={onClose} className="w-full py-4 rounded-2xl font-semibold text-sm" style={{ background: theme.surface, color: theme.textSecondary }}>
          Back
        </button>
      </div>
    </div>
  )
}
