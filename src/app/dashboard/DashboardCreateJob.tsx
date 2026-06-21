'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AlignLeft,
  ArrowUpRight,
  Briefcase,
  ChevronLeft,
  ClipboardList,
  GraduationCap,
  ListChecks,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { normalizeJobFormData } from '@/lib/dashboardListingApi';
import { getFallbackCategoryNames } from '@/lib/taskUtils';
import FormAccordionSection from './FormAccordionSection';
import EmployerPostingBanner from '@/components/employers/EmployerPostingBanner';
import {
  resolveJobBudgetFromForm,
  type Job as PublicJob,
  type JobBudgetPricing,
} from '@/components/jobs/jobListData';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';
import type { Job as DashboardJob } from './types';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

export type CreateJobFormData = {
  title: string;
  category: string;
  companyName: string;
  companyLogoBg: string;
  companyIconType: PublicJob['companyIconType'] | '';
  verified: boolean;
  location: PublicJob['location'] | '';
  city: string;
  duration: string;
  type: PublicJob['type'] | '';
  experienceLevel: PublicJob['experienceLevel'] | '';
  budgetPricing: JobBudgetPricing | '';
  budgetFixed: string;
  budgetMin: string;
  budgetMax: string;
  hoursLabel: string;
  postedLabel: string;
  skills: string[];
  description: string;
  keyResponsibilities: string[];
  workExperience: string[];
  status: DashboardJob['status'] | '';
};

const EMPTY_CREATE_FORM: CreateJobFormData = {
  title: '',
  category: '',
  companyName: '',
  companyLogoBg: '',
  companyIconType: '',
  verified: false,
  location: '',
  city: '',
  duration: '',
  type: '',
  experienceLevel: '',
  budgetPricing: 'negotiable',
  budgetFixed: '',
  budgetMin: '',
  budgetMax: '',
  hoursLabel: '',
  postedLabel: '',
  skills: [],
  description: '',
  keyResponsibilities: [''],
  workExperience: [''],
  status: '',
};

const CATEGORIES = [
  'Design & Creative',
  'Development & IT',
  'Writing & Translation',
  'Digital Marketing',
  'Video & Animation',
  'Finance & Accounting',
  'Web Development',
  'Mobile Development',
  'Backend Development',
  'DevOps & Cloud',
  'Data & Analytics',
  'Cleaning',
  'House Cleaning',
  'End of Lease',
  'Carpet Cleaning',
  'Window Cleaning',
  'Delivery',
  'Furniture Removal',
  'Groceries',
  'Handyman',
  'Furniture Assembly',
  'Plumbing Repairs',
  'Electrician',
  'Gardening',
  'Lawn Mowing',
  'Landscaping',
  'Business',
  'Admin Support',
  'Graphic Design',
  'Marketing',
  'Data Entry',
  'Art & Illustration',
  'Music & Audio',
  'Programming & Tech',
  'Sales & Marketing',
  'Customer Support',
  'Human Resources',
  'Legal',
  'Engineering & Architecture',
  ...getFallbackCategoryNames(),
];

const LOCATIONS: PublicJob['location'][] = ['Remote', 'Hybrid', 'In-office'];
const JOB_TYPES: PublicJob['type'][] = ['Hourly', 'Fixed Price', 'Contract', 'Full Time'];
const EXPERIENCE_LEVELS: PublicJob['experienceLevel'][] = [
  'Intern',
  'Entry Level',
  'Intermediate',
  'Expert',
];
const BUDGET_PRICING_OPTIONS: { value: JobBudgetPricing; label: string }[] = [
  { value: 'negotiable', label: 'Negotiable (Optional)' },
  { value: 'fixed', label: 'Fixed amount' },
  { value: 'range', label: 'Min–Max range' },
];
const DURATIONS = [
  '1-5 Days',
  '6-10 Days',
  '10-15 Days',
  '20-30 Days',
  'Short term',
  'Long term',
];
const ICON_TYPES: PublicJob['companyIconType'][] = ['wave', 'face', 'in', 'clover'];
const LOGO_BACKGROUNDS = [
  'bg-[#192338]',
  'bg-[#3f3ebd]',
  'bg-[#ff1a53]',
  'bg-[#ab004b]',
  'bg-[#0f766e]',
  'bg-[#1d4ed8]',
];
const SKILLS = [
  'Figma',
  'React',
  'Node.js',
  'UI/UX Design',
  'TypeScript',
  'PostgreSQL',
  'Mobile Development',
  'SEO',
  'Next.js',
  'Python',
  'DevOps',
  'Project Management',
];
const fieldClass =
  'w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400';
