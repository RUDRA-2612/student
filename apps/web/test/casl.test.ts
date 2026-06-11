import { describe, it, expect } from 'vitest'
import { defineAbilityFor } from '../lib/casl'

describe('CASL authorization ability constraints', () => {
  it('should allow guest users (unauthenticated) to read Papers and FAQs only', () => {
    const ability = defineAbilityFor(null)
    expect(ability.can('read', 'Paper')).toBe(true)
    expect(ability.can('read', 'FAQ')).toBe(true)
    expect(ability.can('read', 'Question')).toBe(false)
    expect(ability.can('create', 'StudentRequest')).toBe(false)
  })

  it('should restrict STUDENT role to reading papers, questions, FAQs and creating requests', () => {
    const student = { id: 'usr-1', role: 'STUDENT' }
    const ability = defineAbilityFor(student)
    expect(ability.can('read', 'Paper')).toBe(true)
    expect(ability.can('read', 'Question')).toBe(true)
    expect(ability.can('read', 'Solution')).toBe(true)
    expect(ability.can('create', 'StudentRequest')).toBe(true)
    expect(ability.can('manage', 'Paper')).toBe(false)
    expect(ability.can('read', 'Analytics')).toBe(false)
  })

  it('should allow ADMIN role to manage content but block User modifications', () => {
    const admin = { id: 'usr-2', role: 'ADMIN' }
    const ability = defineAbilityFor(admin)
    expect(ability.can('manage', 'Paper')).toBe(true)
    expect(ability.can('manage', 'Subject')).toBe(true)
    expect(ability.can('read', 'Analytics')).toBe(true)
    expect(ability.can('manage', 'User')).toBe(false)
    expect(ability.can('delete', 'User')).toBe(false)
  })

  it('should allow SUPERADMIN role to manage all subjects and modules', () => {
    const superAdmin = { id: 'usr-3', role: 'SUPERADMIN' }
    const ability = defineAbilityFor(superAdmin)
    expect(ability.can('manage', 'User')).toBe(true)
    expect(ability.can('delete', 'User')).toBe(true)
    expect(ability.can('manage', 'all')).toBe(true)
  })
})
