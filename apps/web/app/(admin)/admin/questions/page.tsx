'use client'

import { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QuestionCreateSchema } from '@examedge/validators'
import { z } from 'zod'
import {
  HelpCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  ChevronDown,
} from 'lucide-react'

const S = {
  surface: 'hsl(220 14% 9%)',
  input:   'hsl(220 14% 14%)',
  border:  'rgba(255,255,255,0.07)',
  accent:  'hsl(327 100% 62%)',
}

const inputCls = `
  w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 
  focus:outline-none transition-all duration-200
`
const inputStyle = {
  background: S.input,
  border: `1px solid ${S.border}`,
}
const inputFocusStyle = {
  borderColor: 'hsl(327 100% 62% / 0.5)',
  boxShadow: '0 0 0 3px hsl(327 100% 62% / 0.08)',
}

type QuestionFormValues = z.infer<typeof QuestionCreateSchema>

const IMPORTANCE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  VERY_HIGH: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.25)' },
  HIGH:      { bg: 'rgba(249,115,22,0.12)', text: '#fb923c', border: 'rgba(249,115,22,0.25)' },
  MEDIUM:    { bg: 'rgba(234,179,8,0.12)',  text: '#facc15', border: 'rgba(234,179,8,0.25)' },
  LOW:       { bg: 'rgba(255,255,255,0.04)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' },
}

