'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Layers, 
  TrendingUp, 
  ChevronRight,
  BookOpenCheck
} from 'lucide-react'

// Course Structure types
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
      latex: 'V = I \\times R',
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
      latex: '\\frac{d}{dx}(x^n) = n x^{n-1}',
      label: 'Power Rule of Derivatives'
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
      latex: 'A x = b',
      label: 'Matrix Equation'
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
  { rank: 2, name: 'Programming-II', why: 'OOP structures, essential for software design & projects.' },
  { rank: 3, name: 'Calculus', why: 'Essential optimization math for deep learning.' },
  { rank: 4, name: 'Linear Algebra & DE', why: 'Bedrock of AI/ML, computer vision, and data representations.' },
  { rank: 5, name: 'Digital Electronics', why: 'Explains processors, registers, and OS level computing.' },
  { rank: 6, name: 'Communication Skills', why: 'Crucial for interviews, pitching, and professional growth.' },
  { rank: 7, name: 'Critical Thinking', why: 'Develops product-oriented mindsets and reasoning.' }
]

export default function CurriculumGuide() {
  const [activeSem, setActiveSem] = useState<1 | 2>(1)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const courses = activeSem === 1 ? sem1Courses : sem2Courses
  const totalCredits = activeSem === 1 ? 20 : 19

  return (
    <div className="space-y-10">
      {/* Header section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
          <BookOpenCheck size={14} className="animate-pulse" />
          JK Lakshmipat University
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          B.Tech CSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-brand-coral">Curriculum Guide</span>
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-xl font-light">
          A detailed breakdown of Semester 1 & Semester 2 courses, credits, key skills, and placement importance.
        </p>
      </div>

      {/* Main Grid: Left side Course Cards / Right side details & rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left pane: Switcher & course list (8cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            {/* Semester switch tabs */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => { setActiveSem(1); setSelectedCourse(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeSem === 1 ? 'bg-accent text-white shadow-md shadow-accent/25' : 'text-white/40 hover:text-white/80'
                }`}
              >
                Semester 1 (20 Credits)
              </button>
              <button
                onClick={() => { setActiveSem(2); setSelectedCourse(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeSem === 2 ? 'bg-accent text-white shadow-md shadow-accent/25' : 'text-white/40 hover:text-white/80'
                }`}
              >
                Semester 2 (19 Credits)
              </button>
            </div>
            
            <span className="text-xs font-mono text-white/40">
              Semester Credits: {totalCredits} | Total Year Credits: 39
            </span>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id
              return (
                <motion.div
                  key={course.id}
                  layoutId={`card-${course.id}`}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-5 rounded-xl cursor-pointer border transition-all flex flex-col justify-between gap-4 relative overflow-hidden group ${
                    isSelected 
                      ? 'border-accent bg-accent/5 shadow-lg shadow-accent/5' 
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                        {course.credits} Credits
                      </span>
                      {course.formula && (
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50 font-mono">
                          Formula
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-accent transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-3 font-light leading-relaxed">
                      {course.purpose}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 text-xs text-white/40 group-hover:text-white transition-colors">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
                      Details & Topics
                    </span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right pane: Selected Course Detail Panel & Career Rankings (4cols) */}
        <div className="lg:col-span-4 space-y-6">
          <AnimatePresence mode="wait">
            {selectedCourse ? (
              <motion.div
                key={selectedCourse.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 rounded-xl border border-accent/20 bg-accent/5 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="font-display font-bold text-lg text-white">
                    {selectedCourse.name}
                  </h3>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-4 text-xs font-light leading-relaxed text-white/70">
                  <div className="space-y-1">
                    <p className="font-bold text-accent uppercase tracking-wider text-[10px]">Objective</p>
                    <p className="text-white/80">{selectedCourse.purpose}</p>
                  </div>

                  {selectedCourse.formula && (
                    <div className="p-3 bg-black/40 border border-white/5 rounded-lg text-center space-y-1">
                      <p className="text-[9px] uppercase tracking-wider text-white/40 font-mono">{selectedCourse.formula.label}</p>
                      <p className="font-mono text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent to-brand-coral">
                        {selectedCourse.formula.latex}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="font-bold text-accent uppercase tracking-wider text-[10px]">Core Topics</p>
                    <ul className="list-disc list-inside space-y-0.5 text-white/60">
                      {selectedCourse.topics.slice(0, 6).map((topic, i) => (
                        <li key={i} className="truncate">{topic}</li>
                      ))}
                      {selectedCourse.topics.length > 6 && (
                        <li className="text-[10px] text-accent/80 font-semibold list-none">+ {selectedCourse.topics.length - 6} more topics</li>
                      )}
                    </ul>
                  </div>

                  {(selectedCourse.labWork || selectedCourse.activities) && (
                    <div className="space-y-1">
                      <p className="font-bold text-accent uppercase tracking-wider text-[10px]">Lab Work & Activities</p>
                      <ul className="list-disc list-inside space-y-0.5 text-white/60">
                        {(selectedCourse.labWork || selectedCourse.activities)?.map((act, i) => (
                          <li key={i} className="truncate">{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <p className="font-bold text-accent uppercase tracking-wider text-[10px]">Skills Acquired</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCourse.skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/80">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-white/[0.06] pt-3">
                    <p className="font-bold text-brand-mint uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <Sparkles size={10} /> Placement & Placement Importance
                    </p>
                    <p className="text-white/60 text-[11px] leading-relaxed italic">
                      "{selectedCourse.whyImportant}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center space-y-4"
              >
                <Layers className="mx-auto text-white/20 animate-bounce" size={36} />
                <h3 className="font-display font-semibold text-sm">Course Exploration</h3>
                <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto">
                  Click on any course card to reveal full details, core topics, lab work, formulas, and placment insight.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Placement Importance Rankings */}
          <div className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
              <TrendingUp size={16} className="text-brand-amber" />
              <h3 className="font-display font-bold text-sm text-white">
                Career Importance Ranking
              </h3>
            </div>
            
            <div className="space-y-3">
              {rankedSubjects.map((sub) => (
                <div key={sub.rank} className="flex gap-3 text-xs">
                  <span className="font-mono font-bold text-brand-amber text-sm w-4 shrink-0">
                    {sub.rank}.
                  </span>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white/95">{sub.name}</p>
                    <p className="text-[10px] text-white/40 leading-relaxed font-light">{sub.why}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.06] pt-3 text-[11px] text-white/40 italic text-center font-light">
              Mastering these 7 courses in first year guarantees a smooth transition to DSA, DBMS, and AI/ML.
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
