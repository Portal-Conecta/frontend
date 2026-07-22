import type { ClassMember } from './types'

export const CLASS_REPRESENTATIVE_LIMIT = 2

export const CLASS_REPRESENTATIVE_LIMIT_MESSAGE =
  'Remova os representantes da lista e selecione outros 2 representantes'

export function getRepresentativeMembers(members: ClassMember[]): ClassMember[] {
  return members.filter((member) => member.role === 'REPRESENTATIVE')
}

export function getRepresentativeCandidateStudents(
  members: ClassMember[],
  representatives: ClassMember[] = [],
): ClassMember[] {
  const representativeIds = new Set(representatives.map((member) => member.id))

  return members.filter((member) => member.role === 'STUDENT' && !representativeIds.has(member.id))
}

export function hasRepresentativeLimitReached(representatives: ClassMember[]): boolean {
  return representatives.length >= CLASS_REPRESENTATIVE_LIMIT
}
