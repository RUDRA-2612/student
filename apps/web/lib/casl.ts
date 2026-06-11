import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability'

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'publish'
type Subjects = 'Paper' | 'Question' | 'Solution' | 'FAQ' | 'Announcement' |
                'StudentRequest' | 'Subject' | 'User' | 'Analytics' | 'all'

export type AppAbility = MongoAbility<[Actions, Subjects]>

export function defineAbilityFor(user?: { id: string; role: string } | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (!user) {
    can('read', ['Paper', 'FAQ'])
    return build()
  }

  if (user.role === 'STUDENT') {
    can('read', ['Paper', 'Question', 'Solution', 'FAQ', 'Announcement'])
    can('create', 'StudentRequest')
    can('read', 'StudentRequest', { userId: user.id } as any)
  }

  if (user.role === 'ADMIN') {
    can('manage', ['Paper', 'Question', 'Solution', 'FAQ', 'Announcement', 'Subject', 'StudentRequest'])
    can('read', 'Analytics')
    cannot('manage', 'User')
    cannot('delete', 'User')
  }

  if (user.role === 'SUPERADMIN') {
    can('manage', 'all')
  }

  return build()
}
