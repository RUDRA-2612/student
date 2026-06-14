import { PrismaClient, Role, ExamType, Difficulty, QuestionType, ImportanceLevel } from '@prisma/client'
import * as crypto from 'crypto'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up
  await prisma.solution.deleteMany()
  await prisma.paper.deleteMany()
  await prisma.question.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.subject.deleteMany()

  // Bootstrap Admin Account
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || crypto.randomBytes(16).toString('hex')
  const passwordHash = bcrypt.hashSync(initialPassword, 10)

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@examedge.com',
      role: Role.ADMIN,
      passwordHash,
      profile: {
        create: {
          bio: 'Platform System Admin Account',
        }
      }
    }
  })
  console.log('Admin user seeded:', admin.email)
  console.log('==================================================')
  console.log('ADMIN ACCOUNT BOOTSTRAP DETAILS:')
  console.log(`Email:    ${admin.email}`)
  console.log(`Password: ${initialPassword}`)
  if (!process.env.ADMIN_INITIAL_PASSWORD) {
    console.log('WARNING: This password was dynamically generated. Save it securely!')
  }
  console.log('==================================================')

  // Seed JKLU CSE Semester 1 Subjects
  const prog1 = await prisma.subject.create({
    data: {
      name: 'Programming-I',
      code: 'CSE101',
      description: 'Learn problem-solving through coding, variables, loops, functions, arrays, strings, and debugging.',
      category: 'Core CSE',
      sortOrder: 1,
    }
  })

  await prisma.subject.create({
    data: {
      name: 'Fundamentals of Electrical & Electronics Engineering',
      code: 'EEE101',
      description: 'Voltage, Ohm\'s law, Kirchhoff\'s laws, AC/DC circuits, transformers, logic gates, and transistors.',
      category: 'Engineering',
      sortOrder: 2,
    }
  })

  await prisma.subject.create({
    data: {
      name: 'Design Creativity and Thinking',
      code: 'DES101',
      description: 'Develop startup mindset, user research, empathy mapping, brainstorming, prototyping, and idea pitching.',
      category: 'Design & Thinking',
      sortOrder: 3,
    }
  })

  const calculus = await prisma.subject.create({
    data: {
      name: 'Calculus',
      code: 'MTH101',
      description: 'Differential and integral calculus, derivatives, limits, definite integrals, and mathematical modeling.',
      category: 'Mathematics',
      sortOrder: 4,
    }
  })

  await prisma.subject.create({
    data: {
      name: 'Environment & Sustainability',
      code: 'ENV101',
      description: 'Ecosystems, climate change, pollution, renewable energy sources, water conservation, and waste management.',
      category: 'Humanities',
      sortOrder: 5,
    }
  })

  await prisma.subject.create({
    data: {
      name: 'Fundamentals of Communication',
      code: 'COM101',
      description: 'Improve professional grammar, emails, public speaking, resume writing, and interview preparation.',
      category: 'Communication',
      sortOrder: 6,
    }
  })

  // Seed JKLU CSE Semester 2 Subjects
  await prisma.subject.create({
    data: {
      name: 'Programming-II',
      code: 'CSE102',
      description: 'Transition from basic coding to Object Oriented Programming: classes, inheritance, polymorphism, encapsulation, and basic data structures.',
      category: 'Core CSE',
      sortOrder: 7,
    }
  })

  const de = await prisma.subject.create({
    data: {
      name: 'Digital Electronics',
      code: 'ECE102',
      description: 'Binary arithmetic, logic gates, Boolean algebra, Karnaugh maps, flip-flops, registers, counters, and CPU foundations.',
      category: 'Core CSE',
      sortOrder: 8,
    }
  })

  await prisma.subject.create({
    data: {
      name: 'Applied Physics',
      code: 'PHY102',
      description: 'Semiconductor physics, lasers, fiber optics, electromagnetic waves, and introduction to nanotechnology.',
      category: 'Science',
      sortOrder: 9,
    }
  })

  const lade = await prisma.subject.create({
    data: {
      name: 'Linear Algebra & Differential Equations',
      code: 'MTH102',
      description: 'Matrices, determinants, eigenvalues, vector spaces, and differential equations. Essential for AI/ML.',
      category: 'Mathematics',
      sortOrder: 10,
    }
  })

  await prisma.subject.create({
    data: {
      name: 'Indian Knowledge System',
      code: 'IKS102',
      description: 'Ancient Indian mathematics, astronomy, philosophy, Ayurveda, and contributions of ancient scholars.',
      category: 'Humanities',
      sortOrder: 11,
    }
  })

  const ctStory = await prisma.subject.create({
    data: {
      name: 'Critical Thinking & Storytelling',
      code: 'DES102',
      description: 'Logical reasoning, argument analysis, story structure, persuasive business communication, and decision making.',
      category: 'Design & Thinking',
      sortOrder: 12,
    }
  })

  console.log('JKLU CSE First-Year Subjects seeded successfully.')

  // Seed tags
  const codeTag = await prisma.tag.create({
    data: { name: 'Coding Patterns', subjectId: prog1.id }
  })
  await prisma.tag.create({
    data: { name: 'Logic Gates', subjectId: de.id }
  })
  const mathTag = await prisma.tag.create({
    data: { name: 'Calculus Derivatives', subjectId: calculus.id }
  })

  // Seed Mock Exam Papers
  const paper1 = await prisma.paper.create({
    data: {
      title: 'Programming-I Endterm Exam 2025',
      subjectId: prog1.id,
      year: 2025,
      examType: ExamType.FINAL,
      university: 'JK Lakshmipat University',
      difficulty: Difficulty.MEDIUM,
      pdfUrl: 'https://example.com/jklu-cse101-2025.pdf',
      pdfKey: 'jklu-cse101-2025-key',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isPublished: true,
      createdBy: admin.id,
      tags: {
        connect: [{ id: codeTag.id }]
      }
    }
  })

  const paper2 = await prisma.paper.create({
    data: {
      title: 'Calculus Midterm Exam 2025',
      subjectId: calculus.id,
      year: 2025,
      examType: ExamType.MIDTERM,
      university: 'JK Lakshmipat University',
      difficulty: Difficulty.HARD,
      pdfUrl: 'https://example.com/jklu-mth101-2025.pdf',
      pdfKey: 'jklu-mth101-2025-key',
      isPublished: true,
      createdBy: admin.id,
      tags: {
        connect: [{ id: mathTag.id }]
      }
    }
  })

  const paper3 = await prisma.paper.create({
    data: {
      title: 'Critical Thinking & Storytelling Endterm Exam 2025',
      subjectId: ctStory.id,
      year: 2025,
      examType: ExamType.FINAL,
      university: 'JK Lakshmipat University',
      difficulty: Difficulty.MEDIUM,
      pdfUrl: '/uploads/papers/ccct_endterm_2025.pdf',
      isPublished: true,
      createdBy: admin.id,
    }
  })

  const paper4 = await prisma.paper.create({
    data: {
      title: 'Linear Algebra & Differential Equations Endterm Exam 2025',
      subjectId: lade.id,
      year: 2025,
      examType: ExamType.FINAL,
      university: 'JK Lakshmipat University',
      difficulty: Difficulty.MEDIUM,
      pdfUrl: '/uploads/papers/linear_algebra_endterm_2025.pdf',
      isPublished: true,
      createdBy: admin.id,
    }
  })

  console.log('Mock papers seeded:', paper1.title, ',', paper2.title, ',', paper3.title, ',', paper4.title)

  // Seed Solutions
  await prisma.solution.create({
    data: {
      paperId: paper1.id,
      content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Detailed solutions for pattern printing, number guessing games, and functions."}]}]}',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isPublished: true,
      createdBy: admin.id
    }
  })

  // Seed practice questions
  await prisma.question.create({
    data: {
      subjectId: prog1.id,
      text: 'Write a C/Python program to print a hollow diamond pattern of stars for N lines.',
      topic: 'Pattern Printing',
      chapter: 'Loops',
      type: QuestionType.LONG_ANSWER,
      marks: 8,
      importance: ImportanceLevel.VERY_HIGH,
      yearLastAsked: 2024,
      modelAnswer: 'A nested loop program printing spaces and stars based on row index coordinates.',
      isPublished: true,
      predictedScore: 0.92,
      createdBy: admin.id
    }
  })

  await prisma.question.create({
    data: {
      subjectId: de.id,
      text: 'Explain the working of XOR and XNOR logic gates. Construct their truth tables and circuit diagrams.',
      topic: 'Logic Gates',
      chapter: 'Digital Circuits',
      type: QuestionType.LONG_ANSWER,
      marks: 10,
      importance: ImportanceLevel.HIGH,
      yearLastAsked: 2025,
      modelAnswer: 'XOR outputs high only if input combinations are unequal. XNOR outputs high only if input combinations are equal.',
      isPublished: true,
      predictedScore: 0.88,
      createdBy: admin.id
    }
  })

  await prisma.question.create({
    data: {
      subjectId: lade.id,
      text: 'Define eigenvalues and eigenvectors of a matrix A. Solve for the system Ax = b.',
      topic: 'Linear Algebra',
      chapter: 'Matrices',
      type: QuestionType.LONG_ANSWER,
      marks: 12,
      importance: ImportanceLevel.VERY_HIGH,
      yearLastAsked: 2025,
      modelAnswer: 'Eigenvalues λ satisfy det(A - λI) = 0. Eigenvectors x satisfy Ax = λx.',
      isPublished: true,
      predictedScore: 0.95,
      createdBy: admin.id
    }
  })

  // Seed FAQs
  await prisma.fAQ.create({
    data: {
      question: 'Which mathematics courses are most important for AI/ML specialization?',
      answer: 'Calculus (Semester 1) and Linear Algebra & Differential Equations (Semester 2) form the direct foundations of optimization, neural nets, and ML algorithms. Pay close attention to matrix transformations and gradients.',
      category: 'Results',
      isPublished: true,
      createdBy: admin.id
    }
  })

  await prisma.fAQ.create({
    data: {
      question: 'How does the AI Predictor estimate questions for the next exam?',
      answer: 'It processes syllabus topics, history of questions asked in previous years (PYQs), and the importance weights specified in the curriculum, passing them to our LLM analyzer to rank predictive scores.',
      category: 'Platform',
      isPublished: true,
      createdBy: admin.id
    }
  })

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
