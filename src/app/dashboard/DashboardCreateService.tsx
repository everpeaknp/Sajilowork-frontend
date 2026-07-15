'use client';

import { formatDashboardTypeCost, formatNPR } from '@/lib/nepalLocale';
import {
  useRef,
  useState,
  type FormEvent,
} from 'react';
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
import { parseServiceSkills, getServiceListingPrice, parsePriceFromPackageText } from '@/lib/dashboardListingApi';
import FormAccordionSection from './FormAccordionSection';
import {
  dedupeSkills,
  listingFieldClass as fieldClass,
  listingLabelClass as labelClass,
  MultiSelectField,
  SearchableSelectField,
  SelectField,
} from './listingFormFields';
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

const DEFAULT_PACKAGE_TIER_TOTALS = [2900, 4900, 8900] as const;

function defaultTotalPriceForTierIndex(index: number): string {
  const amount =
    DEFAULT_PACKAGE_TIER_TOTALS[index] ??
    DEFAULT_PACKAGE_TIER_TOTALS[DEFAULT_PACKAGE_TIER_TOTALS.length - 1] +
      (index - DEFAULT_PACKAGE_TIER_TOTALS.length + 1) * 2000;
  return formatNPR(amount);
}

function isTotalPackageRow(row: PackageRow): boolean {
  return /total/i.test(row.label) || row.id === 'total';
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
          [basic]: defaultTotalPriceForTierIndex(0),
          [standard]: defaultTotalPriceForTierIndex(1),
          [premium]: defaultTotalPriceForTierIndex(2),
        },
      },
    ],
  };
}

const DEFAULT_PACKAGES_CONFIG = createDefaultPackagesConfig();

function ensurePackageTotalDefaults(config: PackagesConfig): PackagesConfig {
  if (!config.tiers.length) return structuredClone(DEFAULT_PACKAGES_CONFIG);

  const rows = [...config.rows];
  let totalRow = rows.find(isTotalPackageRow);

  if (!totalRow) {
    totalRow = { id: 'total', label: 'Total', type: 'text', values: {} };
    rows.push(totalRow);
  } else {
    const totalIndex = rows.findIndex(isTotalPackageRow);
    rows.splice(totalIndex, 1);
    rows.push({ ...totalRow });
    totalRow = rows[rows.length - 1];
  }

  const values = { ...totalRow.values };
  config.tiers.forEach((tier, index) => {
    const current = String(values[tier.id] ?? '').trim();
    if (!current || parsePriceFromPackageText(current) == null) {
      values[tier.id] = defaultTotalPriceForTierIndex(index);
    }
  });

  rows[rows.length - 1] = { ...totalRow, values };

  return { ...config, rows };
}

export function normalizePackagesConfig(config?: PackagesConfig | null): PackagesConfig {
  if (!config?.tiers?.length || !config?.rows?.length) {
    return structuredClone(DEFAULT_PACKAGES_CONFIG);
  }
  return ensurePackageTotalDefaults(structuredClone(config));
}

function addPackageTier(config: PackagesConfig): PackagesConfig {
  const id = newId('tier');
  const tierIndex = config.tiers.length;
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
            : isTotalPackageRow(row)
              ? defaultTotalPriceForTierIndex(tierIndex)
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

  const newRow: PackageRow = { id, label: 'New feature', type: 'checkbox', values };
  const totalIndex = config.rows.findIndex(isTotalPackageRow);

  if (totalIndex === -1) {
    return { ...config, rows: [...config.rows, newRow] };
  }

  const rows = [...config.rows];
  rows.splice(totalIndex, 0, newRow);
  return { ...config, rows };
}

function removePackageRow(config: PackagesConfig, rowId: string): PackagesConfig {
  if (config.rows.length <= 1) return config;
  return { ...config, rows: config.rows.filter((row) => row.id !== rowId) };
}

