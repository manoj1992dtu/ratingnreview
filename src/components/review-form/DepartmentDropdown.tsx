import React, { useState, useRef, useEffect } from 'react';

const DEPARTMENTS = [
    "Engineering / Tech",
    "Product",
    "Design / UX",
    "Sales",
    "Marketing",
    "Operations",
    "Human Resources (HR)",
    "Finance / Accounting",
    "Customer Support / Success",
    "IT / Internal Systems",
    "Legal",
    "Business Development",
    "Admin / Operations",
    "Data / Analytics",
    "Other"
];

interface DepartmentDropdownProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function DepartmentDropdown({ value, onChange, placeholder = "Start typing to search departments..." }: DepartmentDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter based on input value
    const filteredDepartments = DEPARTMENTS.filter(dept =>
        dept.toLowerCase().includes(inputValue.toLowerCase())
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

            {isOpen && filteredDepartments.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                    {filteredDepartments.map((dept) => (
                        <li
                            key={dept}
                            onClick={() => {
                                setInputValue(dept);
                                onChange(dept);
                                setIsOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-gray-800 text-sm"
                        >
                            {dept}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