export default function AdminQuestions() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)

  const utils = api.useUtils()

  const { data: subjects }   = api.subjects.list.useQuery({ isActive: true })
  const { data: questions, isLoading } = api.questions.list.useQuery({ isActive: false })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(QuestionCreateSchema),
    defaultValues: {
      subjectId:   '',
      text:        '',
      topic:       '',
      chapter:     '',
      type:        'MCQ',
      marks:       4,
      importance:  'MEDIUM',
      yearLastAsked: new Date().getFullYear(),
    },
  })

  const createMutation = api.questions.create.useMutation({
    onSuccess: () => {
      setSuccessMsg('Question added to bank!')
      reset()
      utils.questions.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 4000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Failed to save question.')
      setTimeout(() => setErrorMsg(null), 4000)
    },
  })

  const deleteMutation = api.questions.delete.useMutation({
    onSuccess: () => {
      setSuccessMsg('Question deleted.')
      utils.questions.list.invalidate()
      setTimeout(() => setSuccessMsg(null), 3000)
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Delete failed.')
      setTimeout(() => setErrorMsg(null), 4000)
    },
  })

  const onSubmit = (data: QuestionFormValues) => {
    createMutation.mutate({
      ...data,
      marks:        Number(data.marks),
      yearLastAsked: data.yearLastAsked ? Number(data.yearLastAsked) : null,
      chapter:      data.chapter || null,
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Delete this question? This cannot be undone.')) {
      deleteMutation.mutate({ id })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Question Bank</h1>
        <p className="text-sm text-white/40 font-light">
          Manage syllabus questions, difficulty weightages, and AI training datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ─── Left: Add Question Form ─── */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl p-6 space-y-5" style={{ background: S.surface, border: `1px solid rgba(255,255,255,0.06)` }}>
            <div className="flex items-center gap-2.5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'hsl(327 100% 62% / 0.12)', border: '1px solid hsl(327 100% 62% / 0.2)' }}>
                <FilePlus size={15} style={{ color: S.accent }} />
              </div>
              <div>
                <h2 className="font-display font-semibold text-sm">Add Question</h2>
                <p className="text-[10px] text-white/35">Fill all required fields and submit</p>
              </div>
            </div>

            {/* Status banners */}
            {successMsg && (
              <div className="p-3.5 rounded-xl text-xs flex items-center gap-2.5"
                style={{ background: 'rgba(0,212,160,0.1)', border: '1px solid rgba(0,212,160,0.2)', color: '#00D4A0' }}>
                <CheckCircle2 size={14} />{successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="p-3.5 rounded-xl text-xs flex items-center gap-2.5"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <AlertCircle size={14} />{errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Subject */}
              <div>
                <label className="form-label">Subject</label>
                <div className="relative">
                  <select
                    {...register('subjectId')}
                    className={inputCls + ' appearance-none cursor-pointer'}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e  => Object.assign(e.currentTarget.style, inputStyle)}
                  >
                    <option value="">Select subject…</option>
                    {subjects?.map(s => (
                      <option key={s.id} value={s.id} style={{ background: S.input }}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
                {errors.subjectId && <p className="text-xs text-red-400 mt-1.5">{errors.subjectId.message}</p>}
              </div>

              {/* Topic + Chapter */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Topic</label>
                  <input
                    {...register('topic')}
                    type="text"
                    placeholder="e.g. Photosynthesis"
                    className={inputCls}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e  => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                  {errors.topic && <p className="text-xs text-red-400 mt-1.5">{errors.topic.message}</p>}
                </div>
                <div>
                  <label className="form-label">Chapter <span className="text-white/25">(opt)</span></label>
                  <input
                    {...register('chapter')}
                    type="text"
                    placeholder="e.g. Plant Biology"
                    className={inputCls}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e  => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
              </div>

              {/* Type + Marks + Importance */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: 'Type', field: 'type' as const,
                    options: [['MCQ','MCQ'],['SHORT_ANSWER','Short'],['LONG_ANSWER','Long'],['NUMERICAL','Numerical'],['CASE_STUDY','Case Study']],
                  },
                  {
                    label: 'Importance', field: 'importance' as const,
                    options: [['VERY_HIGH','V.High'],['HIGH','High'],['MEDIUM','Medium'],['LOW','Low']],
                  },
                ].map(({ label, field, options }) => (
                  <div key={field}>
                    <label className="form-label">{label}</label>
                    <div className="relative">
                      <select
                        {...register(field)}
                        className={inputCls + ' appearance-none cursor-pointer text-xs'}
                        style={inputStyle}
                        onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                        onBlur={e  => Object.assign(e.currentTarget.style, inputStyle)}
                      >
                        {options.map(([v, l]) => (
                          <option key={v} value={v} style={{ background: S.input }}>{l}</option>
                        ))}
                      </select>
                      <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="form-label">Marks</label>
                  <input
                    {...register('marks', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    className={inputCls + ' text-xs'}
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e  => Object.assign(e.currentTarget.style, inputStyle)}
                  />
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="form-label">Year Last Asked <span className="text-white/25">(opt)</span></label>
                <input
                  {...register('yearLastAsked', { valueAsNumber: true })}
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  className={inputCls + ' text-xs'}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e  => Object.assign(e.currentTarget.style, inputStyle)}
                />
              </div>

              {/* Question text */}
              <div>
                <label className="form-label">Question Text</label>
                <textarea
                  {...register('text')}
                  rows={4}
                  placeholder="Write the full question text here…"
                  className={inputCls + ' resize-none'}
                  style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                  onBlur={e  => Object.assign(e.currentTarget.style, inputStyle)}
                />
                {errors.text && <p className="text-xs text-red-400 mt-1.5">{errors.text.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{
                  background: (isSubmitting || createMutation.isPending)
                    ? 'hsl(327 100% 62% / 0.4)'
                    : 'linear-gradient(135deg, hsl(327 100% 62%), hsl(280 100% 65%))',
                  boxShadow: (isSubmitting || createMutation.isPending) ? 'none' : '0 0 20px hsl(327 100% 62% / 0.3)',
                }}
              >
                {(isSubmitting || createMutation.isPending) ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving…
                  </span>
                ) : 'Add to Question Bank'}
              </button>
            </form>
          </div>
        </div>

        {/* ─── Right: Question List ─── */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl p-6 space-y-5" style={{ background: S.surface, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-white/40" />
                <h2 className="font-display font-semibold text-sm">Question Inventory</h2>
              </div>
              <span className="text-xs text-white/30 font-mono">
                {questions?.length ?? 0} total
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : !questions || questions.length === 0 ? (
              <div className="py-16 text-center">
                <HelpCircle size={32} className="mx-auto mb-3 text-white/10" />
                <p className="text-sm text-white/30">No questions yet.</p>
                <p className="text-xs text-white/20 mt-1">Use the form to add your first question.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {questions.map(q => {
                  const imp = IMPORTANCE_COLORS[q.importance] ?? IMPORTANCE_COLORS.LOW
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl flex flex-col gap-3 group"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[9px] font-mono font-semibold text-white/35 uppercase bg-white/5 px-1.5 py-0.5 rounded">
                              {q.type}
                            </span>
                            <span className="text-[9px] font-mono text-white/35">{q.marks}M</span>
                            {q.yearLastAsked && (
                              <span className="text-[9px] font-mono text-white/30">· {q.yearLastAsked}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/40">
                            {q.topic}{q.chapter ? ` · ${q.chapter}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                            style={{ background: imp.bg, color: imp.text, border: `1px solid ${imp.border}` }}
                          >
                            {q.importance}
                          </span>
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed font-light">{q.text}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
