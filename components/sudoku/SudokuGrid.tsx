"use client";

import React from 'react';
import Cell from './Cell';

// Define types used by the grid
type CellData = {
  value: number;
  readonly: boolean;
  isInvalid: boolean;
};
type GridData = CellData[][];

// Define the props for the SudokuGrid component
interface SudokuGridProps {
  grid: GridData;
  onCellChange: (row: number, col: number, value: number) => void;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ grid, onCellChange }) => {
  return (
    <div 
      className="grid grid-cols-9 border-collapse border-2 border-gray-900 dark:border-gray-200"
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const borderClasses = [
            (rowIndex + 1) % 3 === 0 && rowIndex < 8 ? 'border-b-2 border-gray-900 dark:border-gray-200' : '',
            (colIndex + 1) % 3 === 0 && colIndex < 8 ? 'border-r-2 border-gray-900 dark:border-gray-200' : '',
          ].filter(Boolean).join(' ');

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={cell.value}
              readonly={cell.readonly}
              isInvalid={cell.isInvalid}
              onChange={onCellChange}
            />
          );
        })
      )}
    </div>
  );
};

export default SudokuGrid;
