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
import { ArrowUpRight, ChevronLeft, FolderKanban, MapPin, Paperclip, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeProjectFormData } from '@/lib/dashboardListingApi';
import ScheduleFields, { type ScheduleTimeSlot } from '@/components/post-task/ScheduleFields';
import LocationFields, { type LocationType } from '@/components/post-task/LocationFields';
import FormAccordionSection from './FormAccordionSection';
import EmployerPostingBanner from '@/components/employers/EmployerPostingBanner';
import { CURRENCY_INPUT_PREFIX, formatDashboardTypeCost, formatNPR } from '@/lib/nepalLocale';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';
import type { Project as PublicProject } from '@/components/projects/projectListData';
import type { FormUploadsPayload, Project, UploadAttachment } from './types';

type AttachmentItem = { id: string; name: string; url: string; file?: File };

function toAttachmentItems(items: UploadAttachment[]): AttachmentItem[] {
  return items.map((item, index) => ({
    id: `saved-attachment-${index}-${item.url}`,
    name: item.name,
    url: item.url,
  }));
}

export type CreateProjectFormData = {
  title: string;
  category: string;
  freelancerType: string;
  priceType: string;
  cost: string;
  projectDuration: string;
  level: string;
  dateType: 'specific' | 'before' | 'both' | 'flexible' | '';
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: ScheduleTimeSlot;
  locationType: LocationType;
  location: string;
  latitude?: number;
  longitude?: number;
  languages: string[];
  skills: string[];
  projectDetail: string;
};

const EMPTY_CREATE_FORM: CreateProjectFormData = {
  title: '',
  category: '',
  freelancerType: '',
  priceType: '',
  cost: '',
  projectDuration: '',
  level: '',
  dateType: '',
  specificDate: '',
  beforeDate: '',
  timeOfDayRequired: false,
  timeSlot: null,
  locationType: 'in-person',
  location: '',
  languages: [],
  skills: [],
  projectDetail: '',
};

const FALLBACK_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Backend Development',
  'DevOps & Cloud',
  'Marketing',
  'Data & Analytics',
];

