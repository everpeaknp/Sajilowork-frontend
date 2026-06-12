import {
  formatHourlyRate,
  STANDARD_HOURLY_RATE_OPTIONS,
} from '@/lib/nepalLocale';
import { dedupeByName, normalizeSkillCategory, type SkillCategoryKey } from '@/lib/userSkillsSync';
import type { UserSkill, UserSkillInput } from '@/types';

export const EDU_PREFIX = 'EDU::';
export const EXP_PREFIX = 'EXP::';
export const AWD_PREFIX = 'AWD::';
export const META_PREFIX = 'META::';
const META_PROFILE_ID = 'profile';

export type EducationEntry = {
  id: string;
  yearRange: string;
  degree: string;
  institution: string;
  description: string;
};

export type ExperienceEntry = {
  id: string;
  yearRange: string;
  title: string;
  company: string;
  description: string;
};

export type AwardEntry = {
  id: string;
  yearRange: string;
  title: string;
  issuer: string;
  description: string;
};

export type SkillRow = {
  skill: string;
  point: string;
};

export type LanguageRow = {
  language: string;
  level: string;
};

export const DASHBOARD_TO_API_TRANSPORT: Record<string, string> = {
  Walking: 'Walk',
};

export const API_TO_DASHBOARD_TRANSPORT: Record<string, string> = {
  Walk: 'Walking',
};

const LEVEL_TO_PROFICIENCY: Record<string, 'beginner' | 'intermediate' | 'expert'> = {
  Basic: 'beginner',
  Conversational: 'intermediate',
  Fluent: 'expert',
  'Native / Bilingual': 'expert',
};

export function pointToProficiency(point: string): 'beginner' | 'intermediate' | 'expert' {
  const value = Number.parseInt(point, 10);
  if (Number.isNaN(value) || value < 70) return 'beginner';
  if (value < 85) return 'intermediate';
  return 'expert';
}

export function proficiencyToPoint(level?: string): string {
  if (level === 'beginner') return '60';
  if (level === 'expert') return '90';
  return '75';
}

export function proficiencyToLanguageLevel(level?: string): string {
  if (level === 'beginner') return 'Basic';
  if (level === 'expert') return 'Fluent';
  if (level === 'intermediate') return 'Conversational';
  return 'Select';
}

function decodeLegacyRecord(
  name: string,
  prefix: string,
): { id: string; payload: Record<string, string> } | null {
  if (!name.startsWith(prefix)) return null;
  const rest = name.slice(prefix.length);
  const separator = rest.indexOf('::');
  if (separator < 0) return null;
  const id = rest.slice(0, separator);
  const encoded = rest.slice(separator + 2);
  try {
    const payload = JSON.parse(decodeURIComponent(encoded)) as Record<string, string>;
    return { id, payload };
  } catch {
    return null;
  }
}

function encodeDashboardSkill(
  prefix: string,
  id: string,
  category: SkillCategoryKey,
  payload: Record<string, string>,
): UserSkillInput {
  return {
    name: `${prefix}${id}`,
    details: JSON.stringify(payload),
    category,
    proficiency_level: 'intermediate',
  };
}

function decodeDashboardSkill(
  skill: UserSkill,
  prefix: string,
): { id: string; payload: Record<string, string> } | null {
  const name = skill.name;
  if (!name.startsWith(prefix)) return null;

  const legacy = decodeLegacyRecord(name, prefix);
  if (legacy) return legacy;

  const id = name.slice(prefix.length);
  if (!id) return null;

  const details = skill.details?.trim();
  if (details) {
    try {
      const payload = JSON.parse(details) as Record<string, string>;
      if (payload && typeof payload === 'object') {
        return { id, payload };
      }
    } catch {
      return { id, payload: {} };
    }
  }

  return { id, payload: {} };
}

export function educationToSkill(entry: EducationEntry): UserSkillInput {
  return encodeDashboardSkill(EDU_PREFIX, entry.id, 'qualification', {
    yearRange: entry.yearRange,
    degree: entry.degree,
    institution: entry.institution,
    description: entry.description,
  });
}

export function experienceToSkill(entry: ExperienceEntry): UserSkillInput {
  return encodeDashboardSkill(EXP_PREFIX, entry.id, 'experience', {
    yearRange: entry.yearRange,
    title: entry.title,
    company: entry.company,
    description: entry.description,
  });
}

export function awardToSkill(entry: AwardEntry): UserSkillInput {
  return encodeDashboardSkill(AWD_PREFIX, entry.id, 'qualification', {
    yearRange: entry.yearRange,
    title: entry.title,
    issuer: entry.issuer,
    description: entry.description,
  });
}

