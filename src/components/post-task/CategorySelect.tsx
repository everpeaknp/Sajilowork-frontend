'use client';



import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import { Search, ChevronDown, Check } from 'lucide-react';

import type { Category } from '@/types';

import { flattenCategoriesForSelect } from '@/lib/taskUtils';

import {

  postTaskLabel,

  postTaskInputMd,

  postTaskInputError,

  postTaskErrorText,

} from '@/components/post-task/postTaskStyles';



type CategorySelectProps = {

  categories: Category[];

  categoriesLoaded: boolean;

  value: string;

  onChange: (categoryId: string, categoryName: string) => void;

  showError?: boolean;

  error?: string;

};



type MenuPosition = {

  top: number;

  left: number;

  width: number;

};



export function CategorySelect({

  categories,

  categoriesLoaded,

  value,

  onChange,

  showError,

  error,

}: CategorySelectProps) {

  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState('');

  const [mounted, setMounted] = useState(false);

  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);



  const options = useMemo(() => flattenCategoriesForSelect(categories), [categories]);



  const filtered = useMemo(() => {

    const q = query.trim().toLowerCase();

    if (!q) return options;

    return options.filter((o) => o.name.toLowerCase().includes(q));

  }, [options, query]);



  const selected = options.find((o) => o.id === value);



  const handlePick = (id: string, name: string) => {

    onChange(id, name);

    setOpen(false);

    setQuery('');

  };



  useEffect(() => {

    setMounted(true);

  }, []);



  useLayoutEffect(() => {

    if (!open) {

      setMenuPosition(null);

      return;

    }



    const updatePosition = () => {

      const trigger = triggerRef.current;

      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();

      setMenuPosition({

        top: rect.bottom + 6,

        left: rect.left,

        width: rect.width,

      });

    };



    updatePosition();

    window.addEventListener('resize', updatePosition);

    window.addEventListener('scroll', updatePosition, true);

    return () => {

      window.removeEventListener('resize', updatePosition);

      window.removeEventListener('scroll', updatePosition, true);

    };

  }, [open]);



  const dropdownMenu = open && menuPosition && (

    <>

      <button

        type="button"

        className="fixed inset-0 z-[10051] cursor-default bg-[#000d45]/20 sm:bg-transparent"

        aria-label="Close category list"

        onClick={() => setOpen(false)}

      />

      <div

        className="fixed z-[10052] overflow-hidden rounded-xl bg-white shadow-xl"

        style={{

          top: menuPosition.top,

          left: menuPosition.left,

          width: menuPosition.width,

        }}

      >

        <div className="p-2">

          <div className="relative">

            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a96b0]" />

            <input

              type="text"

              value={query}

              onChange={(e) => setQuery(e.target.value)}

              placeholder="Search categories"

              className={`${postTaskInputMd} py-2 pl-8 pr-2.5 text-sm`}

              autoFocus

            />

          </div>

        </div>

        <ul

          role="listbox"

          className="max-h-[min(240px,45dvh)] overflow-y-auto overscroll-contain p-1.5 lg:max-h-72"

        >

          {!categoriesLoaded ? (

            <li className="px-2 py-4 text-center font-body text-xs text-[#6a719a]">

              Loading categories…

            </li>

          ) : filtered.length === 0 ? (

            <li className="px-2 py-4 text-center font-body text-xs italic text-[#6a719a]">

              {query.trim()

                ? `No categories matching "${query.trim()}"`

                : 'No categories available'}

            </li>

          ) : (

            filtered.map((option) => {

              const isSelected = option.id === value;

              return (

                <li key={option.id}>

                  <button

                    type="button"

                    role="option"

                    aria-selected={isSelected}

                    onClick={() => handlePick(option.id, option.name)}

                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left font-body text-sm font-medium transition-colors ${

                      isSelected

                        ? 'bg-[#eef4ff] text-primary'

                        : 'text-[#000d45] hover:bg-gray-50'

                    }`}

                  >

                    <span className="min-w-0 truncate">{option.name}</span>

                    {isSelected ? (

                      <Check className="h-3.5 w-3.5 shrink-0 stroke-[3]" />

                    ) : null}

                  </button>

                </li>

              );

            })

          )}

        </ul>

      </div>

    </>

  );



  return (

    <div className="relative w-full">

      <label className={`${postTaskLabel} mb-2 block`}>

        What category best fits this task?

      </label>



      <button

        ref={triggerRef}

        type="button"

        onClick={() => setOpen((prev) => !prev)}

        className={`${postTaskInputMd} flex min-h-[46px] w-full items-center justify-between gap-2 text-left sm:min-h-[48px] ${

          showError && error ? postTaskInputError : ''

        } ${open ? 'bg-gray-100' : ''}`}

        aria-expanded={open}

        aria-haspopup="listbox"

      >

        <span

          className={`truncate font-body text-sm sm:text-base ${

            selected ? 'font-semibold text-[#000d45]' : 'font-medium text-[#6a719a]/70'

          }`}

        >

          {!categoriesLoaded

            ? 'Loading categories…'

            : selected

              ? selected.name

              : 'Select a category'}

        </span>

        <ChevronDown

          className={`h-4 w-4 shrink-0 text-[#6a719a] transition-transform ${open ? 'rotate-180' : ''}`}

        />

      </button>



      {showError && error ? <p className={postTaskErrorText}>{error}</p> : null}



      {mounted && dropdownMenu ? createPortal(dropdownMenu, document.body) : null}

    </div>

  );

}

