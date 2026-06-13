import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Please provide an email address. Example: npx ts-node promote_user.ts user@example.com')
    process.exit(1)
  }

  const normalizedEmail = email.toLowerCase().trim()
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  })

  if (!user) {
    console.error(`User with email "${normalizedEmail}" not found in database.`)
    process.exit(1)
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: Role.ADMIN },
    select: { email: true, role: true }
  })

  console.log(`Successfully promoted ${updatedUser.email} to ${updatedUser.role}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