function isEncodedEducation(name: string): boolean {
  return name.startsWith(EDU_PREFIX);
}

function isEncodedExperience(name: string): boolean {
  return name.startsWith(EXP_PREFIX);
}

function isEncodedAward(name: string): boolean {
  return name.startsWith(AWD_PREFIX);
}

function isEncodedMeta(name: string): boolean {
  return name.startsWith(META_PREFIX);
}

export type WorkLocationMode = 'remote' | 'location' | 'hybrid';

export type ProfileLocationType = 'in-person' | 'remote' | 'hybrid';

const VALID_WORK_LOCATION_MODES: WorkLocationMode[] = ['remote', 'location', 'hybrid'];

export function workLocationModeFromLocationType(
  locationType: ProfileLocationType,
): WorkLocationMode {
  if (locationType === 'remote') return 'remote';
  if (locationType === 'hybrid') return 'hybrid';
  return 'location';
}

export function locationTypeFromWorkLocationMode(
  mode: WorkLocationMode | '',
): ProfileLocationType {
  if (mode === 'remote') return 'remote';
  if (mode === 'hybrid') return 'hybrid';
  return 'in-person';
}

export function profileMetaToSkill(
  specialization: string,
  profileType: string,
  workLocationMode?: string,
): UserSkillInput | null {
  const spec = specialization && specialization !== 'Select' ? specialization.trim() : '';
  const ptype = profileType && profileType !== 'Select' ? profileType.trim() : '';
  const mode =
    workLocationMode && VALID_WORK_LOCATION_MODES.includes(workLocationMode as WorkLocationMode)
      ? workLocationMode
      : '';
  if (!spec && !ptype && !mode) return null;
  return encodeDashboardSkill(META_PREFIX, META_PROFILE_ID, 'qualification', {
    specialization: spec,
    profileType: ptype,
    workLocationMode: mode,
  });
}

