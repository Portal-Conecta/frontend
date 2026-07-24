import type { ClassRole, CurrentUser } from "@portal/core/rbac";

/**
 * Como a turma do preenchimento é resolvida, por perfil:
 * - `fixed`: turma única já conhecida (representante, ou professor com 1 turma).
 * - `teacher`: professor com várias turmas — escolhe entre as dele.
 * - `admin`: escolhe entre todas as turmas.
 * - `none`: perfil sem acesso ao preenchimento (SENAI/WEG, ou sem vínculo).
 */
export type ClassSelection =
  | { mode: "fixed"; classId: string }
  | { mode: "teacher"; classIds: string[] }
  | { mode: "admin" }
  | { mode: "none" };

function classIdsWithRole(user: CurrentUser, role: ClassRole): string[] {
  return user.classes.filter((c) => c.role === role).map((c) => c.classId);
}

export function resolveClassSelection(
  user: CurrentUser | null,
): ClassSelection {
  if (!user) {
    return { mode: "none" };
  }

  if (user.userType === "ADMIN") {
    return { mode: "admin" };
  }

  if (user.userType === "TEACHER") {
    const ids = classIdsWithRole(user, "TEACHER");
    if (ids.length === 0) return { mode: "none" };
    if (ids.length === 1) return { mode: "fixed", classId: ids[0]! };
    return { mode: "teacher", classIds: ids };
  }

  // STUDENT / REPRESENTATIVE preenchem como representante da turma.
  const [repClassId] = classIdsWithRole(user, "REPRESENTATIVE");
  if (repClassId) {
    return { mode: "fixed", classId: repClassId };
  }

  return { mode: "none" };
}
