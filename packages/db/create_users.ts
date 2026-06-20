import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const users = [
  { name: 'Rudrapal Singh Shekhawat', email: 'rudrapal2612@gmail.com', password: 'Admin1234567', role: Role.ADMIN },
  { name: 'Rudrapal', email: 'r@gmail.com', password: 'R1234567', role: Role.STUDENT },
  { name: 'Shubh', email: 's@gmail.com', password: 'S1234567', role: Role.STUDENT },
]

async function main() {
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      console.log(`⚠️  Already exists: ${u.email}`)
      continue
    }
    const passwordHash = await bcrypt.hash(u.password, 10)
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        profile: { create: { bio: 'The Backbenchers account.' } },
      },
    })
    console.log(`✅ Created ${u.role}: ${user.email}  (id: ${user.id})`)
  }
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
