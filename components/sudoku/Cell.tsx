"use client";

import React from 'react';

// Define the props for the Cell component
interface CellProps {
  value: number;
  readonly: boolean;
  isInvalid: boolean;
  row: number;
  col: number;
  onChange: (row: number, col: number, value: number) => void;
}

const Cell: React.FC<CellProps> = ({ value, readonly, isInvalid, row, col, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers from 1-9
    const val = e.target.value.replace(/[^1-9]/g, '');
    const numValue = val === '' ? 0 : parseInt(val, 10);
    onChange(row, col, numValue);
  };

  const cellClasses = `
    w-12 h-12 text-2xl text-center border
    border-gray-300 dark:border-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-colors
    ${readonly ? 'bg-gray-200 dark:bg-gray-700 font-bold text-gray-900 dark:text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'}
    ${isInvalid ? 'border-red-500 text-red-500' : ''}
  `;

  return (
    <input
      type="text"
      maxLength={1}
      value={value === 0 ? '' : value}
      readOnly={readonly}
      onChange={handleChange}
      className={cellClasses}
      aria-label={`Cell at row ${row + 1}, column ${col + 1}`}
    />
  );
};

export default Cell;