const FREELANCER_TYPES = ['Individual', 'Agency', 'Team'];
const PRICE_TYPES = ['Hourly', 'Fixed Price', 'Contract'];
const DURATIONS = ['1-5 Days', '6-10 Days', '10-15 Days', '20-30 Days', '1-3 Months'];
const LEVELS = ['Entry', 'Medium', 'Expert'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Nepali'];
const SKILLS = [
  'Figma',
  'React',
  'Node.js',
  'UI/UX Design',
  'TypeScript',
  'PostgreSQL',
  'Mobile Development',
  'SEO',
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

interface DashboardCreateProjectProps {
  onBack: () => void;
  onSubmit: (data: CreateProjectFormData, uploads: FormUploadsPayload) => void;
  initialData?: Partial<CreateProjectFormData>;
  initialAttachments?: UploadAttachment[];
  mode?: 'create' | 'edit';
  postingContext?: EmployerPostingContext | null;
  categoryOptions?: string[];
}

const LEVEL_TO_EXPERIENCE: Record<string, PublicProject['experienceLevel']> = {
  Entry: 'Entry Level',
  Medium: 'Intermediate',
  Expert: 'Expert',
};

const PRICE_TO_TYPE: Record<string, PublicProject['type']> = {
  Hourly: 'Hourly',
  'Fixed Price': 'Fixed Price',
  Contract: 'Contract',
};

function mapProjectLocation(
  locationType: CreateProjectFormData['locationType'],
  location: string,
): PublicProject['location'] {
  if (locationType === 'remote') return 'Remote';
  const normalized = location.trim().toLowerCase();
  if (normalized.includes('hybrid')) return 'Hybrid';
  if (location.trim()) return 'In-office';
  return 'Remote';
}

export function createPublicProjectFromForm(
  data: CreateProjectFormData,
  postingContext: EmployerPostingContext,
  id?: string,
): PublicProject {
  const costNum = Number(data.cost) || 0;
  const isHourly = data.priceType === 'Hourly';
  const budgetMin = costNum;
  const budgetMax = isHourly ? costNum + 50 : costNum;
  const budgetLabel = isHourly
    ? `${formatNPR(budgetMin)} - ${formatNPR(budgetMax)}`
    : formatNPR(budgetMin);

  return {
    id: id ?? `proj-${Date.now()}`,
    title: data.title.trim(),
    category: data.category || 'Web Development',
    companyName: postingContext.displayName,
    companyLogoBg: postingContext.accountType === 'company' ? 'bg-[#3f3ebd]' : 'bg-[#0f766e]',
    companyIconType: 'face',
    verified: postingContext.accountType === 'company',
    location: mapProjectLocation(data.locationType, data.location),
    duration: data.projectDuration || '1-5 Days',
    type: PRICE_TO_TYPE[data.priceType] ?? 'Hourly',
    experienceLevel: LEVEL_TO_EXPERIENCE[data.level] ?? 'Intermediate',
    budgetMin,
    budgetMax,
    budgetLabel,
    expenseLevel: 'Intermediate',
    skills: data.skills.length ? data.skills : ['General'],
    description: data.projectDetail.trim() || data.title.trim(),
  };
}

export function createProjectFromForm(data: CreateProjectFormData): Omit<Project, 'id'> {
  const costNum = Number(data.cost) || 0;
  const typeCost = formatDashboardTypeCost(
    data.priceType,
    costNum,
    data.priceType === 'Hourly' ? costNum + 50 : undefined,
  );

  return {
    title: data.title.trim(),
    location:
      data.locationType === 'remote'
        ? 'Remote'
        : data.location.trim() || 'Remote',
    postedTime: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    receivedCount: 0,
    category: data.category || 'Web Development',
    typeCost,
    costVal: costNum,
    status: 'Pending',
  };
}

export default function DashboardCreateProject({
  onBack,
  onSubmit,
  initialData,
  initialAttachments = [],
  mode = 'create',
  postingContext,
  categoryOptions = [],
}: DashboardCreateProjectProps) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<CreateProjectFormData>(() => ({
    ...EMPTY_CREATE_FORM,
    ...normalizeProjectFormData(initialData ?? {}),
  }));
  const baseCategoryOptions =
    categoryOptions.length > 0 ? categoryOptions : FALLBACK_CATEGORIES;
  const categories =
    form.category && !baseCategoryOptions.includes(form.category)
      ? [form.category, ...baseCategoryOptions]
      : baseCategoryOptions;
  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>(() =>
    toAttachmentItems(initialAttachments),
  );
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const update = (patch: Partial<CreateProjectFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.title.trim()) return;

    onSubmit(form, {
      galleryFiles: [],
      attachmentFiles: attachmentItems.filter((item) => item.file).map((item) => item.file as File),
      keptGalleryUrls: [],
      keptAttachments: attachmentItems
        .filter((item) => !item.file)
        .map((item) => ({ name: item.name, url: item.url })),
    });
  };

  const onAttachmentsSelected = (list: FileList | null) => {
    if (!list?.length) return;

    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    const allowedExtensions = /\.(jpe?g|png|webp|gif|pdf|docx?)$/i;

    const validFiles = Array.from(list).filter((file) => {
      const typeOk = file.type ? allowedTypes.has(file.type) : allowedExtensions.test(file.name);
      const extOk = allowedExtensions.test(file.name);
      return typeOk || extOk;
    });

    if (!validFiles.length) {
      toast.error('Only JPG, PNG, WEBP, GIF, PDF, DOC, and DOCX files are allowed.');
      return;
    }

    const nextItems = validFiles.map((file) => ({
      id: `new-attachment-${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setAttachmentItems((prev) => [...prev, ...nextItems]);
  };

  const removeAttachmentItem = (id: string) => {
    setAttachmentItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.file && target.url.startsWith('blob:')) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  return (
    <div className="animate-in fade-in -mx-4 -my-6 min-h-screen select-none bg-[#f0efec] p-4 font-sans text-black duration-300 sm:-mx-6 sm:p-6 md:-mx-8 md:p-8">
      <div className="mx-auto mb-8 flex max-w-5xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-normal text-neutral-500 transition-colors hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to projects
          </button>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">
            {isEdit ? 'Edit Project' : 'Create Project'}
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500">
            Lorem ipsum dolor sit amet, consectetur.
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
          icon={FolderKanban}
          description="Title, category, schedule, budget, and duration"
          isOpen={openSection === 'basic'}
          onToggle={() => toggleSection('basic')}
        >
          <div>
            <label className={labelClass}>Project Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="i will"
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
            <SelectField
              label="Freelancer Type"
              value={form.freelancerType}
              onChange={(freelancerType) => update({ freelancerType })}
              options={FREELANCER_TYPES}
            />
            <SelectField
              label="Price type"
              value={form.priceType}
              onChange={(priceType) => update({ priceType })}
              options={PRICE_TYPES}
            />
            <div>
              <label className={labelClass}>Cost</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                  {CURRENCY_INPUT_PREFIX}
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.cost}
                  onChange={(e) => update({ cost: e.target.value })}
                  placeholder="0"
                  className={`${fieldClass} pl-8`}
                />
              </div>
            </div>
            <SelectField
              label="Project Duration"
              value={form.projectDuration}
              onChange={(projectDuration) => update({ projectDuration })}
              options={DURATIONS}
            />
            <SelectField label="Level" value={form.level} onChange={(level) => update({ level })} options={LEVELS} />
          </div>

          <ScheduleFields
            variant="dashboard"
            data={{
              dateType: form.dateType,
              specificDate: form.specificDate,
              beforeDate: form.beforeDate,
              timeOfDayRequired: form.timeOfDayRequired,
              timeSlot: form.timeSlot,
            }}
            onChange={(schedule) => update(schedule)}
          />
        </FormAccordionSection>

        <FormAccordionSection
          title="Project Details"
          icon={MapPin}
          description="Location, language, skills, and description"
          isOpen={openSection === 'details'}
          onToggle={() => toggleSection('details')}
        >
          <LocationFields
            variant="dashboard"
            data={{
              locationType: form.locationType,
              location: form.location,
              latitude: form.latitude,
              longitude: form.longitude,
            }}
            onChange={(location) => update(location)}
          />

          <MultiSelectField
            label="Languages"
            value={form.languages}
            onChange={(languages) => update({ languages })}
            placeholder="Select languages"
            options={LANGUAGES}
          />

          <MultiSelectField
            label="Skills"
            value={form.skills}
            onChange={(skills) => update({ skills })}
            placeholder="Nothing selected"
            options={SKILLS}
          />

          <div>
            <label className={labelClass}>Project Detail</label>
            <textarea
              value={form.projectDetail}
              onChange={(e) => update({ projectDetail: e.target.value })}
              placeholder="Description"
              rows={6}
              className={`${fieldClass} min-h-[140px] resize-y`}
            />
          </div>
        </FormAccordionSection>

        <FormAccordionSection
          title="Upload Attachments"
          icon={Paperclip}
          description="Files for freelancers (max 10 MB each)"
          isOpen={openSection === 'attachments'}
          onToggle={() => toggleSection('attachments')}
        >
          <input
            ref={attachmentInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              onAttachmentsSelected(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => attachmentInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-none border border-dashed border-neutral-200 bg-[#fff5f2] px-6 py-10 text-sm font-normal text-neutral-700 transition-colors hover:bg-[#ffede8]"
          >
            Upload Files
          </button>
          <p className="text-xs font-normal text-neutral-400">
            JPG, PNG, WEBP, GIF, PDF, DOC, or DOCX — max 10 MB per file
          </p>
          {attachmentItems.length > 0 ? (
            <ul className="space-y-2">
              {attachmentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-none border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm font-normal text-neutral-700"
                >
                  <span className="truncate">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachmentItem(item.id)}
                    className="shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-800"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </FormAccordionSection>
        </div>
      </form>
    </div>
  );
}
