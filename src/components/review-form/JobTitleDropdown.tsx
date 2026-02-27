import React, { useState, useRef, useEffect } from 'react';

const JOB_TITLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Data Scientist",
  "Data Analyst",
  "DevOps/SRE",
  "QA Engineer",
  "Engineering Manager",
  "Product Manager",
  "Project Manager",
  "Product Designer (UX/UI)",
  "Graphic Designer",
  "Sales Representative",
  "Account Executive",
  "Marketing Manager",
  "Content Writer",
  "Business Analyst",
  "Operations Manager",
  "HR Manager/Recruiter",
  "Accountant/Finance",
  "Consultant",
  "Customer Support",
  "IT Support",
  "Director",
  "VP / SVP",
  "C-level / Founder",
  "Intern"
];

interface JobTitleDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function JobTitleDropdown({ value, onChange, placeholder = "Start typing to search job titles..." }: JobTitleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter based on input value
  const filteredTitles = JOB_TITLES.filter(title => 
    title.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value); // Keep passing up the current value
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder={placeholder}
      />
      
      {isOpen && filteredTitles.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
          {filteredTitles.map((title) => (
            <li
              key={title}
              onClick={() => {
                setInputValue(title);
                onChange(title);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-800 text-sm"
            >
              {title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
