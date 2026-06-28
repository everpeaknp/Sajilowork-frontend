'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronLeft, Plus, Search, X } from 'lucide-react';

export const listingFieldClass =
  'w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm font-normal text-black outline-none transition-colors focus:border-neutral-400';
export const listingLabelClass = 'mb-2 block text-sm font-normal text-neutral-800';
export const listingSelectClass = `${listingFieldClass} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`;

export function normalizeListingLabel(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function listingKeysEqual(a: string, b: string): boolean {
  return normalizeListingLabel(a).toLowerCase() === normalizeListingLabel(b).toLowerCase();
}

function findMatchingOption(input: string, options: string[]): string | undefined {
  const normalized = normalizeListingLabel(input).toLowerCase();
  if (!normalized) return undefined;
  return options.find((opt) => opt.toLowerCase() === normalized);
}

function findMatchingSelected(input: string, selected: string[]): string | undefined {
  const normalized = normalizeListingLabel(input).toLowerCase();
  if (!normalized) return undefined;
  return selected.find((item) => item.toLowerCase() === normalized);
}

export function dedupeSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const skill of skills) {
    const trimmed = normalizeListingLabel(skill);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function SelectField({
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
      <label className={listingLabelClass}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={listingSelectClass}
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

export function SearchableSelectField({
  label,
  value,
  onChange,
  placeholder = 'Select',
  options,
  searchPlaceholder = 'Search...',
  emptySearchLabel = 'No matches found.',
  emptyListLabel = 'No options available.',
  customSectionTitle = 'Not listed? Add it manually (only if it is not in the list above).',
  customPlaceholder = 'Type a custom value',
  allowCustom = false,
  disabled = false,
  onPersistCustom,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: string[];
  searchPlaceholder?: string;
  emptySearchLabel?: string;
  emptyListLabel?: string;
  customSectionTitle?: string;
  customPlaceholder?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  onPersistCustom?: (name: string) => Promise<string | null>;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);
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

  useEffect(() => {
    if (open) return;
    setSearchQuery('');
    setCustomValue('');
    setCustomError('');
  }, [open]);

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const selectOption = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  const handleAddCustom = async () => {
    const trimmed = normalizeListingLabel(customValue);
    if (!trimmed) {
      setCustomError('Enter a name.');
      return;
    }

    const optionMatch = findMatchingOption(trimmed, options);
    if (optionMatch) {
      setCustomError(`"${optionMatch}" is in the list — select it above instead.`);
      return;
    }

    if (value && listingKeysEqual(value, trimmed)) {
      setCustomError('This is already selected.');
      return;
    }

    setSavingCustom(true);
    try {
      let valueToSet = trimmed;
      if (onPersistCustom) {
        const savedName = await onPersistCustom(trimmed);
        if (!savedName) {
          setCustomError('Could not save. Please try again.');
          return;
        }
        valueToSet = savedName;
      }

      onChange(valueToSet);
      setCustomValue('');
      setCustomError('');
      setOpen(false);
    } finally {
      setSavingCustom(false);
    }
  };

  const handleCustomKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleAddCustom();
    }
  };

  const displayValue = value || placeholder;

  return (
    <div ref={containerRef} className="relative">
      <label className={listingLabelClass}>{label}</label>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => {
            if (!prev) updatePanelPosition();
            return !prev;
          });
        }}
        className={`${listingFieldClass} flex min-h-[46px] w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={value ? 'text-black' : 'text-neutral-400'}>{displayValue}</span>
        <ChevronLeft className="h-4 w-4 shrink-0 rotate-[-90deg] text-neutral-400" aria-hidden />
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              role="listbox"
              style={panelStyle}
              className="flex max-h-72 flex-col overflow-hidden border border-neutral-200 bg-white shadow-lg"
            >
              <div className="border-b border-neutral-100 p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full border border-neutral-200 py-2 pl-9 pr-3 text-sm font-normal text-neutral-800 outline-none focus:border-[#1D3E35] focus:ring-1 focus:ring-[#1D3E35]/20"
                    onClick={(event) => event.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-44 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <p className="px-4 py-3 text-sm font-normal text-neutral-500">
                    {searchQuery.trim() ? emptySearchLabel : emptyListLabel}
                  </p>
                ) : (
                  filteredOptions.map((option) => {
                    const selected = Boolean(value && listingKeysEqual(value, option));
                    return (
                      <button
                        key={option}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectOption(option)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-normal hover:bg-neutral-50 ${
                          selected ? 'bg-neutral-50 text-[#1D3E35]' : 'text-neutral-800'
                        }`}
                      >
                        {selected ? <Check className="h-4 w-4 shrink-0" /> : <span className="w-4" />}
                        {option}
                      </button>
                    );
                  })
                )}
              </div>
              {allowCustom ? (
                <div className="border-t border-neutral-100 bg-neutral-50 p-3">
                  <p className="mb-2 text-xs font-normal text-neutral-500">{customSectionTitle}</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(event) => {
                        setCustomValue(event.target.value);
                        if (customError) setCustomError('');
                      }}
                      onKeyDown={handleCustomKeyDown}
                      placeholder={customPlaceholder}
                      className="min-w-0 flex-1 border border-neutral-200 bg-white px-3 py-2 text-sm font-normal text-neutral-800 outline-none focus:border-[#1D3E35] focus:ring-1 focus:ring-[#1D3E35]/20"
                      onClick={(event) => event.stopPropagation()}
                    />
                    <button
                      type="button"
                      disabled={savingCustom}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleAddCustom();
                      }}
                      className="inline-flex shrink-0 items-center gap-1 bg-[#193e32] px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {savingCustom ? 'Saving…' : 'Add'}
                    </button>
                  </div>
                  {customError ? (
                    <p className="mt-2 text-xs font-normal text-red-600" role="alert">
                      {customError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function MultiSelectField({
  label,
  value,
  onChange,
  placeholder = 'Nothing selected',
  options,
  searchable = false,
  allowCustom = false,
  searchPlaceholder = 'Search...',
  emptySearchLabel = 'No matches found.',
  emptyListLabel = 'No options available.',
  customSectionTitle = 'Not listed? Add it manually (only if it is not in the list above).',
  customPlaceholder = 'Type a custom value',
  onPersistCustom,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  options: string[];
  searchable?: boolean;
  allowCustom?: boolean;
  searchPlaceholder?: string;
  emptySearchLabel?: string;
  emptyListLabel?: string;
  customSectionTitle?: string;
  customPlaceholder?: string;
  onPersistCustom?: (name: string) => Promise<string | null>;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);
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

  useEffect(() => {
    if (open) return;
    setSearchQuery('');
    setCustomValue('');
    setCustomError('');
  }, [open]);

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, searchQuery]);

  const addItem = (raw: string) => {
    const trimmed = normalizeListingLabel(raw);
    if (!trimmed) return false;

    if (findMatchingSelected(trimmed, value)) {
      return false;
    }

    const optionMatch = findMatchingOption(trimmed, options);
    if (optionMatch) {
      onChange([...value, optionMatch]);
      return true;
    }

    if (!allowCustom) return false;

    onChange([...value, trimmed]);
    return true;
  };

  const toggle = (option: string) => {
    const selected = findMatchingSelected(option, value);
    if (selected) {
      onChange(value.filter((item) => !listingKeysEqual(item, option)));
      return;
    }
    addItem(option);
  };

  const handleAddCustom = async () => {
    const trimmed = normalizeListingLabel(customValue);
    if (!trimmed) {
      setCustomError('Enter a name.');
      return;
    }

    if (findMatchingSelected(trimmed, value)) {
      setCustomError('This is already selected.');
      return;
    }

    const optionMatch = findMatchingOption(trimmed, options);
    if (optionMatch) {
      setCustomError(`"${optionMatch}" is in the list — select it above instead.`);
      return;
    }

    setSavingCustom(true);
    try {
      let valueToAdd = trimmed;
      if (onPersistCustom) {
        const savedName = await onPersistCustom(trimmed);
        if (!savedName) {
          setCustomError('Could not save. Please try again.');
          return;
        }
        valueToAdd = savedName;
      }

      onChange(dedupeSkills([...value, valueToAdd]));
      setCustomValue('');
      setCustomError('');
    } finally {
      setSavingCustom(false);
    }
  };

  const handleCustomKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleAddCustom();
    }
  };

  const remove = (option: string, event: MouseEvent) => {
    event.stopPropagation();
    onChange(value.filter((item) => !listingKeysEqual(item, option)));
  };

  return (
    <div ref={containerRef} className="relative">
      <label className={listingLabelClass}>{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen((prev) => {
            if (!prev) updatePanelPosition();
            return !prev;
          });
        }}
        className={`${listingFieldClass} flex min-h-[46px] w-full flex-wrap items-center gap-1.5 text-left`}
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
              className="flex max-h-72 flex-col overflow-hidden border border-neutral-200 bg-white shadow-lg"
            >
              {searchable ? (
                <div className="border-b border-neutral-100 p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-full border border-neutral-200 py-2 pl-9 pr-3 text-sm font-normal text-neutral-800 outline-none focus:border-[#1D3E35] focus:ring-1 focus:ring-[#1D3E35]/20"
                      onClick={(event) => event.stopPropagation()}
                    />
                  </div>
                </div>
              ) : null}
              <div className="max-h-44 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <p className="px-4 py-3 text-sm font-normal text-neutral-500">
                    {searchQuery.trim() ? emptySearchLabel : emptyListLabel}
                  </p>
                ) : (
                  filteredOptions.map((option) => {
                    const checked = Boolean(findMatchingSelected(option, value));
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
                  })
                )}
              </div>
              {allowCustom ? (
                <div className="border-t border-neutral-100 bg-neutral-50 p-3">
                  <p className="mb-2 text-xs font-normal text-neutral-500">{customSectionTitle}</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customValue}
                      onChange={(event) => {
                        setCustomValue(event.target.value);
                        if (customError) setCustomError('');
                      }}
                      onKeyDown={handleCustomKeyDown}
                      placeholder={customPlaceholder}
                      className="min-w-0 flex-1 border border-neutral-200 bg-white px-3 py-2 text-sm font-normal text-neutral-800 outline-none focus:border-[#1D3E35] focus:ring-1 focus:ring-[#1D3E35]/20"
                      onClick={(event) => event.stopPropagation()}
                    />
                    <button
                      type="button"
                      disabled={savingCustom}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleAddCustom();
                      }}
                      className="inline-flex shrink-0 items-center gap-1 bg-[#193e32] px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {savingCustom ? 'Saving…' : 'Add'}
                    </button>
                  </div>
                  {customError ? (
                    <p className="mt-2 text-xs font-normal text-red-600" role="alert">
                      {customError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
