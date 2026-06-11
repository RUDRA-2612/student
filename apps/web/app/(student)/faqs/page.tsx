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

  return (
    <div className="space-y-10">
      {/* Header Profile */}
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Help Desk & FAQs</h1>
        <p className="text-white/40 text-sm font-light">
          Find answers to frequently asked questions about Rajasthan exams, syllabus frameworks, and AI-predicted question parameters.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search support queries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-bg-surface border border-white/[0.08] focus:border-accent/40 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/15"
        />
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id)
              setExpandedId(null)
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              selectedCategory === cat.id 
                ? 'bg-accent/10 text-accent border border-accent/20' 
                : 'text-white/40 hover:text-white/70 border border-transparent'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left pane: FAQ Accordion */}
        <div className="lg:col-span-8 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !filteredFaqs || filteredFaqs.length === 0 ? (
            <div className="p-8 bg-bg-surface border border-white/[0.06] rounded-xl text-center space-y-2">
              <HelpCircle className="mx-auto text-white/20" size={32} />
              <p className="text-white/40 text-sm">No matching FAQs found. Please query again or contact advisors.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isExpanded = expandedId === faq.id
                return (
                  <div 
                    key={faq.id} 
                    className="border border-white/[0.05] bg-bg-surface rounded-xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.01] transition gap-4"
                    >
                      <span className="font-display font-semibold text-sm text-white/95 leading-tight">{faq.question}</span>
                      {isExpanded ? <ChevronUp size={16} className="text-white/40 shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-5 pb-5 pt-2 border-t border-white/[0.04] text-xs leading-relaxed text-white/60 font-light whitespace-pre-wrap">
                            {faq.answer}
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

        {/* Right pane: Action card */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-br from-accent/15 via-transparent to-transparent border border-accent/20 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-display font-bold text-base">Still Have Questions?</h3>
            <p className="text-white/50 text-xs leading-relaxed font-light">
              Submit a support ticket or request specific exam papers directly to our academic panel. We resolve tickets within 24 hours.
            </p>
            <Link
              href="/requests"
              className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
            >
              Raise Support Request <ExternalLink size={12} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
