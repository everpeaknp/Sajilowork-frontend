'use client';

import { CURRENCY_INPUT_PREFIX, formatDashboardTypeCost, formatNPR } from '@/lib/nepalLocale';
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
  ArrowUpRight,
  Check,
  ChevronLeft,
  ImageIcon,
  MapPin,
  Package,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import LocationFields, { type LocationType } from '@/components/post-task/LocationFields';
import { parseServiceSkills } from '@/lib/dashboardListingApi';
import FormAccordionSection from './FormAccordionSection';
import type { FormUploadsPayload, Service } from './types';
import { DASHBOARD_PAGE_ROOT } from './dashboardResponsive';

type GalleryItem = { id: string; preview: string; file?: File };

function toGalleryItems(urls: string[]): GalleryItem[] {
  return urls.map((preview, index) => ({
    id: `saved-gallery-${index}-${preview}`,
    preview,
  }));
}

export type PackageTierColumn = {
  id: string;
  name: string;
  description: string;
};

export type PackageRowType = 'checkbox' | 'text';

export type PackageRow = {
  id: string;
  label: string;
  type: PackageRowType;
  values: Record<string, boolean | string>;
};

export type PackagesConfig = {
  tiers: PackageTierColumn[];
  rows: PackageRow[];
};

export type CreateServiceFormData = {
  title: string;
  price: string;
  category: string;
  languages: string[];
  responseTime: string;
  deliveryTime: string;
  skills: string[];
  locationType: LocationType;
  location: string;
  latitude?: number;
  longitude?: number;
  serviceDetail: string;
  packages: PackagesConfig;
};