export function parseSkillsFromApi(skills: UserSkill[]): {
  skillRows: SkillRow[];
  transport: string[];
  languages: LanguageRow[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  awards: AwardEntry[];
  specialization: string;
  profileType: string;
  workLocationMode: WorkLocationMode | '';
} {
  const skillRows: SkillRow[] = [];
  const transport: string[] = [];
  const languages: LanguageRow[] = [];
  const education: EducationEntry[] = [];
  const experience: ExperienceEntry[] = [];
  const awards: AwardEntry[] = [];
  let specialization = 'Select';
  let profileType = 'Select';
  let workLocationMode: WorkLocationMode | '' = '';

  for (const skill of skills) {
    const category = normalizeSkillCategory(skill.category);
    const name = skill.name;

    if (isEncodedMeta(name)) {
      const decoded = decodeDashboardSkill(skill, META_PREFIX);
      if (decoded?.id === META_PROFILE_ID) {
        const spec = decoded.payload.specialization?.trim();
        const ptype = decoded.payload.profileType?.trim();
        const mode = decoded.payload.workLocationMode?.trim();
        if (spec) specialization = spec;
        if (ptype) profileType = ptype;
        if (mode && VALID_WORK_LOCATION_MODES.includes(mode as WorkLocationMode)) {
          workLocationMode = mode as WorkLocationMode;
        }
      }
      continue;
    }

    if (isEncodedEducation(name)) {
      const decoded = decodeDashboardSkill(skill, EDU_PREFIX);
      if (decoded) {
        education.push({
          id: decoded.id,
          yearRange: decoded.payload.yearRange || '',
          degree: decoded.payload.degree || '',
          institution: decoded.payload.institution || '',
          description: decoded.payload.description || '',
        });
      }
      continue;
    }

    if (isEncodedExperience(name)) {
      const decoded = decodeDashboardSkill(skill, EXP_PREFIX);
      if (decoded) {
        experience.push({
          id: decoded.id,
          yearRange: decoded.payload.yearRange || '',
          title: decoded.payload.title || '',
          company: decoded.payload.company || '',
          description: decoded.payload.description || '',
        });
      }
      continue;
    }

    if (isEncodedAward(name)) {
      const decoded = decodeDashboardSkill(skill, AWD_PREFIX);
      if (decoded) {
        awards.push({
          id: decoded.id,
          yearRange: decoded.payload.yearRange || '',
          title: decoded.payload.title || '',
          issuer: decoded.payload.issuer || '',
          description: decoded.payload.description || '',
        });
      }
      continue;
    }

    if (category === 'skill') {
      skillRows.push({
        skill: name,
        point: proficiencyToPoint(skill.proficiency_level),
      });
      continue;
    }

    if (category === 'transport') {
      const dashboardId = API_TO_DASHBOARD_TRANSPORT[name] || name;
      transport.push(dashboardId);
      continue;
    }

    if (category === 'language') {
      languages.push({
        language: name,
        level: proficiencyToLanguageLevel(skill.proficiency_level),
      });
    }
  }

  return {
    skillRows,
    transport,
    languages,
    education,
    experience,
    awards,
    specialization,
    profileType,
    workLocationMode,
  };
}

function preservePlainSkills(existing: UserSkill[], categories: SkillCategoryKey[]): UserSkillInput[] {
  return existing
    .filter((skill) => {
      const category = normalizeSkillCategory(skill.category);
      if (!categories.includes(category)) return false;
      if (
        category === 'qualification' &&
        (isEncodedEducation(skill.name) ||
          isEncodedAward(skill.name) ||
          isEncodedMeta(skill.name))
      ) {
        return false;
      }
      if (category === 'experience' && isEncodedExperience(skill.name)) {
        return false;
      }
      return true;
    })
    .map((skill) => ({
      name: skill.name,
      category: normalizeSkillCategory(skill.category),
      proficiency_level: skill.proficiency_level || 'intermediate',
      years_of_experience: skill.years_of_experience ?? 0,
    }));
}

export function buildDashboardDesiredSkills(
  existing: UserSkill[],
  input: {
    skillRows: SkillRow[];
    transport: string[];
    languages: LanguageRow[];
    education: EducationEntry[];
    experience: ExperienceEntry[];
    awards: AwardEntry[];
    specialization?: string;
    profileType?: string;
    workLocationMode?: WorkLocationMode | '';
  },
): UserSkillInput[] {
  const skillInputs = input.skillRows
    .filter((row) => row.skill && row.skill !== 'Select' && row.skill !== 'Other…')
    .map((row) => ({
      name: row.skill.trim(),
      category: 'skill' as const,
      proficiency_level: pointToProficiency(row.point),
    }));

  const transportInputs = input.transport.map((id) => ({
    name: DASHBOARD_TO_API_TRANSPORT[id] || id,
    category: 'transport' as const,
    proficiency_level: 'intermediate' as const,
  }));

  const languageInputs = input.languages
    .filter((row) => row.language && row.language !== 'Select')
    .map((row) => ({
      name: row.language.trim(),
      category: 'language' as const,
      proficiency_level: LEVEL_TO_PROFICIENCY[row.level] || ('intermediate' as const),
    }));

  const encoded = [
    ...input.education.map(educationToSkill),
    ...input.experience.map(experienceToSkill),
    ...input.awards.map(awardToSkill),
  ];

  const metaSkill = profileMetaToSkill(
    input.specialization || 'Select',
    input.profileType || 'Select',
    input.workLocationMode || '',
  );

  const preserved = [
    ...preservePlainSkills(existing, ['qualification']),
    ...preservePlainSkills(existing, ['experience']),
  ];

  return dedupeByName([
    ...skillInputs,
    ...transportInputs,
    ...languageInputs,
    ...encoded,
    ...(metaSkill ? [metaSkill] : []),
    ...preserved,
  ]).items;
}

export function hourlyRateLabelFromApi(rate?: number | string | null): string {
  if (rate === undefined || rate === null || rate === '') return 'Select';
  const numeric = typeof rate === 'string' ? Number.parseFloat(rate.replace(/,/g, '')) : rate;
  if (Number.isNaN(numeric)) return 'Select';
  const formatted = formatHourlyRate(numeric);
  const known = STANDARD_HOURLY_RATE_OPTIONS.some((option) => option.value === formatted);
  if (known) return formatted;
  return formatted;
}

export function hourlyRateValueFromLabel(label: string): number | undefined {
  if (!label || label === 'Select') return undefined;
  const preset = STANDARD_HOURLY_RATE_OPTIONS.find((option) => option.value === label);
  if (preset) return preset.amount;
  const match = label.match(/Rs\.?\s*([\d,]+(?:\.\d+)?)/i);
  if (!match) return undefined;
  const value = Number.parseFloat(match[1].replace(/,/g, ''));
  return Number.isNaN(value) ? undefined : value;
}

export function genderLabelFromApi(gender?: string | null): string {
  if (!gender) return 'Select';
  const map: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
    prefer_not_to_say: 'Other',
  };
  return map[gender.toLowerCase()] || 'Select';
}

export function genderValueFromLabel(label: string): string | undefined {
  const map: Record<string, string> = {
    Male: 'male',
    Female: 'female',
    Other: 'other',
  };
  return map[label];
}
