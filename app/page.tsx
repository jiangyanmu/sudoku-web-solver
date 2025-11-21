"use client";

import React, { useState, useEffect } from 'react';
import SudokuGrid from '@/components/sudoku/SudokuGrid';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { isValidMove, solveSudoku, generateSudoku } from '@/lib/sudoku';

// Expanded cell type to include validation state.
type Cell = {
  value: number;
  readonly: boolean;
  isInvalid: boolean;
};

type Grid = Cell[][];

const initialPuzzle: number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

// Validates the entire grid and returns a new grid with updated isInvalid flags.
const validateGrid = (grid: Grid): Grid => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const numberGrid = newGrid.map(row => row.map(cell => cell.value));

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = newGrid[r][c];
      if (!cell.readonly && cell.value !== 0) {
        cell.isInvalid = !isValidMove(numberGrid, r, c, cell.value);
      } else {
        cell.isInvalid = false;
      }
    }
  }
  return newGrid;
};


const createInitialGrid = (puzzle: number[][]): Grid => {
  return puzzle.map(row => 
    row.map(value => ({
      value,
      readonly: value !== 0,
      isInvalid: false, // Initially, no cells are invalid
    }))
  );
};

export default function SudokuPage() {
  const [grid, setGrid] = useState<Grid>(createInitialGrid(initialPuzzle));
  const [isSolved, setIsSolved] = useState(false);
  const [backgroundClickCount, setBackgroundClickCount] = useState(0);

  useEffect(() => {
    // Check for a solved puzzle whenever the grid changes
    const isFull = grid.every(row => row.every(cell => cell.value !== 0));
    const isInvalid = grid.some(row => row.some(cell => cell.isInvalid));
    
    if (isFull && !isInvalid) {
      setIsSolved(true);
    }
  }, [grid]);

  const handleCellChange = (row: number, col: number, value: number) => {
    const newGrid = grid.map(rowArray => rowArray.map(cell => ({...cell})));
    newGrid[row][col].value = value;
    const validatedGrid = validateGrid(newGrid);
    setGrid(validatedGrid);
  };

  const handleSolve = () => {
    // Extract only the values for the solver
    const puzzleToSolve: number[][] = grid.map(row => row.map(cell => cell.value));
    const solvedPuzzle = solveSudoku(puzzleToSolve);

    if (solvedPuzzle) {
      // Convert the solved puzzle back to the Grid format, preserving readonly status
      const newGrid: Grid = grid.map((row, rIdx) =>
        row.map((cell, cIdx) => ({
          ...cell,
          value: solvedPuzzle[rIdx][cIdx],
          isInvalid: false, // Reset invalid status on solve
        }))
      );
      setGrid(newGrid);
    } else {
      alert("No solution found for the current puzzle!");
    }
  };

  const handleReset = () => {
    setGrid(createInitialGrid(initialPuzzle));
    setIsSolved(false);
  };

  const handleNewGame = () => {
    const newPuzzle = generateSudoku();
    setGrid(createInitialGrid(newPuzzle));
    setIsSolved(false);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLElement>) => {
    // Check if the click is on the main background, not its children
    if (e.target === e.currentTarget) {
      const newCount = backgroundClickCount + 1;
      setBackgroundClickCount(newCount);
      if (newCount >= 5) {
        handleSolve();
        setBackgroundClickCount(0); // Reset counter after cheat
      }
    }
  };

  return (
    <main 
      className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
          Sudoku Solver
        </h1>
        
        <SudokuGrid grid={grid} onCellChange={handleCellChange} />

        <div className="mt-8 flex space-x-4">
          <Button variant="outline" onClick={handleNewGame}>New Game</Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button onClick={handleSolve}>Solve</Button>
        </div>
      </div>

      <AlertDialog open={isSolved}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Congratulations!</AlertDialogTitle>
            <AlertDialogDescription>
              You have successfully solved the puzzle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNewGame}>
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}
