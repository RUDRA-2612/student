'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers, 
  TrendingUp, 
  ChevronRight,
  Award
} from 'lucide-react'
import { TiltCard } from '@/components/ui/tilt-card'

interface Course {
  id: string
  name: string
  credits: number
  purpose: string
  topics: string[]
  labWork?: string[]
  activities?: string[]
  skills: string[]
  whyImportant: string
  formula?: {
    latex: string
    label: string
  }
}

const sem1Courses: Course[] = [
  {
    id: 'prog1',
    name: 'Programming-I',
    credits: 4,
    purpose: 'Teaches how computers solve problems through coding.',
    topics: [
      'Introduction to Programming',
      'Algorithms & Flowcharts',
      'Variables and Data Types',
      'Input / Output operations',
      'Conditional Statements (if-else)',
      'Loops (for, while)',
      'Functions',
      'Arrays & Strings',
      'Basic File Handling & Debugging'
    ],
    labWork: [
      'Pattern printing',
      'Calculator program',
      'Number guessing game',
      'Student management mini-project'
    ],
    skills: ['Problem Solving', 'Logical Thinking', 'Coding Foundation'],
    whyImportant: 'This is the base for DSA, AI, Machine Learning, and general Software Development.'
  },
  {
    id: 'feee',
    name: 'Fundamentals of Electrical & Electronics Engineering',
    credits: 4,
    purpose: 'Understanding how hardware and electrical systems work.',
    topics: [
      'Voltage, Current, Resistance & Ohm\'s Law',
      'Kirchhoff\'s Laws',
      'AC and DC Circuits',
      'Transformers & Motors',
      'Diodes & Transistors',
      'Logic Gates & Basic Circuits'
    ],
    labWork: [
      'Circuit design & Breadboard experiments',
      'Measuring voltage/current'
    ],
    skills: ['Hardware Understanding', 'Circuit Analysis'],
    whyImportant: 'Establishes hardware foundations necessary to understand computer architecture.',
    formula: {
      latex: 'V = I × R',
      label: "Ohm's Law"
    }
  },
  {
    id: 'dct',
    name: 'Design Creativity and Thinking',
    credits: 4,
    purpose: 'Develop innovation and startup mindset.',
    topics: [
      'Design Thinking & Problem Identification',
      'User Research & Empathy Mapping',
      'Brainstorming & Prototyping',
      'Innovation Process & Product Design'
    ],
    activities: [
      'Team Projects',
      'Product Redesign',
      'Case Studies',
      'Idea Pitching'
    ],
    skills: ['Innovation', 'Startup Thinking', 'Product Design'],
    whyImportant: 'Crucial for developing empathy with end-users and preparing for hackathons/entrepreneurship.'
  },
  {
    id: 'calculus',
    name: 'Calculus',
    credits: 4,
    purpose: 'Mathematics for Engineering and AI.',
    topics: [
      'Limits & Continuity',
      'Derivatives & Applications of Derivatives',
      'Indefinite & Definite Integration',
      'Area Under Curves'
    ],
    skills: ['Mathematical Modeling', 'AI Mathematics Foundation'],
    whyImportant: 'Calculus is the bedrock of machine learning optimization algorithms (gradient descent).',
    formula: {
      latex: 'f\'(x) = lim (h→0) [f(x+h) - f(x)] / h',
      label: 'Derivative Definition'
    }
  },
  {
    id: 'env',
    name: 'Environment & Sustainability',
    credits: 2,
    purpose: 'Understanding environmental challenges.',
    topics: [
      'Ecosystems & Climate Change',
      'Pollution control mechanisms',
      'Renewable Energy sources',
      'Sustainable Development Goals',
      'Water Conservation & Waste Management'
    ],
    skills: ['Environmental Awareness'],
    whyImportant: 'Increases awareness of social sustainability issues and green computing concepts.'
  },
  {
    id: 'comm',
    name: 'Fundamentals of Communication',
    credits: 2,
    purpose: 'Improve professional communication.',
    topics: [
      'English Grammar & Vocabulary',
      'Professional Writing & Emails',
      'Presentation Skills & Public Speaking',
      'Group Discussions & Resume Writing'
    ],
    activities: [
      'Presentations',
      'Debates',
      'GD Practice'
    ],
    skills: ['Communication', 'Interview Preparation'],
    whyImportant: 'Critical for passing HR rounds and technical interviews during campus placements.'
  }
]

