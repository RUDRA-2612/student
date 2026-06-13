'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  FileText, 
  Loader2, 
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react'

type QuizQuestion = {
  question: string
  options: string[]
  correctOptionIndex: number
  explanation: string
}

export default function StudentAIAssistant() {
  const [activeTool, setActiveTool] = useState<'chat' | 'explain' | 'quiz' | 'summarize'>('chat')
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  
  // Quiz states
  const [quizTopic, setQuizTopic] = useState('')
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [submittedQuiz, setSubmittedQuiz] = useState(false)

  // tRPC Mutations
  const askQueryMutation = api.ai.askQuery.useMutation({
    onSuccess: (data) => setResponse(data.response),
    onError: (err) => setResponse(`Error: ${err.message}`),
  })

  const explainTopicMutation = api.ai.explainTopic.useMutation({
    onSuccess: (data) => setResponse(data.answer),
    onError: (err) => setResponse(`Error: ${err.message}`),
  })

  const summarizeMutation = api.ai.summarizeNotes.useMutation({
    onSuccess: (data) => setResponse(data.summary),
    onError: (err) => setResponse(`Error: ${err.message}`),
  })

  const generateQuizMutation = api.ai.generateQuiz.useMutation({
    onSuccess: (data) => {
      setQuizQuestions(data.quiz)
      setSelectedAnswers({})
      setSubmittedQuiz(false)
    },
    onError: (err) => alert(`Error: ${err.message}`),
  })

  const handleAsk = () => {
    if (!query.trim()) return
    setResponse('')
    if (activeTool === 'chat') {
      askQueryMutation.mutate({ query })
    } else if (activeTool === 'explain') {
      explainTopicMutation.mutate({ topic: query })
    } else if (activeTool === 'summarize') {
      summarizeMutation.mutate({ content: query })
    }
  }

  const handleGenerateQuiz = () => {
    if (!quizTopic.trim()) return
    generateQuizMutation.mutate({ topic: quizTopic })
  }

  const isLoading = askQueryMutation.isPending || explainTopicMutation.isPending || summarizeMutation.isPending

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent/80">AI Study Partner</span>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">AI Academic Assistant</h1>
        <p className="text-white/40 text-sm font-light">
          Get explanations, summaries, and custom-generated quizzes dynamically from Claude 3.5 Sonnet.
        </p>
      </div>

      {/* Mode selectors */}
      <div className="grid grid-cols-4 gap-2 border-b border-white/[0.06] pb-4">
        {[
          { value: 'chat', label: 'Tutor Chat', icon: HelpCircle },
          { value: 'explain', label: 'Explain Topic', icon: BookOpen },
          { value: 'quiz', label: 'Generate Quiz', icon: Sparkles },
          { value: 'summarize', label: 'Summarize Notes', icon: FileText }
        ].map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.value}
              onClick={() => {
                setActiveTool(tool.value as any)
                setResponse('')
                setQuery('')
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                activeTool === tool.value
                  ? 'bg-accent/10 border-accent/20 text-accent'
                  : 'bg-white/5 border-white/10 text-white/45 hover:text-white/70 hover:bg-white/[0.08]'
              }`}
            >
              <Icon size={16} className="mb-1.5" />
              <span className="text-[10px] font-semibold tracking-wider uppercase hidden sm:inline">{tool.label}</span>
            </button>
          )
        })}
      </div>

      {activeTool !== 'quiz' ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTool === 'chat'
                  ? "Ask anything about your courses, exams, or homework..."
                  : activeTool === 'explain'
                  ? "Enter the topic or keyword you want simplified..."
                  : "Paste your notes or text here to summarize..."
              }
              rows={4}
              className="form-input resize-none"
            />
            <button
              onClick={handleAsk}
              disabled={isLoading || !query.trim()}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit to AI Assistant</span>
                </>
              )}
            </button>
          </div>

          {response && (
            <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <Sparkles size={16} className="text-accent" />
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-white/80">AI Response</h3>
              </div>
              <div className="text-xs text-white/75 leading-relaxed whitespace-pre-line font-light">
                {response}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-4">
            <label className="form-label">Quiz Subject/Topic</label>
            <input
              type="text"
              placeholder="e.g. Object Oriented Programming"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              className="form-input"
            />
            <button
              onClick={handleGenerateQuiz}
              disabled={generateQuizMutation.isPending || !quizTopic.trim()}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {generateQuizMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>

          {quizQuestions.length > 0 && (
            <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
                <Sparkles size={16} className="text-accent" />
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-white/80">Interactive Quiz</h3>
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3 p-4 rounded-xl bg-bg-base/30 border border-white/[0.04]">
                    <h4 className="text-xs font-bold text-white">{qIdx + 1}. {q.question}</h4>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              if (submittedQuiz) return
                              setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg text-xs transition border flex items-center justify-between ${
                              isSelected 
                                ? 'bg-accent/10 border-accent/30 text-accent font-semibold' 
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.08]'
                            }`}
                          >
                            <span>{opt}</span>
                            {submittedQuiz && optIdx === q.correctOptionIndex && (
                              <CheckCircle size={14} className="text-sage" />
                            )}
                            {submittedQuiz && isSelected && optIdx !== q.correctOptionIndex && (
                              <XCircle size={14} className="text-brand-coral" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {submittedQuiz && (
                      <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04] text-[11px] text-white/40 leading-relaxed font-light">
                        <span className="font-semibold text-white/60 block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!submittedQuiz ? (
                <button
                  onClick={() => setSubmittedQuiz(true)}
                  disabled={Object.keys(selectedAnswers).length !== quizQuestions.length}
                  className="w-full btn-primary py-3"
                >
                  Submit Quiz
                </button>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm font-semibold text-white">
                    Quiz Score: {Object.entries(selectedAnswers).filter(([qIdx, optIdx]) => quizQuestions[Number(qIdx)].correctOptionIndex === optIdx).length} / {quizQuestions.length}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
