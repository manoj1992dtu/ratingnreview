'use client'
import React, { useState } from 'react';
import { ReviewData } from '@/components/ReviewFormPage';
import StarRating from '@/components/StarRating';
import CompanySearchDropdown from '../CompanySearchDropdown';
import JobTitleDropdown from './JobTitleDropdown';
import DepartmentDropdown from './DepartmentDropdown';

interface CompanyReviewFormProps {
  data: ReviewData;
  onUpdate: (data: Partial<ReviewData>) => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const CompanyReviewForm: React.FC<CompanyReviewFormProps> = ({
  data,
  onUpdate,
  onNext,
  onSubmit,
  isSubmitting
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ratingFields = [
    { key: 'workLifeBalance', label: 'Work-life balance' },
    { key: 'salary', label: 'Salary' },
    { key: 'promotions', label: 'Promotions' },
    { key: 'jobSecurity', label: 'Job security' },
    { key: 'skillDevelopment', label: 'Skill development' },
    { key: 'workSatisfaction', label: 'Work satisfaction' },
    { key: 'companyCulture', label: 'Company culture' }
  ] as const;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.companyName) newErrors.companyName = 'Company name is required';
    if (!data.overallRating) newErrors.overallRating = 'Overall rating is required';
    if (!data.workPolicy) newErrors.workPolicy = 'Work policy is required';
    if (!data.employmentType) newErrors.employmentType = 'Employment type is required';

    ratingFields.forEach(field => {
      if (!data[field.key]) {
        newErrors[field.key] = `${field.label} rating is required`;
      }
    });

    if (data.workPolicy === 'Hybrid' || data.workPolicy === 'Office') {
      if (!data.officeLocation) {
        newErrors.officeLocation = 'Office location is required';
      }
    }

    if (!data.currentlyWorking) {
      if (!data.startDate?.month || !data.startDate?.year) {
        newErrors.startDate = 'Start date is required';
      }
      if (!data.endDate?.month || !data.endDate?.year) {
        newErrors.endDate = 'End date is required';
      }
    } else {
      if (!data.startDate?.month || !data.startDate?.year) {
        newErrors.startDate = 'Start date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 50 }, (_, i) => 2024 - i);

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Review</h2>

      {/* Company Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name *
        </label>
        <CompanySearchDropdown
          value={data.companyName}
          onChange={(companyName) => onUpdate({ companyName })}
          error={errors.companyName}
          disableRedirect={true}
        />
        {errors.companyName && (
          <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
        )}
      </div>

      {/* Overall Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating *
        </label>
        <StarRating
          rating={data.overallRating}
          interactive
          onRatingChange={(rating) => onUpdate({ overallRating: rating })}
          size="lg"
        />
        {errors.overallRating && (
          <p className="text-red-500 text-xs mt-1">{errors.overallRating}</p>
        )}
      </div>

      {/* Detailed Ratings */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Rate Company on:</h3>
        <div className="space-y-4">
          {ratingFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between">
              <label className="text-sm text-gray-700">{field.label} *</label>
              <div className="flex flex-col items-end">
                <StarRating
                  rating={data[field.key]}
                  interactive
                  onRatingChange={(rating) => onUpdate({ [field.key]: rating })}
                />
                {errors[field.key] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender (Optional)
        </label>
        <select
          value={data.gender || ''}
          onChange={(e) => onUpdate({ gender: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select gender</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Transgender">Transgender</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </div>

      {/* Work Policy */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Policy *
        </label>
        <select
          value={data.workPolicy}
          onChange={(e) => onUpdate({ workPolicy: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.workPolicy ? 'border-red-300' : 'border-gray-300'
            }`}
        >
          <option value="">Select work policy</option>
          <option value="Permanent WFH">Permanent WFH</option>
          <option value="Office">Office</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        {errors.workPolicy && (
          <p className="text-red-500 text-xs mt-1">{errors.workPolicy}</p>
        )}
      </div>

      {/* Office Location */}
      {(data.workPolicy === 'Hybrid' || data.workPolicy === 'Office') && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Office Location *
          </label>
          <input
            type="text"
            value={data.officeLocation || ''}
            onChange={(e) => onUpdate({ officeLocation: e.target.value })}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.officeLocation ? 'border-red-300' : 'border-gray-300'
              }`}
            placeholder="Enter office location"
          />
          {errors.officeLocation && (
            <p className="text-red-500 text-xs mt-1">{errors.officeLocation}</p>
          )}
        </div>
      )}

      {/* Current Employment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Do you currently work here? *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.currentlyWorking === true}
              onChange={() => onUpdate({ currentlyWorking: true })}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.currentlyWorking === false}
              onChange={() => onUpdate({ currentlyWorking: false })}
              className="mr-2"
            />
            No
          </label>
        </div>
      </div>

      {/* Employment Dates */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Started working on *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={data.startDate?.month || ''}
            onChange={(e) => onUpdate({
              startDate: { ...data.startDate, month: e.target.value } as any
            })}
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
          >
            <option value="">Month</option>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select
            value={data.startDate?.year || ''}
            onChange={(e) => onUpdate({
              startDate: { ...data.startDate, year: e.target.value } as any
            })}
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
          >
            <option value="">Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {errors.startDate && (
          <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
        )}
      </div>

      {!data.currentlyWorking && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment ended on *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={data.endDate?.month || ''}
              onChange={(e) => onUpdate({
                endDate: { ...data.endDate, month: e.target.value } as any
              })}
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="">Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <select
              value={data.endDate?.year || ''}
              onChange={(e) => onUpdate({
                endDate: { ...data.endDate, year: e.target.value } as any
              })}
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
            >
              <option value="">Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {errors.endDate && (
            <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
          )}
        </div>
      )}

      {/* Designation */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Designation/Job Title (Optional)
        </label>
        <JobTitleDropdown
          value={data.designation || ''}
          onChange={(newVal) => onUpdate({ designation: newVal })}
        />
      </div>

      {/* Employment Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employment Type *
        </label>
        <select
          value={data.employmentType}
          onChange={(e) => onUpdate({ employmentType: e.target.value })}
          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.employmentType ? 'border-red-300' : 'border-gray-300'
            }`}
        >
          <option value="">Select employment type</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contractual">Contractual</option>
          <option value="Intern">Intern</option>
          <option value="Freelancer">Freelancer</option>
        </select>
        {errors.employmentType && (
          <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>
        )}
      </div>

      {/* Department */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Department (Optional)
        </label>
        <DepartmentDropdown
          value={data.department || ''}
          onChange={(newVal) => onUpdate({ department: newVal })}
        />
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
        </button>
        {/* <button
          onClick={handleNext}
          className="sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
        >
          Add More Details
        </button> */}
      </div>
    </form>
  );
};

export default CompanyReviewForm;