function newId(prefix: string) {
  return `${prefix}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
}

function createDefaultPackagesConfig(): PackagesConfig {
  const basic = 'basic';
  const standard = 'standard';
  const premium = 'premium';

  return {
    tiers: [
      {
        id: basic,
        name: 'Basic',
        description:
          'I will redesign your current landing page or create one for you (upto 4 sections)',
      },
      { id: standard, name: 'Standard', description: '4 High Quality Desktop Pages.' },
      { id: premium, name: 'Premium', description: '4 High Quality Desktop and Mobile Pages.' },
    ],
    rows: [
      {
        id: 'source-file',
        label: 'Source file',
        type: 'checkbox',
        values: { [basic]: false, [standard]: true, [premium]: true },
      },
      {
        id: 'prototype',
        label: 'Prototype',
        type: 'checkbox',
        values: { [basic]: false, [standard]: true, [premium]: true },
      },
      {
        id: 'responsive-design',
        label: 'Responsive design',
        type: 'checkbox',
        values: { [basic]: false, [standard]: true, [premium]: true },
      },
      {
        id: 'number-of-pages',
        label: 'Number of pages',
        type: 'text',
        values: { [basic]: '2', [standard]: '4', [premium]: '6' },
      },
      {
        id: 'revisions',
        label: 'Revisions',
        type: 'text',
        values: { [basic]: '1', [standard]: '3', [premium]: '5' },
      },
      {
        id: 'package-delivery-time',
        label: 'Delivery Time',
        type: 'text',
        values: { [basic]: '2 Days', [standard]: '3 Days', [premium]: '4 Days' },
      },
      {
        id: 'total',
        label: 'Total',
        type: 'text',
        values: {
          [basic]: formatNPR(2900),
          [standard]: formatNPR(4900),
          [premium]: formatNPR(8900),
        },
      },
    ],
  };
}

const DEFAULT_PACKAGES_CONFIG = createDefaultPackagesConfig();

export function normalizePackagesConfig(config?: PackagesConfig | null): PackagesConfig {
  if (config?.tiers?.length && config?.rows?.length) {
    return structuredClone(config);
  }
  return structuredClone(DEFAULT_PACKAGES_CONFIG);
}

function addPackageTier(config: PackagesConfig): PackagesConfig {
  const id = newId('tier');
  const lastTier = config.tiers[config.tiers.length - 1];

  return {
    tiers: [...config.tiers, { id, name: 'New tier', description: '' }],
    rows: config.rows.map((row) => ({
      ...row,
      values: {
        ...row.values,
        [id]:
          row.type === 'checkbox'
            ? false
            : lastTier
              ? String(row.values[lastTier.id] ?? '')
              : '',
      },
    })),
  };
}

function removePackageTier(config: PackagesConfig, tierId: string): PackagesConfig {
  if (config.tiers.length <= 1) return config;

  return {
    tiers: config.tiers.filter((tier) => tier.id !== tierId),
    rows: config.rows.map((row) => {
      const nextValues = { ...row.values };
      delete nextValues[tierId];
      return { ...row, values: nextValues };
    }),
  };
}

function addPackageRow(config: PackagesConfig): PackagesConfig {
  const id = newId('row');
  const values: Record<string, boolean | string> = {};

  for (const tier of config.tiers) {
    values[tier.id] = false;
  }

  return {
    ...config,
    rows: [...config.rows, { id, label: 'New feature', type: 'checkbox', values }],
  };
}

function removePackageRow(config: PackagesConfig, rowId: string): PackagesConfig {
  if (config.rows.length <= 1) return config;
  return { ...config, rows: config.rows.filter((row) => row.id !== rowId) };
}

const EMPTY_CREATE_FORM: CreateServiceFormData = {
  title: '',
  price: '10',
  category: '',
  languages: [],
  responseTime: '',
  deliveryTime: '',
  skills: [],
  locationType: 'in-person',
  location: '',
  serviceDetail: '',
  packages: DEFAULT_PACKAGES_CONFIG,
};

const FALLBACK_CATEGORIES = [
  'Web & App Design',
  'Art & Illustration',
  'Design & Creative',
  'Development & IT',
  'Digital Marketing',
  'Video & Animation',
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Nepali', 'Hindi'];
const RESPONSE_TIMES = ['1 hour', '2 hours', '6 hours', '12 hours', '24 hours'];
const DELIVERY_TIMES = ['1 Day', '2 Days', '3 Days', '5 Days', '7 Days'];
const SKILLS = ['Figma', 'Adobe XD', 'UI/UX Design', 'HTML/CSS', 'React', 'Illustration', 'Logo Design'];
const DEFAULT_SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80';

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
          value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-800"
            >
              {skill}
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => remove(skill, event)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    remove(skill, event as unknown as MouseEvent);
                  }
                }}
                className="text-neutral-500 hover:text-neutral-800"
                aria-label={`Remove ${skill}`}
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

function PackageCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`mx-auto flex h-5 w-5 items-center justify-center rounded-none border transition-colors ${
        checked ? 'border-[#1D3E35] bg-[#1D3E35] text-white' : 'border-neutral-300 bg-white text-transparent'
      }`}
      aria-pressed={checked}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </button>
  );
}

const packageCellInputClass =
  'mx-auto w-full max-w-[140px] rounded-none border border-neutral-200 bg-white px-2 py-1.5 text-center text-sm font-normal text-neutral-800 outline-none transition-colors focus:border-neutral-400';

const packageHeaderInputClass =
  'w-full rounded-none border border-neutral-200 bg-white px-2 py-1.5 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400';

function PackagesEditor({
  config,
  onChange,
}: {
  config: PackagesConfig;
  onChange: (config: PackagesConfig) => void;
}) {
  const safeConfig = normalizePackagesConfig(config);

  const updateTier = (tierId: string, patch: Partial<PackageTierColumn>) => {
    onChange({
      ...safeConfig,
      tiers: safeConfig.tiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)),
    });
  };

  const updateRow = (rowId: string, patch: Partial<PackageRow>) => {
    onChange({
      ...safeConfig,
      rows: safeConfig.rows.map((row) => {
        if (row.id !== rowId) return row;
        const next = { ...row, ...patch };

        if (patch.type && patch.type !== row.type) {
          const values: Record<string, boolean | string> = {};
          for (const tier of safeConfig.tiers) {
            values[tier.id] = patch.type === 'checkbox' ? false : '';
          }
          next.values = values;
        }

        return next;
      }),
    });
  };

  const updateRowValue = (rowId: string, tierId: string, value: boolean | string) => {
    onChange({
      ...safeConfig,
      rows: safeConfig.rows.map((row) =>
        row.id === rowId ? { ...row, values: { ...row.values, [tierId]: value } } : row,
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm font-normal">
          <thead>
            <tr>
              <th className="w-[26%] pb-4 text-left font-normal text-neutral-800">Features</th>
              {safeConfig.tiers.map((tier) => (
                <th key={tier.id} className="min-w-[180px] pb-4 text-left align-top font-normal">
                  <div className="space-y-2 pr-2">
                    <div className="flex items-start gap-2">
                      <input
                        value={tier.name}
                        onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                        placeholder="Tier name"
                        className={packageHeaderInputClass}
                      />
                      {safeConfig.tiers.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => onChange(removePackageTier(safeConfig, tier.id))}
                          className="mt-1 shrink-0 rounded-none p-1 text-neutral-400 transition-colors hover:text-red-600"
                          aria-label={`Remove ${tier.name} tier`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <textarea
                      value={tier.description}
                      onChange={(e) => updateTier(tier.id, { description: e.target.value })}
                      placeholder="Tier description"
                      rows={3}
                      className={`${packageHeaderInputClass} min-h-[72px] resize-y text-xs font-light leading-relaxed text-neutral-600`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeConfig.rows.map((row) => (
              <tr key={row.id} className="border-t border-neutral-100">
                <td className="py-3 pr-3 align-middle">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={row.label}
                      onChange={(e) => updateRow(row.id, { label: e.target.value })}
                      placeholder="Feature label"
                      className={`${packageCellInputClass} max-w-none text-left`}
                    />
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.id, { type: e.target.value as PackageRowType })}
                      className="rounded-none border border-neutral-200 bg-white px-2 py-1.5 text-xs font-normal text-neutral-700 outline-none focus:border-neutral-400"
                    >
                      <option value="checkbox">Checkbox</option>
                      <option value="text">Text</option>
                    </select>
                    {safeConfig.rows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => onChange(removePackageRow(safeConfig, row.id))}
                        className="shrink-0 self-start rounded-none p-1 text-neutral-400 transition-colors hover:text-red-600 sm:self-center"
                        aria-label={`Remove ${row.label} row`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
                {safeConfig.tiers.map((tier) => (
                  <td key={tier.id} className="py-3 text-center align-middle">
                    {row.type === 'checkbox' ? (
                      <PackageCheckbox
                        checked={Boolean(row.values[tier.id])}
                        onChange={() => updateRowValue(row.id, tier.id, !row.values[tier.id])}
                      />
                    ) : (
                      <input
                        value={String(row.values[tier.id] ?? '')}
                        onChange={(e) => updateRowValue(row.id, tier.id, e.target.value)}
                        placeholder="Value"
                        className={packageCellInputClass}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onChange(addPackageTier(safeConfig))}
          className="inline-flex items-center gap-2 rounded-none border border-neutral-200 bg-white px-4 py-2 text-sm font-normal text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
        >
          <Plus className="h-4 w-4" />
          Add tier
        </button>
        <button
          type="button"
          onClick={() => onChange(addPackageRow(safeConfig))}
          className="inline-flex items-center gap-2 rounded-none border border-neutral-200 bg-white px-4 py-2 text-sm font-normal text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
        >
          <Plus className="h-4 w-4" />
          Add feature row
        </button>
      </div>
    </div>
  );
}

interface DashboardCreateServiceProps {
  onBack: () => void;
  onSubmit: (data: CreateServiceFormData, uploads: FormUploadsPayload) => void;
  initialData?: Partial<CreateServiceFormData>;
  initialGalleryUrls?: string[];
  categoryOptions?: string[];
  skillOptions?: string[];
  languageOptions?: string[];
  mode?: 'create' | 'edit';
}

export function createServiceFromForm(data: CreateServiceFormData, imageUrl?: string): Omit<Service, 'id'> {
  const costVal = Number(data.price) || 0;
  const detail = data.serviceDetail.trim();

  return {
    title: data.title.trim(),
    bullets: detail
      ? detail.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 3)
      : ['Professional service delivery', 'Fast response time', 'Quality guaranteed'],
    category: data.category || 'Web & App Design',
    typeCost: formatDashboardTypeCost('Fixed', costVal),
    costVal,
    status: 'Pending',
    image: imageUrl || DEFAULT_SERVICE_IMAGE,
  };
}

export default function DashboardCreateService({
  onBack,
  onSubmit,
  initialData,
  initialGalleryUrls = [],
  categoryOptions = [],
  skillOptions = [],
  languageOptions = [],
  mode = 'create',
}: DashboardCreateServiceProps) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState<CreateServiceFormData>(() => ({
    ...EMPTY_CREATE_FORM,
    ...initialData,
    skills: parseServiceSkills(initialData?.skills),
    languages: parseServiceSkills(initialData?.languages),
    packages: normalizePackagesConfig(initialData?.packages),
  }));
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => toGalleryItems(initialGalleryUrls));
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const baseCategoryOptions =
    categoryOptions.length > 0 ? categoryOptions : FALLBACK_CATEGORIES;
  const categories =
    form.category && !baseCategoryOptions.includes(form.category)
      ? [form.category, ...baseCategoryOptions]
      : baseCategoryOptions;
  const skillChoices = skillOptions.length > 0 ? skillOptions : SKILLS;
  const languageChoices = languageOptions.length > 0 ? languageOptions : LANGUAGES;

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const update = (patch: Partial<CreateServiceFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.title.trim()) return;

    onSubmit(form, {
      galleryFiles: galleryItems.filter((item) => item.file).map((item) => item.file as File),
      attachmentFiles: [],
      keptGalleryUrls: galleryItems.filter((item) => !item.file).map((item) => item.preview),
      keptAttachments: [],
    });
  };

  const onGallerySelected = (list: FileList | null) => {
    if (!list?.length) return;

    const nextItems = Array.from(list).map((file) => ({
      id: `new-gallery-${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      preview: URL.createObjectURL(file),
      file,
    }));

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
            Back to services
          </button>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900">
            {isEdit ? 'Edit Service' : 'Add Services'}
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
          icon={Sparkles}
          description="Title, pricing, category, and delivery"
          isOpen={openSection === 'basic'}
          onToggle={() => toggleSection('basic')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Service Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="i will"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>Price</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                  {CURRENCY_INPUT_PREFIX}
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => update({ price: e.target.value })}
                  placeholder="10"
                  className={`${fieldClass} pl-8`}
                />
              </div>
            </div>
            <SelectField
              label="Category"
              value={form.category}
              onChange={(category) => update({ category })}
              options={categories}
            />
            <MultiSelectField
              label="Languages"
              value={form.languages}
              onChange={(languages) => update({ languages })}
              placeholder="Select languages"
              options={languageChoices}
            />
            <SelectField
              label="Response Time"
              value={form.responseTime}
              onChange={(responseTime) => update({ responseTime })}
              options={RESPONSE_TIMES}
            />
            <SelectField
              label="Delivery Time"
              value={form.deliveryTime}
              onChange={(deliveryTime) => update({ deliveryTime })}
              options={DELIVERY_TIMES}
            />
          </div>

          <MultiSelectField
            label="Skills"
            value={form.skills}
            onChange={(skills) => update({ skills })}
            placeholder="Nothing selected"
            options={skillChoices}
          />
        </FormAccordionSection>

        <FormAccordionSection
          title="Location & Details"
          icon={MapPin}
          description="Service location and description"
          isOpen={openSection === 'location'}
          onToggle={() => toggleSection('location')}
        >
          <LocationFields
            variant="dashboard"
            showWorkModeHeading={false}
            data={{
              locationType: form.locationType,
              location: form.location,
              latitude: form.latitude,
              longitude: form.longitude,
            }}
            onChange={(location) => update(location)}
          />

          <div>
            <label className={labelClass}>Service Details</label>
            <textarea
              value={form.serviceDetail}
              onChange={(e) => update({ serviceDetail: e.target.value })}
              placeholder="Description"
              rows={6}
              className={`${fieldClass} min-h-[140px] resize-y`}
            />
          </div>
        </FormAccordionSection>

        <FormAccordionSection
          title="Packages"
          icon={Package}
          description="Pricing tiers and feature matrix"
          isOpen={openSection === 'packages'}
          onToggle={() => toggleSection('packages')}
        >
          <PackagesEditor
            config={form.packages}
            onChange={(packages) => update({ packages })}
          />
        </FormAccordionSection>

        <FormAccordionSection
          title="Gallery"
          icon={ImageIcon}
          description="Upload service images"
          isOpen={openSection === 'gallery'}
          onToggle={() => toggleSection('gallery')}
        >
          <input
            ref={galleryInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={(e) => {
              onGallerySelected(e.target.files);
              e.target.value = '';
            }}
          />
          <div className="flex flex-wrap gap-3">
            {galleryItems.map((item, index) => (
              <div key={item.id} className="relative h-24 w-24 shrink-0 overflow-hidden border border-neutral-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-cover" />
                {index === 0 ? (
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Main
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeGalleryItem(item.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black"
                  aria-label="Remove gallery image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed border-neutral-200 bg-[#fff5f2] text-xs font-normal text-neutral-600 transition-colors hover:bg-[#ffede8]"
            >
              <ImageIcon className="h-5 w-5 text-neutral-400" />
              Upload
            </button>
          </div>
          <p className="max-w-xl text-xs font-normal leading-relaxed text-neutral-500">
            Upload multiple images — the first image is used as the main cover. Max file size is 1MB each.
            Minimum dimension: 330x300. Suitable files are .jpg and .png.
          </p>
        </FormAccordionSection>
        </div>
      </form>
    </div>
  );
}
