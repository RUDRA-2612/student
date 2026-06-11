'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/trpc/react'
import { 
  Search, 
  Download, 
  Eye, 
  Bookmark, 
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck
} from 'lucide-react'
import Link from 'next/link'

export default function PapersCatalog() {
  const searchParams = useSearchParams()
  
  // Local filter states, initialized from query parameters if present
  const [subjectFilter, setSubjectFilter] = useState(searchParams.get('subjectId') || '')
  const [examTypeFilter, setExamTypeFilter] = useState(searchParams.get('examType') || '')
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  // API calls
  const utils = api.useUtils()
  const { data: subjects } = api.subjects.list.useQuery({ isActive: true })
  
  const { data: bookmarks } = api.student.myBookmarks.useQuery()
  const bookmarkedIds = new Set(bookmarks?.map(b => b.paperId).filter(Boolean))

  const { data, isLoading } = api.papers.list.useQuery({
    subjectId: subjectFilter || undefined,
    examType: examTypeFilter ? (examTypeFilter as any) : undefined,
    difficulty: difficultyFilter ? (difficultyFilter as any) : undefined,
    search: searchQuery || undefined,
    page,
    limit: 9,
  }, {
    placeholderData: (prev) => prev,
  })

  // Mutations
  const toggleBookmark = api.student.toggleBookmark.useMutation({
    onSuccess: () => {
      utils.student.myBookmarks.invalidate()
      utils.student.dashboardStats.invalidate()
    }
  })

  const trackDownload = api.papers.trackDownload.useMutation({
    onSuccess: () => {
      utils.papers.list.invalidate()
    }
  })

  const handleDownload = (paperId: string, pdfUrl: string) => {
    trackDownload.mutate({ id: paperId })
    window.open(pdfUrl, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Syllabus & Practice Papers</h1>
        <p className="text-white/40 text-sm font-light">
          Search and download previous years question papers, mock tests, and official Rajasthan exam syllabi.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-bg-surface border border-white/[0.06] rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by title, university, or syllabus keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subject filter */}
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 bg-bg-base border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white/80 focus:outline-none cursor-pointer"
            >
              <option value="">All Subjects</option>
              {subjects?.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>

            {/* Exam Type filter */}
            <select
              value={examTypeFilter}
              onChange={(e) => {
                setExamTypeFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 bg-bg-base border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white/80 focus:outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="COMPETITIVE">Competitive</option>
              <option value="MOCK">Mock Exams</option>
              <option value="FINAL">Final Exams</option>
              <option value="MIDTERM">Midterm</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>

            {/* Difficulty filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 bg-bg-base border border-white/[0.08] focus:border-accent/40 rounded-lg text-xs text-white/80 focus:outline-none cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data?.papers || data.papers.length === 0 ? (
        <div className="p-12 rounded-xl bg-bg-surface border border-white/[0.06] text-center max-w-lg mx-auto">
          <BookOpenCheck className="mx-auto text-white/20 mb-4" size={40} />
          <h3 className="font-display font-semibold text-lg mb-2">No Papers Found</h3>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            We couldn&apos;t find any question papers matching your filters. Try clearing your search or checking other subjects.
          </p>
          <button
            onClick={() => {
              setSubjectFilter('')
              setExamTypeFilter('')
              setDifficultyFilter('')
              setSearchQuery('')
              setPage(1)
            }}
            className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.papers.map((paper: any) => {
              const isBookmarked = bookmarkedIds.has(paper.id)
              const diffColor = 
                paper.difficulty === 'HARD' ? 'text-red-400 bg-red-400/10' :
                paper.difficulty === 'MEDIUM' ? 'text-brand-amber bg-brand-amber/10' :
                'text-brand-mint bg-brand-mint/10'

              return (
                <div 
                  key={paper.id} 
                  className="bg-bg-surface border border-white/[0.06] hover:border-white/12 transition rounded-xl p-5 flex flex-col justify-between gap-5 relative group"
                >
                  {/* Top line Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {paper.year}
                      </span>
                      <button
                        onClick={() => toggleBookmark.mutate({ paperId: paper.id })}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          isBookmarked 
                            ? 'bg-accent/15 border-accent/30 text-accent' 
                            : 'border-white/10 text-white/40 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <Link href={`/papers/${paper.id}`} className="block">
                        <h3 className="font-display font-bold text-base text-white group-hover:text-accent transition-colors line-clamp-2">
                          {paper.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-white/50">{paper.subject?.name || 'Subject'}</p>
                    </div>
                  </div>

                  {/* Mid stats/badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/[0.08] text-white/60 bg-white/[0.02]">
                      {paper.examType}
                    </span>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${diffColor}`}>
                      {paper.difficulty}
                    </span>
                  </div>

                  {/* Footer Stats and links */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] text-[11px] text-white/40">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye size={12} /> {paper.viewCount}</span>
                      <span className="flex items-center gap-1"><Download size={12} /> {paper.downloadCount}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/papers/${paper.id}`}
                        className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/90 border border-white/5 hover:border-white/10 transition"
                      >
                        Solutions
                      </Link>
                      {paper.pdfUrl && (
                        <button
                          onClick={() => handleDownload(paper.id, paper.pdfUrl)}
                          className="px-2.5 py-1.5 rounded bg-accent hover:bg-accent-hover text-white transition flex items-center justify-center"
                        >
                          <Download size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-lg border border-white/10 bg-bg-surface hover:bg-white/5 disabled:opacity-40 transition flex items-center justify-center text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-white/50 px-3 font-mono">
                Page {page} of {data.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="w-9 h-9 rounded-lg border border-white/10 bg-bg-surface hover:bg-white/5 disabled:opacity-40 transition flex items-center justify-center text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
