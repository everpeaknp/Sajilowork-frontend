'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, ChevronLeft, FolderKanban, MapPin, Paperclip, Trash2 } from 'lucide-react';
import ScheduleFields, { type ScheduleTimeSlot } from '@/components/post-task/ScheduleFields';
import LocationFields, { type LocationType } from '@/components/post-task/LocationFields';
import FormAccordionSection from './FormAccordionSection';
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
  dateType: 'specific' | 'before' | 'flexible' | '';
  specificDate: string;
  beforeDate: string;
  timeOfDayRequired: boolean;
  timeSlot: ScheduleTimeSlot;
  locationType: LocationType;
  location: string;
  latitude?: number;
  longitude?: number;
  language: string;
  languageLevel: string;
  skills: string;
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
  language: '',
  languageLevel: '',
  skills: '',
  projectDetail: '',
};

const CATEGORIES = [
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
const LANGUAGE_LEVELS = ['Basic', 'Conversational', 'Fluent', 'Native'];
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

interface DashboardCreateProjectProps {
  onBack: () => void;
  onSubmit: (data: CreateProjectFormData, uploads: FormUploadsPayload) => void;
  initialData?: Partial<CreateProjectFormData>;
  initialAttachments?: UploadAttachment[];
  mode?: 'create' | 'edit';
}

export function createProjectFromForm(data: CreateProjectFormData): Omit<Project, 'id'> {
  const costNum = Number(data.cost) || 0;
  const typeCost =
    data.priceType === 'Hourly'
      ? `$${costNum} - $${costNum + 50}/Hour`
      : `$${costNum.toLocaleString()}/Fixed`;

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
}: DashboardCreateProjectProps) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<CreateProjectFormData>({ ...EMPTY_CREATE_FORM, ...initialData });
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

    const nextItems = Array.from(list).map((file) => ({
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
              options={CATEGORIES}
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
                  $
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SelectField
              label="Language"
              value={form.language}
              onChange={(language) => update({ language })}
              options={LANGUAGES}
            />
            <SelectField
              label="Languages Level"
              value={form.languageLevel}
              onChange={(languageLevel) => update({ languageLevel })}
              options={LANGUAGE_LEVELS}
            />
          </div>

          <SelectField
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
          <p className="text-xs font-normal text-neutral-400">Maximum file size: 10 MB per file</p>
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
