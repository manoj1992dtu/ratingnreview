// src/components/CompanySearchDropdown.tsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building, ChevronDown } from 'lucide-react';
import { companyApi } from '../services/api';
// import type { Company } from '../lib/supabase';
import { useDebounce } from '@/hooks/useDebounce'; // ✅ make sure folder is "hooks", not "hook"
import { CompanyPreview } from '@/types/company';

interface CompanySearchDropdownProps {
  value: string;
  onChange: (companyName: string) => void;
  error?: string;
  onCompanySelect?: (company: CompanyPreview) => void;
  disableRedirect?: boolean;
}

const CompanySearchDropdown: React.FC<CompanySearchDropdownProps> = ({
  value,
  onChange,
  error,
  onCompanySelect,
  disableRedirect
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [companies, setCompanies] = useState<CompanyPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // ✅ Cache results
  const searchCache = useRef<Map<string, CompanyPreview[]>>(new Map());

  // ✅ Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ✅ Normalize cache key
  const fetchCompanies = useCallback(async (term: string) => {
    const key = term.toLowerCase().trim();
    if (!key) return;

    if (searchCache.current.has(key)) {
      setCompanies(searchCache.current.get(key) || []);
      return;
    }

    try {
      setLoading(true);
      const data = await companyApi.getCompanies(key);
      searchCache.current.set(key, data);
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Trigger API on debounced term
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchCompanies(debouncedSearchTerm);
    } else {
      setCompanies([]);
    }
  }, [debouncedSearchTerm, fetchCompanies]);

  // ✅ Sync external value
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Company selection
  const handleCompanySelect = useCallback((company: CompanyPreview) => {
    setSearchTerm(company.name);
    onChange(company.name);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onCompanySelect) {
      onCompanySelect(company);
    } else if (!disableRedirect) {
      router.push(`/companies/${company.slug}`);
    }
  }, [onChange, onCompanySelect, disableRedirect, router]);

  // ✅ Keyboard navigation (uses filtered list)
  const handleKeyDown = useCallback((e: React.KeyboardEvent, filteredCompanies: CompanyPreview[]) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < filteredCompanies.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredCompanies[selectedIndex]) {
          handleCompanySelect(filteredCompanies[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [isOpen, selectedIndex, handleCompanySelect]);

  // ✅ Only fuzzy match locally if user keeps typing
  const filteredCompanies = useMemo(() => {
    const key = searchTerm.toLowerCase();
    return companies.filter(c => c.name.toLowerCase().includes(key));
  }, [companies, searchTerm]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={e => handleKeyDown(e, filteredCompanies)}
          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Search or enter company name"
          aria-label="Search companies"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="company-listbox"
          aria-activedescendant={
            selectedIndex >= 0 ? `company-${filteredCompanies[selectedIndex]?.id}` : undefined
          }
        />
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && filteredCompanies.length>0 &&  (
        <div
          id="company-listbox"
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-gray-500 text-center">Loading companies...</div>
          ) : (
            filteredCompanies.map((company, index) => (
              <button
                key={company.id}
                id={`company-${company.id}`}
                role="option"
                aria-selected={selectedIndex === index}
                onClick={() => handleCompanySelect(company)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${
                  selectedIndex === index ? 'bg-gray-50' : ''
                }`}
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.industry || 'Technology'}</div>
                </div>
              </button>
            ))
          )
          }
        </div>
      )}
    </div>
  );
};

export default React.memo(CompanySearchDropdown);

// import React, { useState, useRef, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Search, Building, ChevronDown } from 'lucide-react';
// import { companyApi } from '../services/api';
// import type { Company } from '../lib/supabase';

// interface CompanySearchDropdownProps {
//   value: string;
//   onChange: (companyName: string) => void;
//   error?: string;
//   onCompanySelect?: (company: Company) => void;
//   disableRedirect?: boolean;
// }

// const CompanySearchDropdown: React.FC<CompanySearchDropdownProps> = ({
//   value,
//   onChange,
//   error,
//   onCompanySelect,
//   disableRedirect
// }) => {
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState(value);
//   const [companies, setCompanies] = useState<Company[]>([]);
//   const [loading, setLoading] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   // Fetch companies from API
//   useEffect(() => {
//     const fetchCompanies = async () => {
//       try {
//         setLoading(true);
//         const data = await companyApi.getCompanies(searchTerm);
//         setCompanies(data);
//       } catch (error) {
//         console.error('Error fetching companies:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     const debounceTimer = setTimeout(fetchCompanies, 300);
//     return () => clearTimeout(debounceTimer);
//   }, [searchTerm]);

//   useEffect(() => {
//     setSearchTerm(value);
//   }, [value]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value;
//     setSearchTerm(newValue);
//     onChange(newValue);
//     setIsOpen(true);
//   };

//   const handleCompanySelect = (company: Company) => {
//     setSearchTerm(company.name);
//     onChange(company.name);
//     setIsOpen(false);
    
//     // Call the onCompanySelect callback if provided
//     if (onCompanySelect) {
//       console.log("ComanySearchDropdown 1")
//       onCompanySelect(company);
//     } else if (!disableRedirect){
//       console.log("ComanySearchDropdown 2")
//       // Default behavior: navigate to company page
//       // router.push(`/employers/${company.id}`);      
//       router.push(`/employers/${company.slug}`);
//     }
//   };

//   const handleInputFocus = () => {
//     setIsOpen(true);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//         <input
//           type="text"
//           value={searchTerm}
//           onChange={handleInputChange}
//           onFocus={handleInputFocus}
//           className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
//             error ? 'border-red-300' : 'border-gray-300'
//           }`}
//           placeholder="Search or enter company name"
//         />
//         <ChevronDown 
//           className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 transition-transform ${
//             isOpen ? 'rotate-180' : ''
//           }`}
//         />
//       </div>

//       {isOpen && (
//         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//           {loading ? (
//             <div className="px-4 py-3 text-gray-500 text-center">
//               Loading companies...
//             </div>
//           ) : companies.length > 0 ? (
//             <>
//               {companies.map((company) => (
//                 <button
//                   key={company.id}
//                   onClick={() => handleCompanySelect(company)}
//                   className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
//                 >
//                   <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <Building className="h-4 w-4 text-primary" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="font-medium text-gray-900 truncate">{company.name}</div>
//                     <div className="text-sm text-gray-500">{company.industry || 'Technology'}</div>
//                   </div>
//                 </button>
//               ))}
//               {searchTerm && !companies.some(c => c.name.toLowerCase() === searchTerm.toLowerCase()) && (
//                 <button
//                   onClick={() => {
//                     setIsOpen(false);
//                     // For new companies, we could create them or show a message
//                     // For now, just close the dropdown
//                   }}
//                   className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-t border-gray-200"
//                 >
//                   <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                     <Building className="h-4 w-4 text-green-600" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium text-gray-900">Add &quot;{searchTerm}&quot;</div>
//                     <div className="text-sm text-gray-500">Create new company entry</div>
//                   </div>
//                 </button>
//               )}
//             </>
//           ) : (
//             <div className="px-4 py-3 text-gray-500 text-center">
//               No companies found
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CompanySearchDropdown;