const sem2Courses: Course[] = [
  {
    id: 'prog2',
    name: 'Programming-II',
    credits: 4,
    purpose: 'Move from basic coding to advanced programming concepts.',
    topics: [
      'Object Oriented Programming (OOP)',
      'Classes & Objects',
      'Inheritance & Polymorphism',
      'Encapsulation & Exception Handling',
      'Data Structures Basics'
    ],
    labWork: [
      'Banking System',
      'Library Management',
      'Student Portal'
    ],
    skills: ['OOP Principles', 'Software Development'],
    whyImportant: 'Prepares you for building production-ready apps and understanding advanced language frameworks.'
  },
  {
    id: 'de',
    name: 'Digital Electronics',
    credits: 4,
    purpose: 'Learn how computers work internally at the gate level.',
    topics: [
      'Number Systems & Binary Arithmetic',
      'Logic Gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)',
      'Boolean Algebra & Karnaugh Maps',
      'Flip-Flops, Registers & Counters'
    ],
    skills: ['Computer Hardware Understanding', 'Processor Foundations'],
    whyImportant: 'Direct foundation for Computer Organization and Architecture (COA) and chip design.'
  },
  {
    id: 'physics',
    name: 'Applied Physics',
    credits: 3,
    purpose: 'Physics concepts used in modern technology.',
    topics: [
      'Semiconductor Physics',
      'Lasers & Fiber Optics',
      'Quantum Mechanics Basics',
      'Electromagnetic Waves',
      'Nanotechnology Introduction'
    ],
    skills: ['Semiconductor Knowledge'],
    whyImportant: 'Explains the physical functioning of silicon transistors, microchips, and optical fibers.'
  },
  {
    id: 'lade',
    name: 'Linear Algebra & Differential Equations',
    credits: 4,
    purpose: 'Most important mathematics subject for AI/ML.',
    topics: [
      'Matrices & Determinants',
      'Eigen Values & Eigen Vectors',
      'Vector Spaces',
      'First Order & Second Order Differential Equations'
    ],
    skills: ['Mathematical Modeling', 'AI/ML Mathematics Foundation'],
    whyImportant: 'Linear algebra is the foundation of computer vision, NLP, and neural networks representation.',
    formula: {
      latex: 'A x = λ x',
      label: 'Eigenvalue Equation'
    }
  },
  {
    id: 'iks',
    name: 'Indian Knowledge System',
    credits: 2,
    purpose: 'Understanding India\'s scientific and intellectual heritage.',
    topics: [
      'Ancient Mathematics & Astronomy',
      'Ayurveda & Indian Philosophy',
      'Traditional Education Systems',
      'Contributions of Ancient Scholars'
    ],
    skills: ['Cultural Awareness'],
    whyImportant: 'Applies historical perspective to Indian scientific thought, logic, and mathematics.'
  },
  {
    id: 'cts',
    name: 'Critical Thinking & Storytelling',
    credits: 2,
    purpose: 'Learn structured thinking and communication.',
    topics: [
      'Logical Reasoning & Argument Analysis',
      'Decision Making processes',
      'Story Structure & Persuasive Communication',
      'Business Storytelling'
    ],
    activities: [
      'Case Studies',
      'Presentations',
      'Story Creation'
    ],
    skills: ['Critical Thinking', 'Product Management Skills'],
    whyImportant: 'Helps computer scientists frame their technical solutions into persuasive business cases.'
  }
]

const rankedSubjects = [
  { rank: 1, name: 'Programming-I', why: 'Fundamentals of logical coding; gateway to DSA.' },
  { rank: 2, name: 'Programming-II', why: 'OOP structures, essential for software projects.' },
  { rank: 3, name: 'Calculus', why: 'Essential optimization math for deep learning.' },
  { rank: 4, name: 'Linear Algebra & DE', why: 'Bedrock of AI/ML, computer vision representations.' },
  { rank: 5, name: 'Digital Electronics', why: 'Explains processors, registers, and OS mechanics.' },
  { rank: 6, name: 'Communication Skills', why: 'Crucial for passing placements & HR reviews.' }
]

