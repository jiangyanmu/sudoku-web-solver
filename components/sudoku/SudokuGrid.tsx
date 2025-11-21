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
  selectedCell: [number, number] | null;
  onCellSelect: (row: number, col: number) => void;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({ grid, onCellChange, selectedCell, onCellSelect }) => {
  return (
    <div 
      className="grid grid-cols-9 border-collapse border-2 border-gray-900 dark:border-gray-200"
      style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isSelected = selectedCell ? selectedCell[0] === rowIndex && selectedCell[1] === colIndex : false;

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={cell.value}
              readonly={cell.readonly}
              isInvalid={cell.isInvalid}
              isSelected={isSelected}
              onChange={onCellChange}
              onSelect={onCellSelect}
            />
          );
        })
      )}
    </div>
  );
};

export default SudokuGrid;
