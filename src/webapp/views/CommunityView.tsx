import { useState, useEffect, useCallback } from 'react'
import { theme } from '../theme'
import { useApp } from '../WebApp'

interface Comment {
  id: string
  pseudonym: string
  avatarSeed: number
  body: string
  timestamp: string
  parentCommentId: string
  replies: Comment[]
}

interface Post {
  id: string
  title: string
  body: string
  pseudonym: string
  avatarSeed: number
  tags: string[]
  upvotes: number
  timestamp: string
  comments: Comment[]
  poll: { question: string; options: { id: string; text: string; votes: number }[] } | null
  // Local-only state
  hasUpvoted: boolean
  isBookmarked: boolean
}

const channelTags = [
  { id: 'all', label: 'All' },
  { id: 'sleep', label: 'Sleep & Rest' },
  { id: 'mind', label: 'Mind & Mood' },
  { id: 'body', label: 'Body Talk' },
  { id: 'work', label: 'Work & Life' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'lounge', label: 'The Lounge' },
]

export default function CommunityView() {
  const { profile } = useApp()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState('all')
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot')
  const [viewingPost, setViewingPost] = useState<string | null>(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load upvoted/bookmarked state from localStorage
  const getLocalState = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('helene_community_state') || '{}') as Record<string, { upvoted?: boolean; bookmarked?: boolean }>
    } catch { return {} }
  }, [])

  const saveLocalState = useCallback((state: Record<string, { upvoted?: boolean; bookmarked?: boolean }>) => {
    localStorage.setItem('helene_community_state', JSON.stringify(state))
  }, [])

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/community?action=list')
      if (!res.ok) {
        console.error('Community API error:', res.status, await res.text())
        setLoading(false)
        return
      }
      const data = await res.json() as { posts?: Omit<Post, 'hasUpvoted' | 'isBookmarked'>[] }
      if (!data.posts || !Array.isArray(data.posts)) {
        console.error('Community API returned invalid data:', data)
        setLoading(false)
        return
      }
      const localState = getLocalState()
      setPosts(data.posts.map(p => ({
        ...p,
        hasUpvoted: localState[p.id]?.upvoted ?? false,
        isBookmarked: localState[p.id]?.bookmarked ?? false,
      })))
    } catch (e) {
      console.error('Failed to fetch posts:', e)
    } finally {
      setLoading(false)
    }
  }, [getLocalState])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleUpvote = async (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const newUpvoted = !post.hasUpvoted
    const delta = newUpvoted ? 1 : -1

    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, hasUpvoted: newUpvoted, upvotes: p.upvotes + delta } : p))
    const state = getLocalState()
    state[postId] = { ...state[postId], upvoted: newUpvoted }
    saveLocalState(state)

    await fetch('/api/community?action=upvote', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, delta }),
    })
  }

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    const state = getLocalState()
    const post = posts.find(p => p.id === postId)
    state[postId] = { ...state[postId], bookmarked: !(post?.isBookmarked) }
    saveLocalState(state)
  }

  const handleNewPost = async (data: { title: string; body: string; tags: string[] }) => {
    await fetch('/api/community?action=post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        pseudonym: profile.communityPseudonym || profile.firstName || 'Anonymous',
        avatarSeed: profile.communityAvatarSeed,
      }),
    })
    setShowNewPost(false)
    fetchPosts()
  }

  const handleComment = async (postId: string, body: string, parentCommentId?: string) => {
    await fetch('/api/community?action=comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        body,
        pseudonym: profile.communityPseudonym || profile.firstName || 'Anonymous',
        avatarSeed: profile.communityAvatarSeed,
        parentCommentId: parentCommentId ?? '',
      }),
    })
    fetchPosts()
  }

  const handleEditPost = async (postId: string, data: { title: string; body: string; tags: string[] }) => {
    await fetch('/api/community?action=edit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, ...data }),
    })
    fetchPosts()
  }

  const handleDeletePost = async (postId: string) => {
    await fetch('/api/community?action=delete', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    fetchPosts()
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchPosts()
  }

  const filtered = posts
    .filter(p => selectedTag === 'all' || p.tags.includes(selectedTag))
    .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.body.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'new') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      if (sort === 'top') return b.upvotes - a.upvotes
      return (b.upvotes + b.comments.length * 2) - (a.upvotes + a.comments.length * 2)
    })

  if (viewingPost) {
    const post = posts.find(p => p.id === viewingPost)
    if (post) return (
      <PostDetail
        post={post}
        onBack={() => setViewingPost(null)}
        onUpvote={() => handleUpvote(post.id)}
        onBookmark={() => handleBookmark(post.id)}
        onComment={(body, parentId) => handleComment(post.id, body, parentId)}
        onEdit={(data) => handleEditPost(post.id, data)}
        onDelete={() => { handleDeletePost(post.id); setViewingPost(null) }}
        isOwner={post.pseudonym === (profile.communityPseudonym || profile.firstName)}
      />
    )
  }

  if (showNewPost) {
    return <NewPostView onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} />
  }

  return (
    <div className="px-6 pt-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Community</h1>
        <button onClick={handleRefresh} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surface }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" strokeLinecap="round" className={loading ? 'animate-spin' : ''}>
            <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
        </button>
      </div>

      <input
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search posts..."
        className="w-full px-4 py-2.5 rounded-2xl text-sm mb-4 focus:outline-none"
        style={{ background: theme.surface, color: theme.textPrimary }}
      />

      <div className="flex gap-2 overflow-x-auto mb-4 pb-1" style={{ scrollbarWidth: 'none' }}>
        {channelTags.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ background: selectedTag === t.id ? theme.dark : theme.surface, color: selectedTag === t.id ? '#fff' : theme.textSecondary }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-4">
        {(['hot', 'new', 'top'] as const).map(s => (
          <button key={s} onClick={() => setSort(s)} className="text-xs font-semibold"
            style={{ color: sort === s ? theme.textPrimary : theme.textLight }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: theme.textLight }}>Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl p-6 text-center" style={{ background: theme.surface }}>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            {posts.length === 0 ? 'No posts yet. Be the first to share.' : 'No posts match your filters.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => (
            <button key={p.id} onClick={() => setViewingPost(p.id)} className="text-left">
              <PostCard post={p} onUpvote={() => handleUpvote(p.id)} onBookmark={() => handleBookmark(p.id)} />
            </button>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowNewPost(true)}
        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
        style={{ background: theme.dark, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', position: 'absolute', bottom: 110, right: 20, zIndex: 10 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      <div style={{ height: 60 }} />
    </div>
  )
}

function Avatar({ seed, size = 32 }: { seed: number; size?: number }) {
  const colors = [theme.lavenderFill, theme.sageFill, theme.marigoldFill, theme.peachFill, theme.mintFill]
  const bg = colors[seed % colors.length]
  return (
    <div className="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      style={{ width: size, height: size, background: bg, color: theme.textPrimary, fontSize: size * 0.4 }}>
      {String.fromCharCode(65 + (seed % 26))}
    </div>
  )
}

function PostCard({ post, onUpvote, onBookmark }: { post: Post; onUpvote: () => void; onBookmark: () => void }) {
  return (
    <div className="rounded-3xl p-4" style={{ background: theme.surface }}>
      <div className="flex items-center gap-2 mb-2">
        <Avatar seed={post.avatarSeed} size={28} />
        <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{post.pseudonym}</span>
        <span className="text-xs" style={{ color: theme.textLight }}>· {getTimeAgo(post.timestamp)}</span>
      </div>
      {post.tags.length > 0 && (
        <div className="flex gap-1 mb-2">
          {post.tags.map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: theme.background, color: theme.textSecondary }}>{t}</span>
          ))}
        </div>
      )}
      <p className="text-sm font-semibold mb-1" style={{ color: theme.textPrimary }}>{post.title}</p>
      <p className="text-xs mb-3 line-clamp-2" style={{ color: theme.textSecondary }}>{post.body}</p>
      <div className="flex items-center gap-4">
        <button onClick={e => { e.stopPropagation(); onUpvote() }} className="flex items-center gap-1 text-xs"
          style={{ color: post.hasUpvoted ? theme.rose : theme.textLight }}>
          ▲ {post.upvotes}
        </button>
        <span className="text-xs" style={{ color: theme.textLight }}>💬 {post.comments.length}</span>
        <button onClick={e => { e.stopPropagation(); onBookmark() }} className="text-xs ml-auto"
          style={{ color: post.isBookmarked ? theme.rose : theme.textLight }}>
          {post.isBookmarked ? '★' : '☆'}
        </button>
      </div>
    </div>
  )
}