const labelClass = 'mb-2 block text-sm font-normal text-neutral-800';
const selectClass = `${fieldClass} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`;
function SelectField({
  label,
  value,
  onChange,
  placeholder = 'Select',
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: string[];
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function MultiSelectField({
  label,
  value,
  onChange,
  placeholder = 'Nothing selected',
  options,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  };

  const remove = (option: string, event: MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter((item) => item !== option));
  };

  return (
    <div ref={containerRef} className="relative">
      <label className={labelClass}>{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((prev) => {
            if (!prev) updatePanelPosition();
            return !prev;
          });
        }}
        className={`${fieldClass} flex min-h-[46px] w-full flex-wrap items-center gap-1.5 text-left`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {value.length === 0 ? (
          <span className="text-neutral-400">{placeholder}</span>
        ) : (
          value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-800"
            >
              {item}
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => remove(item, event)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    remove(item, event as unknown as MouseEvent);
                  }
                }}
                className="text-neutral-500 hover:text-neutral-800"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </span>
            </span>
          ))
        )}
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              role="listbox"
              aria-multiselectable
              style={panelStyle}
              className="max-h-56 overflow-y-auto border border-neutral-200 bg-white shadow-lg"
            >
              {options.map((option) => {
                const checked = value.includes(option);
                return (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-normal text-neutral-800 hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option)}
                      className="h-4 w-4 rounded-none border-neutral-300 accent-[#1D3E35]"
                    />
                    {option}
                  </label>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const updateItem = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)));
  };

  const addItem = () => onChange([...items, '']);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className={labelClass}>{label}</label>
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <textarea
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
            rows={2}
            className={`${fieldClass} min-h-[72px] flex-1 resize-y`}
          />
          {items.length > 1 ? (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="mt-2 shrink-0 rounded-none p-2 text-neutral-400 transition-colors hover:text-red-600"
              aria-label={`Remove item ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 rounded-none border border-neutral-200 bg-white px-4 py-2 text-sm font-normal text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
      >
        <Plus className="h-4 w-4" />
        Add item
      </button>
    </div>
  );
}

interface DashboardCreateJobProps {
  onBack: () => void;
  onSubmit: (data: CreateJobFormData) => void;
  initialData?: Partial<CreateJobFormData>;
  mode?: 'create' | 'edit';
  postingContext?: EmployerPostingContext | null;
  categoryOptions?: string[];
  skillOptions?: string[];
}

function parseDescriptionParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function createPublicJobFromForm(data: CreateJobFormData, id?: string): PublicJob {
  const budget = resolveJobBudgetFromForm(data);
  const descriptionParagraphs = parseDescriptionParagraphs(data.description);
  const skills = data.skills.map((skill) => skill.trim()).filter(Boolean);
  const summary = descriptionParagraphs[0] ?? data.description.trim();

  return {
    id: id ?? `job-${Date.now()}`,
    title: data.title.trim(),
    category: data.category || 'Development & IT',
    companyName: data.companyName.trim() || 'Company',
    companyLogoBg: data.companyLogoBg || 'bg-[#3f3ebd]',
    companyIconType: data.companyIconType || 'wave',
    verified: data.verified,
    location: data.location || 'Remote',
    duration: data.duration || 'Short term',
    type: data.type || 'Hourly',
    experienceLevel: data.experienceLevel || 'Entry Level',
    budgetMin: budget.min,
    budgetMax: budget.max,
    budgetLabel: budget.label,
    description: summary,
    skills: skills.length ? skills : ['General'],
    city: data.city.trim() || undefined,
    hoursLabel: data.hoursLabel.trim() || undefined,
    postedLabel: data.postedLabel.trim() || undefined,
    descriptionParagraphs: descriptionParagraphs.length ? descriptionParagraphs : undefined,
    keyResponsibilities: data.keyResponsibilities.map((item) => item.trim()).filter(Boolean),
    workExperience: data.workExperience.map((item) => item.trim()).filter(Boolean),
  };
}

export function createDashboardJobFromForm(data: CreateJobFormData, id?: string): DashboardJob {
  const company = data.companyName.trim() || 'Company';
  return {
    id: id ?? `job-${Date.now()}`,
    title: data.title.trim(),
    company,
    logoColor: data.companyLogoBg || 'bg-[#3f3ebd]',
    logoInitial: company.slice(0, 2).toLowerCase(),
    applications: '0 New',
    createdDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    expiredDate: 'Expires in 30 days',
    status: data.status || 'Active',
  };
}

export default function DashboardCreateJob({
  onBack,
  onSubmit,
  initialData,
  mode = 'create',
  postingContext,
  categoryOptions = [],
  skillOptions = [],
}: DashboardCreateJobProps) {
  const isEdit = mode === 'edit';
  const isIndividualPoster = postingContext?.accountType === 'individual';
  const [form, setForm] = useState<CreateJobFormData>(() => ({
    ...EMPTY_CREATE_FORM,
    ...normalizeJobFormData(initialData ?? {}),
  }));
  const baseCategoryOptions = [
    ...new Set([
      ...(categoryOptions.length > 0 ? categoryOptions : CATEGORIES),
      ...CATEGORIES,
    ]),
  ].sort((a, b) => a.localeCompare(b));
  const categories =
    form.category && !baseCategoryOptions.includes(form.category)
      ? [form.category, ...baseCategoryOptions]
      : baseCategoryOptions;
  const skillChoices = skillOptions.length > 0 ? skillOptions : SKILLS;
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (!postingContext?.displayName) return;
    setForm((prev) => {
      if (prev.companyName.trim() === postingContext.displayName.trim()) return prev;
      return { ...prev, companyName: postingContext.displayName };
    });
  }, [postingContext?.displayName]);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const update = (patch: Partial<CreateJobFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      companyName: postingContext?.displayName?.trim() || form.companyName.trim(),
      postedLabel: '',
      status: 'Active',
    });
  };

  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto mb-8 flex max-w-5xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-normal text-neutral-500 transition-colors hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to jobs
          </button>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">
            {isEdit ? 'Edit Job' : 'Post New Job'}
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Matches the public job page layout — hero, about, responsibilities, and experience.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-none bg-[#222222] px-6 py-4 text-sm font-normal text-white shadow-md transition-colors hover:bg-neutral-800 md:self-auto"
        >
          {isEdit ? 'Save Changes' : 'Save & Publish'}
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8">
        {postingContext ? <EmployerPostingBanner context={postingContext} className="mb-6" /> : null}
        <FormAccordionSection
          title="Basic Information"
          icon={Briefcase}
          description="Title, company, category, and status"
          isOpen={openSection === 'basic'}
          onToggle={() => toggleSection('basic')}
        >
          <div>
            <label className={labelClass}>Job Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Next.js Development Expert for SSR Client Apps"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              label="Category"
              value={form.category}
              onChange={(category) => update({ category })}
              options={categories}
            />
            {!postingContext ? (
              <div>
                <label className={labelClass}>Company name</label>
                <input
                  value={form.companyName}
                  onChange={(e) => update({ companyName: e.target.value })}
                  placeholder="Company or your name"
                  className={fieldClass}
                />
              </div>
            ) : null}
            {!isIndividualPoster ? (
              <>
                <SelectField
                  label="Company Logo Style"
                  value={form.companyIconType}
                  onChange={(companyIconType) =>
                    update({ companyIconType: companyIconType as PublicJob['companyIconType'] })
                  }
                  options={ICON_TYPES}
                />
                <SelectField
                  label="Logo Background"
                  value={form.companyLogoBg}
                  onChange={(companyLogoBg) => update({ companyLogoBg })}
                  options={LOGO_BACKGROUNDS}
                />
              </>
            ) : null}
            <SelectField
              label="Experience Level"
              value={form.experienceLevel}
              onChange={(experienceLevel) =>
                update({ experienceLevel: experienceLevel as PublicJob['experienceLevel'] })
              }
              options={EXPERIENCE_LEVELS}
            />
          </div>

          {!isIndividualPoster ? (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-normal text-neutral-800">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => update({ verified: e.target.checked })}
                className="h-4 w-4 rounded-none border-neutral-300"
              />
              Verified company
            </label>
          ) : null}
        </FormAccordionSection>

        <FormAccordionSection
          title="Job Overview"
          icon={ClipboardList}
          description="Location, budget, type, and skills"
          isOpen={openSection === 'overview'}
          onToggle={() => toggleSection('overview')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              label="Location Type"
              value={form.location}
              onChange={(location) => update({ location: location as PublicJob['location'] })}
              options={LOCATIONS}
            />
            <div>
              <label className={labelClass}>City / Location Label</label>
              <input
                value={form.city}
                onChange={(e) => update({ city: e.target.value })}
                placeholder="New York"
                className={fieldClass}
              />
            </div>
            <SelectField
              label="Job Type"
              value={form.type}
              onChange={(type) => update({ type: type as PublicJob['type'] })}
              options={JOB_TYPES}
            />
            <SelectField
              label="Duration"
              value={form.duration}
              onChange={(duration) => update({ duration })}
              options={DURATIONS}
            />
            <div>
              <label className={labelClass}>Hours</label>
              <input
                value={form.hoursLabel}
                onChange={(e) => update({ hoursLabel: e.target.value })}
                placeholder="40h / week"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Budget (Optional)</label>
              <select
                value={form.budgetPricing || 'negotiable'}
                onChange={(e) =>
                  update({ budgetPricing: e.target.value as JobBudgetPricing })
                }
                className={selectClass}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                {BUDGET_PRICING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs font-normal text-neutral-500">
                Leave amounts empty to show{' '}
                <span className="font-medium text-neutral-700">Negotiable</span> on the job page.
              </p>
            </div>

            {form.budgetPricing === 'fixed' ? (
              <div>
                <label className={labelClass}>Fixed Amount (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  value={form.budgetFixed}
                  onChange={(e) => update({ budgetFixed: e.target.value })}
                  placeholder="Optional"
                  className={fieldClass}
                />
              </div>
            ) : form.budgetPricing === 'range' ? (
              <>
                <div>
                  <label className={labelClass}>Budget Min (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.budgetMin}
                    onChange={(e) => update({ budgetMin: e.target.value })}
                    placeholder="Optional"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Budget Max (Rs.)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.budgetMax}
                    onChange={(e) => update({ budgetMax: e.target.value })}
                    placeholder="Optional"
                    className={fieldClass}
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 rounded-none border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-normal text-neutral-600">
                Budget will display as <span className="font-medium text-neutral-900">Negotiable</span>{' '}
                unless you choose fixed amount or a min–max range.
              </div>
            )}

            <div className="sm:col-span-2">
              <MultiSelectField
                label="Skills"
                value={form.skills}
                onChange={(skills) => update({ skills })}
                placeholder="Nothing selected"
                options={skillChoices}
              />
            </div>
          </div>
        </FormAccordionSection>

        <FormAccordionSection
          title="Description"
          icon={AlignLeft}
          description="Full job description for the public page"
          isOpen={openSection === 'description'}
          onToggle={() => toggleSection('description')}
        >
          <div>
            <label className={labelClass}>Job Description</label>
            <p className="mb-2 text-xs font-normal text-neutral-500">
              Separate paragraphs with a blank line — shown in the About section on the job page.
            </p>
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Write the full job description..."
              rows={8}
              className={`${fieldClass} min-h-[180px] resize-y`}
            />
          </div>
        </FormAccordionSection>

        <FormAccordionSection
          title="Key Responsibilities"
          icon={ListChecks}
          description="Bullet points shown on the job page"
          isOpen={openSection === 'responsibilities'}
          onToggle={() => toggleSection('responsibilities')}
        >
          <ListEditor
            label="Responsibility items"
            items={form.keyResponsibilities}
            onChange={(keyResponsibilities) => update({ keyResponsibilities })}
            placeholder="Be involved in every step of the product design cycle..."
          />
        </FormAccordionSection>

        <FormAccordionSection
          title="Work & Experience"
          icon={GraduationCap}
          description="Experience requirements for applicants"
          isOpen={openSection === 'experience'}
          onToggle={() => toggleSection('experience')}
        >
          <ListEditor
            label="Experience requirements"
            items={form.workExperience}
            onChange={(workExperience) => update({ workExperience })}
            placeholder="You have at least 3 years' experience working as a Product Designer."
          />
        </FormAccordionSection>
        </div>
      </form>
    </div>
  );
}
