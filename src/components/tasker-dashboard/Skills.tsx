'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Truck,
  Bike,
  Car,
  Smartphone,
  Navigation,
  Globe,
  GraduationCap,
  History,
  Check,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { userService } from '@/services';
import { toast } from 'sonner';
import type { UserSkill, UserSkillInput } from '@/types';

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder?: string;
  verifiedTags?: Set<string>;
}

const TagInput = ({
  tags,
  setTags,
  placeholder = 'Type and hit enter...',
  verifiedTags,
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        setTags([...tags, trimmed]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const isVerified = (tag: string) =>
    verifiedTags?.has(tag.trim().toLowerCase()) ?? false;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-surface-low rounded-2xl border-2 border-transparent focus-within:bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all min-h-[64px] items-center cursor-text">
      {tags.map((tag, index) => (
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={`${tag}-${index}`}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs border shadow-sm',
            isVerified(tag)
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-white text-blue-950 border-outline-variant',
          )}
        >
          {isVerified(tag) ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden />
          ) : null}
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label={`Remove ${tag}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : 'Add more...'}
        className="flex-1 min-w-[120px] bg-transparent py-2 px-2 font-bold text-blue-950 outline-none placeholder:text-gray-400"
      />
    </div>
  );
};

function skillKey(name: string, category: string): string {
  return `${category.toLowerCase()}::${name.trim().toLowerCase()}`;
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
    const key = item.name.trim().toLowerCase();
    if (seen.has(key)) {
      duplicates.push(item.name);
    } else {
      seen.set(key, item);
    }
  }

  return { items: Array.from(seen.values()), duplicates };
}

async function syncUserSkills(
  existing: UserSkill[],
  desired: UserSkillInput[],
): Promise<void> {
  const desiredKeys = new Set(
    desired.map((d) => skillKey(d.name, d.category || 'skill')),
  );
  const existingByKey = new Map(
    existing.map((s) => [skillKey(s.name, s.category || 'skill'), s]),
  );

  const toDelete = existing.filter(
    (s) => !desiredKeys.has(skillKey(s.name, s.category || 'skill')),
  );

  const toAdd = desired.filter(
    (d) => !existingByKey.has(skillKey(d.name, d.category || 'skill')),
  );

  for (const skill of toDelete) {
    const response = await userService.deleteSkill(skill.id);
    if (!response.success) {
      throw new Error(`Failed to remove ${skill.name}`);
    }
  }

  for (const skill of toAdd) {
    const response = await userService.addSkill({
      name: skill.name.trim(),
      category: skill.category || 'skill',
      proficiency_level: skill.proficiency_level || 'intermediate',
      years_of_experience: skill.years_of_experience ?? 0,
    });
    if (!response.success) {
      const msg =
        response.errors?.name?.[0] ||
        response.message ||
        `Failed to add ${skill.name}`;
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
      const category = (skill.category || 'skill').toLowerCase();
      if (!map[category]) {
        map[category] = new Set();
      }
      map[category].add(skill.name.trim().toLowerCase());
    }

    return map;
  }, [existingSkills]);

  useEffect(() => {
    fetchSkills();
  }, []);

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
          const category = (skill.category || 'skill').toLowerCase();
          const bucket = skillsByCategory[category] ?? skillsByCategory.skill;
          bucket.push(skill.name);
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

  const transportationOptions = [
    { id: 'Bicycle', icon: Bike },
    { id: 'Car', icon: Car },
    { id: 'Online', icon: Globe },
    { id: 'Scooter', icon: Navigation },
    { id: 'Truck', icon: Truck },
    { id: 'Walk', icon: Smartphone },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-10 pb-20"
    >
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-1 w-10 bg-primary rounded-full" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
            Professional Profile
          </span>
        </div>
        <h1 className="text-4xl font-black text-blue-950 uppercase tracking-tighter">
          Your Skills
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl font-medium">
          These are your skills. Keep them updated with any new skills you learn so
          other members can know what you can offer. Skills marked with a check were
          verified by our team.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-2xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-blue-950 tracking-tight">
              What are you good at?
            </h3>
          </div>
          <TagInput
            tags={skills}
            setTags={setSkills}
            verifiedTags={verifiedByCategory.skill}
            placeholder="Enter your skills (e.g. Painting, Plumbing)..."
          />
        </section>

        <section className="bg-white p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-2xl">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-blue-950 tracking-tight">
              How do you get around?
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {transportationOptions.map((opt) => {
              const selected = transport.includes(opt.id);
              const verified = verifiedByCategory.transport?.has(
                opt.id.toLowerCase(),
              );
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleTransport(opt.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300',
                    selected
                      ? verified
                        ? 'border-green-500 bg-green-50 text-green-800 shadow-lg shadow-green-500/10'
                        : 'border-primary bg-blue-50 text-primary shadow-lg shadow-primary/10'
                      : 'border-surface text-gray-400 hover:border-gray-200',
                  )}
                >
                  {verified && selected ? (
                    <CheckCircle2
                      className="absolute top-2 right-2 w-4 h-4 text-green-600"
                      aria-label="Verified"
                    />
                  ) : null}
                  <opt.icon className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {opt.id}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-2xl">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-blue-950 tracking-tight">
              What languages can you speak/write?
            </h3>
          </div>
          <TagInput
            tags={languages}
            setTags={setLanguages}
            verifiedTags={verifiedByCategory.language}
            placeholder="Enter languages (e.g. English, Nepali)..."
          />
        </section>

        <section className="bg-white p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-blue-950 tracking-tight">
              What qualifications do you have?
            </h3>
          </div>
          <TagInput
            tags={qualifications}
            setTags={setQualifications}
            verifiedTags={verifiedByCategory.qualification}
            placeholder="Enter qualifications (e.g. Master in IT, Driver License)..."
          />
        </section>

        <section className="bg-white p-8 rounded-[40px] border border-outline-variant shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-primary rounded-2xl">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-blue-950 tracking-tight">
              What&apos;s your work experience?
            </h3>
          </div>
          <TagInput
            tags={experience}
            setTags={setExperience}
            verifiedTags={verifiedByCategory.experience}
            placeholder="Enter work experience (e.g. 3 years at Google)..."
          />
        </section>
      </div>

      <div className="pt-10 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1161fe] text-white px-12 py-5 rounded-[20px] font-black text-lg shadow-xl shadow-primary/40 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
