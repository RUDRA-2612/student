'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Search,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { TiltCard } from '@/components/ui/tilt-card'

const categories = [
  { id: 'all', name: 'All FAQs' },
  { id: 'General', name: 'General Help' },
  { id: 'Exam', name: 'Exam Logistics' },
  { id: 'Platform', name: 'AI Features' },
  { id: 'Results', name: 'Syllabus & Scoring' }
]

export default function FAQPortal() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Fetch FAQ list
  const { data: faqs, isLoading } = api.faqs.list.useQuery({
    category: selectedCategory === 'all' ? undefined : selectedCategory
  })

  // Filter local FAQs based on search query
  const filteredFaqs = faqs?.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Highlight search text helper
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) 
            ? <mark key={i} className="bg-white/10 text-white font-semibold px-0.5 rounded">{part}</mark> 
            : part
        )}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/[0.04] pb-6">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-2">Support Database</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[-0.02em]">
          Help Desk & <span className="italic text-white/40 font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>FAQs</span>
        </h1>
        <p className="text-white/40 text-xs font-light max-w-xl mt-3 leading-relaxed">
          Access immediate answers regarding Rajasthan state curriculum structures, grading parameters, and Study Roadmaps.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/20">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search support database logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.06] focus:border-white/20 rounded-xl text-xs text-white placeholder:text-white/20 focus:outline-none transition-all"
        />
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Categories selector */}
        <div className="lg:col-span-3 space-y-2">
          <p className="text-[9px] font-mono uppercase tracking-widest text-white/30 px-2 mb-3">Categories</p>
          <div className="flex flex-row lg:flex-col flex-wrap gap-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setExpandedId(null)
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                    isSelected 
                      ? 'bg-white/[0.04] text-white border border-white/[0.08]' 
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.01] border border-transparent'
                  }`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Middle: FAQ Accordion List */}
        <div className="lg:col-span-6 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/[0.02] border border-white/[0.04] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !filteredFaqs || filteredFaqs.length === 0 ? (
            <div className="p-8 bg-[#050505] border border-white/[0.06] rounded-2xl text-center space-y-3">
              <HelpCircle className="mx-auto text-white/15" size={28} />
              <p className="text-white/30 text-xs">No matching queries found in index. Try a different search.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id
                return (
                  <div 
                    key={faq.id} 
                    className="border border-white/[0.05] bg-[#050505] rounded-xl overflow-hidden transition-all hover:border-white/[0.08]"
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left transition gap-4"
                    >
                      <span className="text-xs font-semibold text-white/80 leading-snug">
                        {highlightText(faq.question, searchQuery)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-white/40 shrink-0" />
                      ) : (
                        <ChevronDown size={14} className="text-white/40 shrink-0" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <div className="px-5 pb-5 pt-1.5 border-t border-white/[0.04] text-[11px] leading-relaxed text-white/50 font-light whitespace-pre-wrap">
                            {highlightText(faq.answer, searchQuery)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Help desk support ticket block */}
        <div className="lg:col-span-3">
          <TiltCard
            maxTilt={6}
            glareOpacity={0.06}
            className="bg-[#050505] border border-white/[0.06] hover:border-white/[0.1] rounded-2xl p-5 space-y-5 cursor-default"
          >
            <div className="space-y-4" style={{ transform: 'translateZ(15px)' }}>
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/60">
                <MessageSquare size={14} />
              </div>
              <h3 className="text-sm font-semibold text-white/90">Need Custom Support?</h3>
              <p className="text-white/40 text-[11px] leading-relaxed font-light">
                If you have missing syllabus sheets or unresolved question banks, submit an support demand ticket.
              </p>
              <Link
                href="/requests"
                className="w-full py-2.5 bg-white text-black text-[10px] font-bold tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-1.5"
              >
                File Request <ExternalLink size={10} />
              </Link>
            </div>
          </TiltCard>
        </div>

      </div>
    </div>
  )
}
