'use client'

import { useParams } from 'next/navigation'
import { api } from '@/lib/trpc/react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { 
  ArrowLeft, 
  Download, 
  Video, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck 
} from 'lucide-react'
import Link from 'next/link'

// Load ReactPlayer dynamically to avoid SSR hydration issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false })

export default function PaperDetails() {
  const { id } = useParams() as { id: string }
  const [activeTab, setActiveTab] = useState<'pdf' | 'video' | 'solutions'>('pdf')
  
  const utils = api.useUtils()
  
  // Fetch Paper by ID
  const { data: paper, isLoading, error } = api.papers.byId.useQuery({ id })
  
  // Bookmarks check
  const { data: bookmarks } = api.student.myBookmarks.useQuery()
  const isBookmarked = bookmarks?.some(b => b.paperId === id)

  // Mutations
  const toggleBookmark = api.student.toggleBookmark.useMutation({
    onSuccess: () => {
      utils.student.myBookmarks.invalidate()
    }
  })

  const trackDownload = api.papers.trackDownload.useMutation()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono">Fetching Paper details...</p>
      </div>
    )
  }

  if (error || !paper) {
    return (
      <div className="p-8 rounded-xl bg-bg-surface border border-white/[0.06] text-center max-w-md mx-auto space-y-4">
        <HelpCircle className="mx-auto text-brand-coral" size={36} />
        <h3 className="font-display font-semibold text-lg">Error Loading Paper</h3>
        <p className="text-white/40 text-sm">{error?.message || 'Paper not found.'}</p>
        <Link href="/papers" className="inline-block px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-semibold">
          Return to Papers
        </Link>
      </div>
    )
  }

  const handleDownload = () => {
    if (paper.pdfUrl) {
      trackDownload.mutate({ id: paper.id })
      window.open(paper.pdfUrl, '_blank')
    }
  }

  return (
    <div className="space-y-8">
      {/* Top navigation path */}
      <div className="flex items-center justify-between">
        <Link 
          href="/papers" 
          className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <button
          onClick={() => toggleBookmark.mutate({ paperId: paper.id })}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
            isBookmarked 
              ? 'bg-accent/15 border-accent/30 text-accent' 
              : 'border-white/10 text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck size={14} /> Bookmarked
            </>
          ) : (
            <>
              <Bookmark size={14} /> Save Paper
            </>
          )}
        </button>
      </div>

      {/* Header Profile */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {paper.subject.category}
          </span>
          <span className="text-[10px] font-semibold text-white/45 bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {paper.examType}
          </span>
          <span className="text-[10px] font-mono text-white/40">
            {paper.year} PYQ
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight max-w-4xl text-white">
          {paper.title}
        </h1>
        <p className="text-white/40 text-sm font-light">
          Official board examination paper from {paper.university}. Subject code: <span className="font-mono">{paper.subject.code}</span>.
        </p>
      </div>

      {/* Left-Right Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Viewer (PDF/Video) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex bg-bg-surface border border-white/[0.06] rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'pdf' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <FileText size={14} /> Paper PDF
            </button>
            <button
              onClick={() => setActiveTab('video')}
              disabled={!paper.videoUrl && !paper.solution?.videoUrl}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition disabled:opacity-30 disabled:pointer-events-none ${
                activeTab === 'video' ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Video size={14} /> Video Analysis
            </button>
          </div>

          {activeTab === 'pdf' && (
            <div className="bg-bg-surface border border-white/[0.06] rounded-xl overflow-hidden aspect-[4/5] relative flex flex-col items-center justify-center">
              {paper.pdfUrl ? (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(paper.pdfUrl)}&embedded=true`}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              ) : (
                <div className="p-8 text-center space-y-4">
                  <FileText className="mx-auto text-white/20" size={48} />
                  <p className="text-white/40 text-sm">No PDF copy has been attached to this Syllabus item yet.</p>
                </div>
              )}

              {/* Floating Download Button */}
              {paper.pdfUrl && (
                <div className="absolute bottom-4 right-4 z-10">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-lg shadow-accent/25 flex items-center gap-2"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="bg-bg-surface border border-white/[0.06] rounded-xl overflow-hidden aspect-video relative">
              {paper.videoUrl || paper.solution?.videoUrl ? (
                <ReactPlayer
                  url={paper.videoUrl || paper.solution?.videoUrl || ''}
                  width="100%"
                  height="100%"
                  controls
                  playsinline
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Right pane: Solutions / Model Answers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h2 className="font-display text-lg font-bold">Solutions Guide</h2>
              <Link
                href={`/roadmap?subject=${encodeURIComponent(paper.subject.name)}`}
                className="text-xs text-brand-mint hover:underline flex items-center gap-1 font-semibold"
              >
                AI Study Plan <Sparkles size={12} />
              </Link>
            </div>

            {paper.solution && paper.solution.isPublished ? (
              <div className="space-y-4">
                <div className="prose prose-invert max-w-none text-white/70 text-sm leading-relaxed font-light">
                  {/* Since solution.content might be markdown or direct string, display it safely */}
                  <div className="whitespace-pre-wrap">{paper.solution.content}</div>
                </div>

                {paper.solution.videoUrl && (
                  <div className="mt-4 p-4 rounded-lg bg-bg-base/40 border border-white/[0.04] flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white/90">Video Guide Available</p>
                      <p className="text-[10px] text-white/40">Watch a detailed explanation step-by-step.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('video')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold"
                    >
                      Watch
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <FileText className="mx-auto text-white/10" size={36} />
                <p className="text-white/40 text-xs max-w-xs mx-auto leading-relaxed">
                  Official solutions for this paper are currently being drafted by Jaipur EdTech mentors.
                </p>
                <Link
                  href={`/requests?type=SOLUTION_REQUEST&subjectId=${paper.subjectId}&title=Request%20solutions%20for%20${encodeURIComponent(paper.title)}`}
                  className="inline-block px-4 py-2 bg-accent/10 border border-accent/20 hover:bg-accent/15 rounded-lg text-xs font-semibold text-accent transition"
                >
                  Request Fast-Track Solutions
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
