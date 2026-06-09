'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Truck,
  Bike,
  Car,
  Monitor,
  Scooter,
  PersonStanding,
  Route,
  Globe,
  GraduationCap,
  History,
  Check,
  CheckCircle2,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { userService } from '@/services';
import { toast } from 'sonner';
import type { UserSkill, UserSkillInput } from '@/types';
import {
  landingBody,
  landingBodyMuted,
  landingHeadline,
  landingHeadlineSm,
} from '@/components/LangingHome/landingTypography';

const SKILLS_TYPO = `${landingBody} [&_h1]:font-formula [&_h1]:font-black [&_h1]:tracking-tight [&_h2]:font-formula [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h3]:font-formula [&_h3]:font-bold [&_h3]:tracking-tight`;

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
  verifiedTags?: Set<string>;
}

function splitTagInput(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const TagInput = ({
  tags,
  setTags,
  placeholder = 'Type and hit enter...',
  verifiedTags,
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const addTags = (names: string[]) => {
    if (names.length === 0) return;
    setTags((prev) => {
      const existing = new Set(prev.map((t) => t.toLowerCase()));
      const next = [...prev];
      for (const name of names) {
        const trimmed = name.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (!existing.has(key)) {
          next.push(trimmed);
          existing.add(key);
        }
      }
      return next;
    });
  };

  const commitInput = (raw: string) => {
    const parts = splitTagInput(raw);
    if (parts.length > 0) {
      addTags(parts);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      commitInput(inputValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/[,;\n]/.test(value)) {
      commitInput(value);
      return;
    }
    setInputValue(value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!/[,;\n]/.test(pasted)) return;

    e.preventDefault();
    const combined = inputValue ? `${inputValue}${pasted}` : pasted;
    commitInput(combined);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const isVerified = (tag: string) =>
    verifiedTags?.has(tag.trim().toLowerCase()) ?? false;

  return (
    <div
      className={cn(
        landingBody,
        'flex min-h-[56px] cursor-text flex-wrap items-center gap-2 rounded-2xl border border-outline-variant bg-white p-3 transition-all',
        'focus-within:border-brand-emerald focus-within:ring-2 focus-within:ring-brand-emerald/15',
      )}
    >
      {tags.map((tag, index) => (
        <motion.span
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${tag}-${index}`}
          className={cn(
            'inline-flex min-h-[36px] items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium',
            isVerified(tag)
              ? 'border border-green-200 bg-green-50 text-green-800'
              : 'border border-outline-variant/80 bg-surface-low text-brand-dark',
          )}
        >
          {isVerified(tag) ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
          ) : null}
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : 'Add more…'}
        className={cn(
          landingBody,
          'min-w-[160px] flex-1 bg-transparent px-2 py-2 text-sm font-medium text-brand-dark outline-none placeholder:text-gray-400',
        )}
      />
    </div>
  );
};

type SectionId = 'skills' | 'transport' | 'languages' | 'qualifications' | 'experience';

const SECTION_NAV: {
  id: SectionId;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  { id: 'skills', label: 'Skills', icon: Briefcase, description: 'What you can do' },
  { id: 'transport', label: 'Transport', icon: Route, description: 'How you travel' },
  { id: 'languages', label: 'Languages', icon: Globe, description: 'How you communicate' },
  { id: 'qualifications', label: 'Qualifications', icon: GraduationCap, description: 'Certs & licenses' },
  { id: 'experience', label: 'Experience', icon: History, description: 'Work history' },
];

function SkillsLoadingSkeleton() {
  return (
    <div className={cn(SKILLS_TYPO, 'max-w-5xl animate-pulse space-y-8 pb-20')}>
      <div className="h-10 w-64 rounded-2xl bg-gray-100" />
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="hidden space-y-4 lg:col-span-4 lg:block">
          <div className="h-40 rounded-3xl bg-gray-100" />
          <div className="h-56 rounded-3xl bg-gray-100" />
        </div>
        <div className="space-y-6 lg:col-span-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-[32px] bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

const SKILL_CATEGORIES = [
  'skill',
  'transport',
  'language',
  'qualification',
  'experience',
] as const;

type SkillCategoryKey = (typeof SKILL_CATEGORIES)[number];

const CATEGORY_ALIASES: Record<string, SkillCategoryKey> = {
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
const CATEGORY_PRIORITY: Record<SkillCategoryKey, number> = {
  experience: 5,
  qualification: 4,
  language: 3,
  skill: 2,
  transport: 1,
};

function normalizeSkillCategory(category?: string): SkillCategoryKey {
  const raw = (category || 'skill').toLowerCase().trim();
  return CATEGORY_ALIASES[raw] ?? (SKILL_CATEGORIES.includes(raw as SkillCategoryKey) ? (raw as SkillCategoryKey) : 'skill');
}

function skillNameKey(name: string): string {
  return name.trim().toLowerCase();
}

function buildDesiredSkills(
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
function dedupeByName(items: UserSkillInput[]): {
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

async function syncUserSkills(
  existing: UserSkill[],
  desired: UserSkillInput[],
): Promise<void> {
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
      if (nextCategory !== currentCategory) {
        const response = await userService.updateSkill(current.id, {
          category: nextCategory,
        });
        if (!response.success) {
          throw new Error(`Failed to update ${desiredSkill.name}`);
        }
      }
      continue;
    }

    const response = await userService.addSkill({
      name: desiredSkill.name.trim(),
      category: normalizeSkillCategory(desiredSkill.category),
      proficiency_level: desiredSkill.proficiency_level || 'intermediate',
      years_of_experience: desiredSkill.years_of_experience ?? 0,
    });

    if (!response.success) {
      const duplicateName =
        response.errors?.name?.[0]?.includes('already have a skill') ?? false;
      if (duplicateName) {
        const refreshed = await userService.getSkills();
        const match = refreshed.data?.find(
          (s) => skillNameKey(s.name) === key,
        );
        if (match) {
          const update = await userService.updateSkill(match.id, {
            category: normalizeSkillCategory(desiredSkill.category),
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

export default function Skills() {
  const [transport, setTransport] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingSkills, setExistingSkills] = useState<UserSkill[]>([]);

  const verifiedByCategory = useMemo(() => {
    const map: Record<string, Set<string>> = {
      skill: new Set(),
      transport: new Set(),
      language: new Set(),
      qualification: new Set(),
      experience: new Set(),
    };

    for (const skill of existingSkills) {
      if (!skill.verified) continue;
      const category = normalizeSkillCategory(skill.category);
      map[category].add(skill.name.trim().toLowerCase());
    }

    return map;
  }, [existingSkills]);

  const [activeSection, setActiveSection] = useState<SectionId>('skills');

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    const sectionIds = SECTION_NAV.map((s) => `skills-section-${s.id}`);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          const id = visible[0].target.id.replace('skills-section-', '') as SectionId;
          setActiveSection(id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await userService.getSkills();

      if (response.success && Array.isArray(response.data)) {
        setExistingSkills(response.data);

        const skillsByCategory: Record<string, string[]> = {
          skill: [],
          transport: [],
          language: [],
          qualification: [],
          experience: [],
        };

        response.data.forEach((skill) => {
          const category = normalizeSkillCategory(skill.category);
          skillsByCategory[category].push(skill.name);
        });

        setSkills(skillsByCategory.skill);
        setTransport(skillsByCategory.transport);
        setLanguages(skillsByCategory.language);
        setQualifications(skillsByCategory.qualification);
        setExperience(skillsByCategory.experience);
      }
    } catch (error: unknown) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const rawDesired = buildDesiredSkills(
        skills,
        transport,
        languages,
        qualifications,
        experience,
      );
      const { items: desired, duplicates } = dedupeByName(rawDesired);

      if (duplicates.length > 0) {
        toast.warning(
          `Duplicate skill names were merged: ${duplicates.join(', ')}. Each skill name can only appear once on your profile.`,
        );
      }

      await syncUserSkills(existingSkills, desired);
      await fetchSkills();

      toast.success('Skills updated successfully');
    } catch (error: unknown) {
      console.error('Error saving skills:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to save skills';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleTransport = (id: string) => {
    setTransport((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const sectionCounts = useMemo(
    () => ({
      skills: skills.length,
      transport: transport.length,
      languages: languages.length,
      qualifications: qualifications.length,
      experience: experience.length,
    }),
    [skills, transport, languages, qualifications, experience],
  );

  const filledSections = useMemo(
    () => SECTION_NAV.filter((s) => sectionCounts[s.id] > 0).length,
    [sectionCounts],
  );

  const profileStrength = Math.round((filledSections / SECTION_NAV.length) * 100);

  const scrollToSection = useCallback((id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`skills-section-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const transportationOptions = [
    { id: 'Bicycle', icon: Bike, label: 'Bicycle' },
    { id: 'Car', icon: Car, label: 'Car' },
    { id: 'Online', icon: Monitor, label: 'Online' },
    { id: 'Scooter', icon: Scooter, label: 'Scooter' },
    { id: 'Truck', icon: Truck, label: 'Truck' },
    { id: 'Walk', icon: PersonStanding, label: 'Walk' },
  ];

  if (loading) {
    return <SkillsLoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(SKILLS_TYPO, 'max-w-5xl space-y-8 pb-20')}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className={cn(
              landingHeadlineSm,
              'mb-2 text-[10px] uppercase tracking-[0.3em] text-brand-emerald',
            )}
          >
            Professional profile
          </p>
          <h1 className={cn(landingHeadline, 'text-2xl text-brand-dark sm:text-4xl')}>
            Your skills
          </h1>
          <p className={cn(landingBodyMuted, 'mt-2 max-w-xl text-sm leading-relaxed')}>
            A complete profile helps you win more tasks. Add skills, transport, and experience —
            paste comma-separated lists or press Enter after each item.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            landingBody,
            'hidden shrink-0 items-center gap-2 rounded-2xl bg-brand-emerald px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-emerald/25 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex',
          )}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save profile
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-outline-variant bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p
                    className={cn(
                      landingHeadlineSm,
                      'text-xs uppercase tracking-[0.2em] text-gray-400',
                    )}
                  >
                    Profile strength
                  </p>
                  <p className={cn(landingHeadline, 'mt-1 text-2xl text-brand-dark')}>
                    {profileStrength}%
                  </p>
                </div>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-emerald/10 text-brand-emerald"
                  aria-hidden
                >
                  <Briefcase className="h-6 w-6" />
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-low">
                <div
                  className="h-full rounded-full bg-brand-emerald transition-all duration-500"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
              <p className={cn(landingBodyMuted, 'mt-3 text-xs')}>
                {filledSections} of {SECTION_NAV.length} sections filled
              </p>
            </div>

            <nav
              className="rounded-[28px] border border-outline-variant bg-white p-3 shadow-sm"
              aria-label="Skill sections"
            >
              <ul className="space-y-1">
                {SECTION_NAV.map((item) => {
                  const Icon = item.icon;
                  const count = sectionCounts[item.id];
                  const isActive = activeSection === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          'flex w-full min-h-[48px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                          isActive
                            ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/20'
                            : 'text-brand-dark hover:bg-surface-low',
                        )}
                      >
                        <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-brand-emerald')} />
                        <span className="min-w-0 flex-1">
                          <span className={cn(landingHeadlineSm, 'block text-sm')}>
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              landingBody,
                              'block text-xs font-medium',
                              isActive ? 'text-white/80' : 'text-gray-400',
                            )}
                          >
                            {item.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            landingHeadlineSm,
                            'rounded-full px-2 py-0.5 text-xs',
                            isActive ? 'bg-white/20 text-white' : 'bg-surface-low text-gray-500',
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <p className={cn(landingBody, 'text-xs font-medium leading-relaxed text-green-800')}>
                Items with a green check were verified by our team and build trust with customers.
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <section
            id="skills-section-skills"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>
                  What are you good at?
                </h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  List services and trades customers can hire you for.
                </p>
              </div>
            </div>
            <label htmlFor="skills-input" className="sr-only">
              Skills
            </label>
            <TagInput
              tags={skills}
              setTags={setSkills}
              verifiedTags={verifiedByCategory.skill}
              placeholder="Painting, Plumbing, Electrical work…"
            />
            <p className={cn(landingBodyMuted, 'mt-3 text-xs')}>
              Tip: paste a comma-separated list to add many skills at once.
            </p>
          </section>

          <section
            id="skills-section-transport"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>
                  How do you get around?
                </h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  Select every option that applies to you.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {transportationOptions.map((opt) => {
                const selected = transport.includes(opt.id);
                const verified = verifiedByCategory.transport?.has(opt.id.toLowerCase());

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleTransport(opt.id)}
                    aria-pressed={selected}
                    className={cn(
                      'relative flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-4 transition-all duration-200',
                      selected
                        ? verified
                          ? 'border-green-500 bg-green-50 text-green-800 shadow-md shadow-green-500/10'
                          : 'border-brand-emerald bg-emerald-50 text-brand-emerald shadow-md shadow-brand-emerald/10'
                        : 'border-outline-variant/60 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600',
                    )}
                  >
                    {verified && selected ? (
                      <CheckCircle2
                        className="absolute right-2 top-2 h-4 w-4 text-green-600"
                        aria-label="Verified"
                      />
                    ) : null}
                    <opt.icon className="h-6 w-6" />
                    <span
                      className={cn(
                        landingHeadlineSm,
                        'text-xs uppercase tracking-wider',
                      )}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            id="skills-section-languages"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>
                  Languages
                </h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  Languages you can speak or write with customers.
                </p>
              </div>
            </div>
            <TagInput
              tags={languages}
              setTags={setLanguages}
              verifiedTags={verifiedByCategory.language}
              placeholder="English, Nepali, Hindi…"
            />
          </section>

          <section
            id="skills-section-qualifications"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>
                  Qualifications
                </h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  Degrees, licenses, and certificates you hold.
                </p>
              </div>
            </div>
            <TagInput
              tags={qualifications}
              setTags={setQualifications}
              verifiedTags={verifiedByCategory.qualification}
              placeholder="Driver license, IT degree…"
            />
          </section>

          <section
            id="skills-section-experience"
            className="scroll-mt-28 rounded-[32px] border border-outline-variant bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-50 p-3 text-brand-emerald">
                <History className="h-6 w-6" />
              </div>
              <div>
                <h2 className={cn(landingHeadline, 'text-xl text-brand-dark')}>
                  Work experience
                </h2>
                <p className={cn(landingBodyMuted, 'mt-1 text-sm')}>
                  Past roles, employers, or years in a trade.
                </p>
              </div>
            </div>
            <TagInput
              tags={experience}
              setTags={setExperience}
              verifiedTags={verifiedByCategory.experience}
              placeholder="3 years plumbing, Hotel maintenance…"
            />
          </section>

          <div className="flex justify-end pt-2 lg:hidden">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                landingBody,
                'inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-emerald px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-emerald/30 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto',
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Save profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