function PostDetail({ post, onBack, onUpvote, onBookmark, onComment, onEdit, onDelete, isOwner }: {
  post: Post; onBack: () => void; onUpvote: () => void; onBookmark: () => void
  onComment: (body: string, parentCommentId?: string) => void
  onEdit?: (data: { title: string; body: string; tags: string[] }) => void
  onDelete?: () => void
  isOwner?: boolean
}) {
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editBody, setEditBody] = useState(post.body)

  const handleComment = () => {
    if (!commentText.trim()) return
    onComment(commentText.trim(), replyTo?.id)
    setCommentText('')
    setReplyTo(null)
  }

  return (
    <div className="flex flex-col flex-1 px-6 pt-2">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-sm text-left flex items-center gap-1" style={{ color: theme.textSecondary }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back
        </button>
        {isOwner && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: theme.surface }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 rounded-2xl overflow-hidden" style={{ background: theme.surface, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 20, minWidth: 140 }}>
                <button onClick={() => { setEditing(true); setShowMenu(false) }} className="w-full text-left px-4 py-3 text-sm" style={{ color: theme.textPrimary }}>Edit post</button>
                <button onClick={() => { if (confirm('Delete this post?')) { onDelete?.(); } setShowMenu(false) }} className="w-full text-left px-4 py-3 text-sm" style={{ color: theme.rose }}>Delete post</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit mode */}
      {editing && (
        <div className="rounded-3xl p-4 mb-4" style={{ background: theme.surface }}>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full text-sm font-bold mb-2 focus:outline-none bg-transparent" style={{ color: theme.textPrimary }} />
          <textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={4} className="w-full text-sm mb-3 focus:outline-none bg-transparent resize-none" style={{ color: theme.textPrimary }} />
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background: theme.background, color: theme.textSecondary }}>Cancel</button>
            <button onClick={() => { onEdit?.({ title: editTitle, body: editBody, tags: post.tags }); setEditing(false) }} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: theme.dark }}>Save</button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <Avatar seed={post.avatarSeed} size={32} />
          <div>
            <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>{post.pseudonym}</span>
            <span className="text-xs ml-2" style={{ color: theme.textLight }}>{getTimeAgo(post.timestamp)}</span>
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className="flex gap-1 mb-2">
            {post.tags.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: theme.surface, color: theme.textSecondary }}>{t}</span>
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>{post.title}</h2>
        <p className="text-sm mb-4 leading-relaxed whitespace-pre-wrap" style={{ color: theme.textSecondary }}>{post.body}</p>

        {post.poll && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: theme.surface }}>
            <p className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>{post.poll.question}</p>
            {post.poll.options.map(opt => {
              const total = post.poll!.options.reduce((s, o) => s + o.votes, 0)
              const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0
              return (
                <div key={opt.id} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: theme.textPrimary }}>{opt.text}</span>
                    <span style={{ color: theme.textLight }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: theme.separator }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: theme.lavenderFill }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-4 mb-5">
          <button onClick={onUpvote} className="flex items-center gap-1 text-sm" style={{ color: post.hasUpvoted ? theme.rose : theme.textLight }}>
            ▲ {post.upvotes}
          </button>
          <span className="text-sm" style={{ color: theme.textLight }}>💬 {post.comments.length}</span>
          <button onClick={onBookmark} className="text-sm ml-auto" style={{ color: post.isBookmarked ? theme.rose : theme.textLight }}>
            {post.isBookmarked ? '★ Saved' : '☆ Save'}
          </button>
        </div>

        {/* Comments */}
        {post.comments.length > 0 && (
          <div className="flex flex-col gap-3 mb-4">
            {post.comments.map(c => (
              <div key={c.id}>
                <div className="rounded-2xl p-3" style={{ background: theme.surface }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar seed={c.avatarSeed} size={24} />
                    <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{c.pseudonym}</span>
                    <span className="text-xs" style={{ color: theme.textLight }}>{getTimeAgo(c.timestamp)}</span>
                  </div>
                  <p className="text-sm" style={{ color: theme.textSecondary }}>{c.body}</p>
                  <button onClick={() => setReplyTo({ id: c.id, name: c.pseudonym })} className="text-xs mt-1" style={{ color: theme.textLight }}>
                    Reply
                  </button>
                </div>
                {/* Replies */}
                {c.replies?.map(r => (
                  <div key={r.id} className="ml-6 mt-2 rounded-2xl p-3 border-l-2" style={{ background: theme.surface, borderColor: theme.separator }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar seed={r.avatarSeed} size={20} />
                      <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{r.pseudonym}</span>
                      <span className="text-xs" style={{ color: theme.textLight }}>{getTimeAgo(r.timestamp)}</span>
                    </div>
                    <p className="text-sm" style={{ color: theme.textSecondary }}>{r.body}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment input */}
      <div className="pb-6 pt-2">
        {replyTo && (
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs" style={{ color: theme.textSecondary }}>Replying to {replyTo.name}</span>
            <button onClick={() => setReplyTo(null)} className="text-xs" style={{ color: theme.textLight }}>Cancel</button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleComment()}
            placeholder={replyTo ? `Reply to ${replyTo.name}...` : 'Write a comment...'}
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm focus:outline-none"
            style={{ background: theme.surface, color: theme.textPrimary }}
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim()}
            className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-30"
            style={{ background: theme.dark }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function NewPostView({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: { title: string; body: string; tags: string[] }) => void }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (id: string) =>
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  return (
    <div className="flex flex-col flex-1 px-6 pt-2" style={{ background: theme.background }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onClose} className="text-sm" style={{ color: theme.textSecondary }}>Cancel</button>
        <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>New Post</h3>
        <button
          onClick={() => onSubmit({ title, body, tags: selectedTags })}
          disabled={!title.trim() || !body.trim()}
          className="text-sm font-semibold disabled:opacity-30"
          style={{ color: theme.rose }}
        >
          Post
        </button>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
        className="w-full text-lg font-bold mb-3 focus:outline-none bg-transparent" style={{ color: theme.textPrimary }} />

      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="What's on your mind?"
        rows={6} className="w-full text-sm mb-4 focus:outline-none bg-transparent resize-none leading-relaxed" style={{ color: theme.textPrimary }} />

      <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.textLight }}>Tags</p>
      <div className="flex flex-wrap gap-2">
        {channelTags.filter(t => t.id !== 'all').map(t => (
          <button key={t.id} onClick={() => toggleTag(t.id)}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: selectedTags.includes(t.id) ? theme.dark : theme.surface, color: selectedTags.includes(t.id) ? '#fff' : theme.textSecondary }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}