const EMPTY_CREATE_FORM: CreateServiceFormData = {
  title: '',
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
        checked ? 'border-[#1D3E35] bg-[#1D3E35] text-white' : 'border-neutral-300 bg-white text-transparent dark:border-neutral-700 dark:bg-neutral-900'
      }`}
      aria-pressed={checked}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </button>
  );
}

const packageCellInputClass =
  'mx-auto w-full max-w-[140px] rounded-none border border-neutral-200 bg-white px-2 py-1.5 text-center text-sm font-normal text-neutral-800 outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100';

const packageHeaderInputClass =
  'w-full rounded-none border border-neutral-200 bg-white px-2 py-1.5 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100';

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
              <th className="w-[26%] pb-4 text-left font-normal text-neutral-800 dark:text-stone-100">Features</th>
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
                      className={`${packageHeaderInputClass} min-h-[72px] resize-y text-xs font-light leading-relaxed text-neutral-600 dark:text-neutral-400`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeConfig.rows.map((row) => (
              <tr key={row.id} className="border-t border-neutral-100 dark:border-neutral-800">
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
                      className="rounded-none border border-neutral-200 bg-white px-2 py-1.5 text-xs font-normal text-neutral-700 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-stone-100"
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
                {safeConfig.tiers.map((tier, tierIndex) => (
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
                        placeholder={
                          isTotalPackageRow(row) ? defaultTotalPriceForTierIndex(tierIndex) : 'Value'
                        }
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
          className="inline-flex items-center gap-2 rounded-none border border-neutral-200 bg-white px-4 py-2 text-sm font-normal text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Add tier
        </button>
        <button
          type="button"
          onClick={() => onChange(addPackageRow(safeConfig))}
          className="inline-flex items-center gap-2 rounded-none border border-neutral-200 bg-white px-4 py-2 text-sm font-normal text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
  onPersistCustomSkill?: (skillName: string) => Promise<string | null>;
  onPersistCustomCategory?: (categoryName: string) => Promise<string | null>;
}

export function createServiceFromForm(data: CreateServiceFormData, imageUrl?: string): Omit<Service, 'id'> {
  const costVal = getServiceListingPrice(data.packages);
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
  onPersistCustomSkill,
  onPersistCustomCategory,
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
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-normal text-neutral-500 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-stone-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to services
          </button>
          <h1 className="text-[34px] font-normal leading-none tracking-tight text-neutral-900 dark:text-stone-100">
            {isEdit ? 'Edit Service' : 'Add Services'}
          </h1>
          <p className="mt-2 text-[15px] font-normal tracking-tight text-neutral-500 dark:text-neutral-400">
            Lorem ipsum dolor sit amet, consectetur.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          className="inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-none bg-neutral-900 px-6 py-4 text-sm font-normal text-white shadow-md transition-colors hover:bg-neutral-800 dark:bg-stone-100 dark:text-neutral-900 dark:hover:bg-white md:self-auto"
        >
          {isEdit ? 'Save Changes' : 'Save & Publish'}
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] md:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <FormAccordionSection
          title="Basic Information"
          icon={Sparkles}
          description="Title, category, and delivery"
          isOpen={openSection === 'basic'}
          onToggle={() => toggleSection('basic')}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
              <p className="mt-1.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                Search the list or add a custom category only when it is not already available.
              </p>
            </div>
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
          <p className="mt-1.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">
            Search the list or add a custom skill only when it is not already available.
          </p>
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
          description="Set tier prices in the Total row — Basic tier is the listing starting price"
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
              <div key={item.id} className="relative h-24 w-24 shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
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
              className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed border-neutral-200 bg-[#fff5f2] text-xs font-normal text-neutral-600 transition-colors hover:bg-[#ffede8] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <ImageIcon className="h-5 w-5 text-neutral-400" />
              Upload
            </button>
          </div>
          <p className="max-w-xl text-xs font-normal leading-relaxed text-neutral-500 dark:text-neutral-400">
            Upload multiple images — the first image is used as the main cover. Max file size is 1MB each.
            Minimum dimension: 330x300. Suitable files are .jpg and .png.
          </p>
        </FormAccordionSection>
        </div>
      </form>
    </div>
  );
}