export default function CurriculumGuide() {
  const [activeSem, setActiveSem] = useState<1 | 2>(1)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const courses = activeSem === 1 ? sem1Courses : sem2Courses
  const totalCredits = activeSem === 1 ? 20 : 19

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="border-b border-white/[0.04] pb-6">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-2">Curriculum Guide</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-[-0.02em]">
          B.Tech CSE <span className="italic text-white/40 font-serif" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>Syllabus Guide</span>
        </h1>
        <p className="text-white/40 text-xs font-light max-w-xl mt-3 leading-relaxed">
          Explore course credits, objective logs, core formulas, and career insights for B.Tech computer science.
        </p>
      </div>

      {/* Main Grid: Course Cards / Detail & ledger boards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Switcher & course list (8cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Semester switch tabs */}
            <div className="flex bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 gap-1">
              <button
                onClick={() => { setActiveSem(1); setSelectedCourse(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeSem === 1 ? 'bg-white text-black' : 'text-white/40 hover:text-white/80'
                }`}
              >
                Semester 1 ({totalCredits} Credits)
              </button>
              <button
                onClick={() => { setActiveSem(2); setSelectedCourse(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeSem === 2 ? 'bg-white text-black' : 'text-white/40 hover:text-white/80'
                }`}
              >
                Semester 2 (19 Credits)
              </button>
            </div>
            
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              Credits Log: {totalCredits} / 39 Year Total
            </span>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id
              return (
                <TiltCard
                  key={course.id}
                  maxTilt={10}
                  glareOpacity={0.06}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between h-56 relative overflow-hidden group ${
                    isSelected 
                      ? 'border-white/30 bg-white/[0.03]' 
                      : 'border-white/[0.06] bg-[#050505] hover:bg-white/[0.01] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-4" style={{ transform: 'translateZ(15px)' }}>
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] font-mono font-bold text-white/40 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded">
                        {course.credits} CREDITS
                      </span>
                      {course.formula && (
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/[0.05] border border-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          Equation
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-normal text-white group-hover:text-white transition-colors" style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                      {course.name}
                    </h3>
                    <p className="text-xs text-white/45 line-clamp-3 font-light leading-relaxed">
                      {course.purpose}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-[10px] text-white/30 group-hover:text-white/60 transition-colors" style={{ transform: 'translateZ(20px)' }}>
                    <span className="uppercase font-mono tracking-wider font-semibold">
                      Explore Topics
                    </span>
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </TiltCard>
              )
            })}
          </div>
        </div>

        {/* Right pane: Course detail blueprints & ranks (4cols) */}
        <div className="lg:col-span-4 space-y-6">
          <AnimatePresence mode="wait">
            {selectedCourse ? (
              <motion.div
                key={selectedCourse.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl border border-white/[0.08] bg-[#050505] space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                  <h3 className="text-sm font-semibold text-white/80">
                    {selectedCourse.name}
                  </h3>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 text-xs font-light leading-relaxed text-white/60">
                  <div className="space-y-1">
                    <p className="font-semibold text-white/40 uppercase tracking-widest text-[9px] font-mono">Objective</p>
                    <p className="text-white/70">{selectedCourse.purpose}</p>
                  </div>

                  {selectedCourse.formula && (
                    <div className="p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl text-center space-y-1.5 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-0.5 bg-white/20" />
                      <p className="text-[8px] uppercase tracking-widest text-white/30 font-mono">{selectedCourse.formula.label}</p>
                      <p className="font-mono text-xs font-bold text-white/90">
                        {selectedCourse.formula.latex}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="font-semibold text-white/40 uppercase tracking-widest text-[9px] font-mono">Core Syllabus</p>
                    <ul className="list-disc list-inside space-y-0.5 text-white/50 pl-1">
                      {selectedCourse.topics.slice(0, 5).map((topic, i) => (
                        <li key={i} className="truncate">{topic}</li>
                      ))}
                      {selectedCourse.topics.length > 5 && (
                        <li className="text-[9px] text-white/30 font-semibold list-none mt-1">+ {selectedCourse.topics.length - 5} additional topics</li>
                      )}
                    </ul>
                  </div>

                  {selectedCourse.skills && (
                    <div className="space-y-1.5">
                      <p className="font-semibold text-white/40 uppercase tracking-widest text-[9px] font-mono">Skills Log</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCourse.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-[9px] text-white/75">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 border-t border-white/[0.04] pt-3">
                    <p className="font-semibold text-white/50 uppercase tracking-widest text-[9px] font-mono flex items-center gap-1">
                      <Award size={10} /> Placement Scope
                    </p>
                    <p className="text-white/40 text-[10px] leading-relaxed italic">
                      "{selectedCourse.whyImportant}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-2xl border border-white/[0.06] bg-[#050505] text-center py-10 space-y-3"
              >
                <Layers className="mx-auto text-white/15 animate-pulse" size={28} />
                <h3 className="font-semibold text-xs text-white/70">Course Details</h3>
                <p className="text-white/30 text-[11px] leading-relaxed max-w-xs mx-auto font-light">
                  Select any textbook card on the left to inspect topic coverage, equations, and career relevance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Career Importance Rankings (Editorial Ledger) */}
          <div className="p-6 rounded-2xl border border-white/[0.06] bg-[#050505] space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
              <TrendingUp size={14} className="text-white/40" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Placement Importance
              </h3>
            </div>
            
            <div className="space-y-3">
              {rankedSubjects.map((sub) => (
                <div key={sub.rank} className="flex gap-3 text-[11px] font-light">
                  <span className="font-mono text-white/20 text-xs w-4 shrink-0">
                    {sub.rank}.
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white/85">{sub.name}</p>
                    <p className="text-[10px] text-white/30 leading-relaxed font-light">{sub.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
