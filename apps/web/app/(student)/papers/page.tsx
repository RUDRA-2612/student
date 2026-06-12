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
  BookmarkCheck,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { TiltCard } from '@/components/ui/tilt-card'

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
      <div className="border-b border-white/[0.04] pb-6">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-2">Academic Index</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[-0.02em]">
          Syllabus & <span className="italic text-white/40 font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>Practice Papers</span>
        </h1>
        <p className="text-white/40 text-xs font-light max-w-xl mt-3 leading-relaxed">
          Search and download previous years question papers, mock tests, and official curriculum syllabi.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-[#050505] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/20">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by title, university, or syllabus keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.06] focus:border-white/20 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subject filter */}
            <div className="relative group">
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value)
                  setPage(1)
                }}
                className="appearance-none px-4 pr-9 py-2.5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 rounded-xl text-xs text-white/75 focus:outline-none cursor-pointer transition-all"
              >
                <option value="">All Subjects</option>
                {subjects?.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>

            {/* Exam Type filter */}
            <div className="relative">
              <select
                value={examTypeFilter}
                onChange={(e) => {
                  setExamTypeFilter(e.target.value)
                  setPage(1)
                }}
                className="appearance-none px-4 pr-9 py-2.5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 rounded-xl text-xs text-white/75 focus:outline-none cursor-pointer transition-all"
              >
                <option value="">All Types</option>
                <option value="COMPETITIVE">Competitive</option>
                <option value="MOCK">Mock Exams</option>
                <option value="FINAL">Final Exams</option>
                <option value="MIDTERM">Midterm</option>
                <option value="ASSIGNMENT">Assignment</option>
              </select>
              <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>

            {/* Difficulty filter */}
            <div className="relative">
              <select
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value)
                  setPage(1)
                }}
                className="appearance-none px-4 pr-9 py-2.5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 rounded-xl text-xs text-white/75 focus:outline-none cursor-pointer transition-all"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-white/[0.02] border border-white/[0.04] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !data?.papers || data.papers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#050505] border border-white/[0.06] text-center max-w-md mx-auto space-y-4">
          <BookOpenCheck className="mx-auto text-white/15" size={36} />
          <h3 className="font-semibold text-sm">No Publications Found</h3>
          <p className="text-white/30 text-xs leading-relaxed max-w-xs mx-auto">
            We couldn&apos;t find any question papers matching your filter parameters. Try clearing your filters.
          </p>
          <button
            onClick={() => {
              setSubjectFilter('')
              setExamTypeFilter('')
              setDifficultyFilter('')
              setSearchQuery('')
              setPage(1)
            }}
            className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-bold tracking-wider uppercase hover:bg-white/90 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.papers.map((paper: any) => {
              const isBookmarked = bookmarkedIds.has(paper.id)
              const diffBorder = 
                paper.difficulty === 'HARD' ? 'border-red-500/20 text-red-400 bg-red-500/[0.03]' :
                paper.difficulty === 'MEDIUM' ? 'border-amber-500/20 text-amber-400 bg-amber-500/[0.03]' :
                'border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.03]'

              return (
                <TiltCard 
                  key={paper.id} 
                  maxTilt={10}
                  glareOpacity={0.08}
                  className="bg-[#050505] border border-white/[0.06] hover:border-white/[0.12] transition-colors rounded-2xl p-5 flex flex-col justify-between h-56 relative group cursor-default"
                >
                  {/* Top line Info */}
                  <div className="space-y-3" style={{ transform: 'translateZ(15px)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-white/30 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                        {paper.year} PYQ
                      </span>
                      <button
                        onClick={() => toggleBookmark.mutate({ paperId: paper.id })}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          isBookmarked 
                            ? 'bg-white/10 border-white/20 text-white' 
                            : 'border-white/[0.06] text-white/30 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <Link href={`/papers/${paper.id}`} className="block">
                        <h3 className="text-base font-normal text-white/80 group-hover:text-white transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                          {paper.title}
                        </h3>
                      </Link>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{paper.subject?.name || 'Subject'}</p>
                    </div>
                  </div>

                  {/* Mid stats/badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2" style={{ transform: 'translateZ(20px)' }}>
                    <span className="text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/[0.06] text-white/40 bg-white/[0.01]">
                      {paper.examType}
                    </span>
                    <span className={`text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffBorder}`}>
                      {paper.difficulty}
                    </span>
                  </div>

                  {/* Footer Stats and links */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.04] text-[10px] text-white/30" style={{ transform: 'translateZ(25px)' }}>
                    <div className="flex items-center gap-2.5 font-mono">
                      <span className="flex items-center gap-1"><Eye size={10} /> {paper.viewCount}</span>
                      <span className="flex items-center gap-1"><Download size={10} /> {paper.downloadCount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/papers/${paper.id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] transition text-[10px] font-medium"
                      >
                        Solutions
                      </Link>
                      {paper.pdfUrl && (
                        <button
                          onClick={() => handleDownload(paper.id, paper.pdfUrl)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-white/90 text-black transition flex items-center justify-center"
                        >
                          <Download size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </TiltCard>
              )
            })}
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-white/[0.06] bg-[#050505] hover:bg-white/[0.03] disabled:opacity-20 transition flex items-center justify-center text-white"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] text-white/30 px-3 font-mono">
                Page {page} of {data.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="w-8 h-8 rounded-lg border border-white/[0.06] bg-[#050505] hover:bg-white/[0.03] disabled:opacity-20 transition flex items-center justify-center text-white"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
