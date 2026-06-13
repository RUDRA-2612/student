import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@examedge.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  })

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email)
    if (existingAdmin.role !== Role.ADMIN && existingAdmin.role !== Role.SUPERADMIN) {
      await prisma.user.update({
        where: { email },
        data: { role: Role.ADMIN }
      })
      console.log('Updated role of admin@examedge.com to ADMIN')
    }
  } else {
    const admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email,
        role: Role.ADMIN,
        profile: {
          create: {
            bio: 'Platform System Admin Account',
          }
        }
      }
    })
    console.log('Successfully created admin user:', admin.email)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
