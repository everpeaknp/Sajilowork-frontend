import { userService } from '@/services';
import type { UserSkill, UserSkillInput } from '@/types';

export const SKILL_CATEGORIES = [
  'skill',
  'transport',
  'language',
  'qualification',
  'experience',
] as const;

export type SkillCategoryKey = (typeof SKILL_CATEGORIES)[number];

export const CATEGORY_ALIASES: Record<string, SkillCategoryKey> = {
  skill: 'skill',
  skills: 'skill',
  transport: 'transport',
  transportation: 'transport',
  language: 'language',
  languages: 'language',
  qualification: 'qualification',
  qualifications: 'qualification',
  experience: 'experience',
  experiences: 'experience',
  work: 'experience',
  'work experience': 'experience',
};

/** Prefer specific sections when the same name appears in multiple inputs. */
export const CATEGORY_PRIORITY: Record<SkillCategoryKey, number> = {
  experience: 5,
  qualification: 4,
  language: 3,
  skill: 2,
  transport: 1,
};

export function normalizeSkillCategory(category?: string): SkillCategoryKey {
  const raw = (category || 'skill').toLowerCase().trim();
  return CATEGORY_ALIASES[raw] ?? (SKILL_CATEGORIES.includes(raw as SkillCategoryKey) ? (raw as SkillCategoryKey) : 'skill');
}

export function skillNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function buildDesiredSkills(
  skills: string[],
  transport: string[],
  languages: string[],
  qualifications: string[],
  experience: string[],
): UserSkillInput[] {
  const level = 'intermediate' as const;
  return [
    ...skills.map((name) => ({ name, category: 'skill', proficiency_level: level })),
    ...transport.map((name) => ({ name, category: 'transport', proficiency_level: level })),
    ...languages.map((name) => ({ name, category: 'language', proficiency_level: level })),
    ...qualifications.map((name) => ({
      name,
      category: 'qualification',
      proficiency_level: level,
    })),
    ...experience.map((name) => ({ name, category: 'experience', proficiency_level: level })),
  ];
}

/** DB enforces unique skill name per user — keep one category per name. */
export function dedupeByName(items: UserSkillInput[]): {
  items: UserSkillInput[];
  duplicates: string[];
} {
  const seen = new Map<string, UserSkillInput>();
  const duplicates: string[] = [];

  for (const item of items) {
    const key = skillNameKey(item.name);
    const normalized: UserSkillInput = {
      ...item,
      category: normalizeSkillCategory(item.category),
    };
    const existing = seen.get(key);
    if (existing) {
      duplicates.push(item.name);
      const existingPri = CATEGORY_PRIORITY[normalizeSkillCategory(existing.category)];
      const nextPri = CATEGORY_PRIORITY[normalizeSkillCategory(normalized.category)];
      if (nextPri > existingPri) {
        seen.set(key, normalized);
      }
    } else {
      seen.set(key, normalized);
    }
  }

  return { items: Array.from(seen.values()), duplicates };
}

export async function syncUserSkills(existing: UserSkill[], desired: UserSkillInput[]): Promise<void> {
  const desiredByName = new Map<string, UserSkillInput>();
  for (const item of desired) {
    desiredByName.set(skillNameKey(item.name), {
      ...item,
      name: item.name.trim(),
      category: normalizeSkillCategory(item.category),
    });
  }

  const existingByName = new Map<string, UserSkill>();
  for (const skill of existing) {
    existingByName.set(skillNameKey(skill.name), skill);
  }

  for (const skill of existing) {
    if (!desiredByName.has(skillNameKey(skill.name))) {
      const response = await userService.deleteSkill(skill.id);
      if (!response.success) {
        throw new Error(`Failed to remove ${skill.name}`);
      }
    }
  }

  for (const desiredSkill of desiredByName.values()) {
    const key = skillNameKey(desiredSkill.name);
    const current = existingByName.get(key);

    if (current) {
      const nextCategory = normalizeSkillCategory(desiredSkill.category);
      const currentCategory = normalizeSkillCategory(current.category);
      const updates: Partial<UserSkillInput> = {};
      if (nextCategory !== currentCategory) {
        updates.category = nextCategory;
      }
      if (
        desiredSkill.proficiency_level &&
        desiredSkill.proficiency_level !== current.proficiency_level
      ) {
        updates.proficiency_level = desiredSkill.proficiency_level;
      }
      const desiredDetails = desiredSkill.details ?? '';
      const currentDetails = current.details ?? '';
      if (desiredDetails !== currentDetails) {
        updates.details = desiredDetails;
      }
      if (Object.keys(updates).length > 0) {
        const response = await userService.updateSkill(current.id, updates);
        if (!response.success) {
          throw new Error(`Failed to update ${desiredSkill.name}`);
        }
      }
      continue;
    }

    const response = await userService.addSkill({
      name: desiredSkill.name.trim(),
      details: desiredSkill.details,
      category: normalizeSkillCategory(desiredSkill.category),
      proficiency_level: desiredSkill.proficiency_level || 'intermediate',
      years_of_experience: desiredSkill.years_of_experience ?? 0,
    });

    if (!response.success) {
      const duplicateName =
        response.errors?.name?.[0]?.includes('already have a skill') ?? false;
      if (duplicateName) {
        const refreshed = await userService.getSkills();
        const match = refreshed.data?.find((s) => skillNameKey(s.name) === key);
        if (match) {
          const update = await userService.updateSkill(match.id, {
            category: normalizeSkillCategory(desiredSkill.category),
            proficiency_level: desiredSkill.proficiency_level,
            details: desiredSkill.details,
          });
          if (update.success) continue;
        }
      }

      const msg =
        response.errors?.name?.[0] ||
        response.message ||
        `Failed to add ${desiredSkill.name}`;
      throw new Error(msg);
    }
  }
}
