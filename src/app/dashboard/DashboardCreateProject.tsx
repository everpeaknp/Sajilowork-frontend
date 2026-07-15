'use client';

import {
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { ArrowUpRight, ChevronLeft, FileText, FolderKanban, ImageIcon, MapPin, X } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeProjectFormData } from '@/lib/dashboardListingApi';
import ScheduleFields, { type ScheduleTimeSlot } from '@/components/post-task/ScheduleFields';
import LocationFields, { type LocationType } from '@/components/post-task/LocationFields';
import FormAccordionSection from './FormAccordionSection';
import EmployerPostingBanner from '@/components/employers/EmployerPostingBanner';
import {
  dedupeSkills,
  listingFieldClass as fieldClass,
  listingLabelClass as labelClass,
  MultiSelectField,
  SearchableSelectField,
  SelectField,
} from './listingFormFields';
import { CURRENCY_INPUT_PREFIX, formatDashboardTypeCost, formatNPR } from '@/lib/nepalLocale';
import type { EmployerPostingContext } from '@/lib/employerBusinessProfile';
import type { Project as PublicProject } from '@/components/projects/projectListData';
import type { FormUploadsPayload, Project, UploadAttachment } from './types';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

type GalleryItem = {
  id: string;
  preview: string;
  name: string;
  savedUrl?: string;
  file?: File;
  kind: 'image' | 'document';
};

function isImageAttachment(item: { name: string; url: string }): boolean {
  const combined = `${item.name} ${item.url}`.toLowerCase();
  return (
    /\.(jpe?g|png|webp|gif)(\?|$)/i.test(combined) ||
    (item.url.includes('res.cloudinary.com') && item.url.includes('/image/'))
  );
}

function isImageUploadFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name);
}

function toGalleryItems(items: UploadAttachment[]): GalleryItem[] {
  return items.map((item, index) => {
    const image = isImageAttachment(item);
    return {
      id: `saved-gallery-${index}-${item.url}`,
      preview: image ? item.url : '',
      name: item.name,
      savedUrl: item.url,
      kind: image ? 'image' : 'document',
    };
  });
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

interface DashboardCreateProjectProps {
  onBack: () => void;
  onSubmit: (data: CreateProjectFormData, uploads: FormUploadsPayload) => void;
  initialData?: Partial<CreateProjectFormData>;
  initialAttachments?: UploadAttachment[];
  mode?: 'create' | 'edit';
  postingContext?: EmployerPostingContext | null;
  categoryOptions?: string[];
  skillOptions?: string[];
  languageOptions?: string[];
  onPersistCustomSkill?: (skillName: string) => Promise<string | null>;
  onPersistCustomCategory?: (categoryName: string) => Promise<string | null>;
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
  skillOptions = [],
  languageOptions = [],
  onPersistCustomSkill,
  onPersistCustomCategory,
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
  const skillChoices = skillOptions.length > 0 ? skillOptions : SKILLS;
  const languageChoices = languageOptions.length > 0 ? languageOptions : LANGUAGES;
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => toGalleryItems(initialAttachments));
  const galleryInputRef = useRef<HTMLInputElement>(null);
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
      galleryFiles: galleryItems.filter((item) => item.file && item.kind === 'image').map((item) => item.file as File),
      attachmentFiles: galleryItems.filter((item) => item.file && item.kind === 'document').map((item) => item.file as File),
      keptGalleryUrls: galleryItems
        .filter((item) => !item.file && item.kind === 'image')
        .map((item) => item.preview),
      keptAttachments: galleryItems
        .filter((item) => !item.file && item.kind === 'document')
        .map((item) => ({ name: item.name, url: item.savedUrl ?? item.preview })),
    });
  };

  const onGallerySelected = (list: FileList | null) => {
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

    const nextItems: GalleryItem[] = validFiles.map((file) => {
      const image = isImageUploadFile(file);
      return {
        id: `new-gallery-${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        preview: image ? URL.createObjectURL(file) : '',
        name: file.name,
        file,
        kind: image ? 'image' : 'document',
      };
    });

    setGalleryItems((prev) => [...prev, ...nextItems]);
  };

  const removeGalleryItem = (id: string) => {
    setGalleryItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.file && target.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const firstImageIndex = galleryItems.findIndex((item) => item.kind === 'image');

  return (
    <div className={DASHBOARD_PAGE_ROOT}>
      <div className="mx-auto mb-8 flex max-w-5xl flex-col gap-5 pl-1 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-normal text-neutral-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-stone-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to projects
          </button>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900 dark:text-stone-100">
            {isEdit ? 'Edit Project' : 'Create Project'}
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500 dark:text-neutral-400">
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
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
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
            <div>
              <SearchableSelectField
                label="Category"
                value={form.category}
                onChange={(category) => update({ category })}
                placeholder="Select a category"
                options={categories}
                searchPlaceholder="Search categories..."
                emptySearchLabel="No categories match your search."
                emptyListLabel="No categories available."
                customSectionTitle="Category not listed? Add it manually (only if it is not in the list above)."
                customPlaceholder="Type a custom category"
                allowCustom
                onPersistCustom={onPersistCustomCategory}
              />
              <p className="mt-1.5 text-xs font-normal text-neutral-500">
                Search the list or add a custom category only when it is not already available.
              </p>
            </div>
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
            options={languageChoices}
          />

          <MultiSelectField
            label="Skills"
            value={form.skills}
            onChange={(skills) => update({ skills: dedupeSkills(skills) })}
            placeholder="Nothing selected"
            options={skillChoices}
            searchable
            allowCustom
            searchPlaceholder="Search skills..."
            emptySearchLabel="No skills match your search."
            emptyListLabel="No skills available."
            customSectionTitle="Skill not listed? Add it manually (only if it is not in the list above)."
            customPlaceholder="Type a custom skill"
            onPersistCustom={onPersistCustomSkill}
          />
          <p className="mt-1.5 text-xs font-normal text-neutral-500">
            Search the list or add a custom skill only when it is not already available.
          </p>

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
          title="Attachment"
          icon={ImageIcon}
          description="Upload project attachments"
          isOpen={openSection === 'attachments'}
          onToggle={() => toggleSection('attachments')}
        >
          <input
            ref={galleryInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              onGallerySelected(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex flex-wrap gap-3">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className="relative h-24 w-24 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
              >
                {item.kind === 'image' && item.preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt="" className="h-full w-full object-cover" />
                    {index === firstImageIndex ? (
                      <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Main
                      </span>
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1 text-center">
                    <FileText className="h-5 w-5 shrink-0 text-neutral-400" />
                    <span className="line-clamp-2 text-[9px] font-normal leading-tight text-neutral-600 dark:text-neutral-400">
                      {item.name}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeGalleryItem(item.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed border-neutral-200 bg-[#fff5f2] text-xs font-normal text-neutral-600 transition-colors hover:bg-[#ffede8] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <ImageIcon className="h-5 w-5 text-neutral-400" />
              Upload
            </button>
          </div>
          <p className="max-w-xl text-xs font-normal leading-relaxed text-neutral-500 dark:text-neutral-400">
            Upload multiple images and files — the first image is used as the main cover. JPG, PNG, WEBP,
            GIF, PDF, DOC, or DOCX — max 10 MB per file.
          </p>
        </FormAccordionSection>
        </div>
      </form>
    </div>
  );
}
