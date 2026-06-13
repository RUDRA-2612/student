'use client'

import { api } from '@/lib/trpc/react'
import { Calendar, Clock } from 'lucide-react'

export default function StudentCalendar() {
  const { data: events, isLoading } = api.calendar.list.useQuery()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent/80">Schedule</span>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">University Academic Calendar</h1>
        <p className="text-white/40 text-sm font-light">
          Stay updated with examination schedules, deadline registrations, and events.
        </p>
      </div>

      <div className="bg-bg-surface border border-white/[0.06] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
          <Calendar size={18} className="text-accent" />
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-white/80">Upcoming Timelines</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-12 text-xs text-white/30 space-y-2">
            <Calendar className="mx-auto opacity-35" size={32} />
            <p>No academic events scheduled yet.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/[0.08] ml-4 pl-6 space-y-8 py-2">
            {events.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[hsl(20,8%,5%)] border border-accent ring-4 ring-accent/15 group-hover:scale-125 transition-transform" />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-semibold text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                      {evt.type}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono flex items-center gap-1">
                      <Clock size={10} /> {new Date(evt.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-sm text-white/95">{evt.title}</h4>
                  <p className="text-xs text-white/40 leading-relaxed font-light">{evt.description || 'No additional details.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
