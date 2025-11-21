"use client";

import React, { useState, useEffect } from "react";
import SudokuGrid from "@/components/sudoku/SudokuGrid";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isValidMove, solveSudoku, generateSudoku } from "@/lib/sudoku";

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
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
  const numberGrid = newGrid.map((row) => row.map((cell) => cell.value));

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
  return puzzle.map((row) =>
    row.map((value) => ({
      value,
      readonly: value !== 0,
      isInvalid: false, // Initially, no cells are invalid
    }))
  );
};

// Refactored NumberPad component
const NumberPad = ({
  onNumberClick,
  numbers,
  showClear,
  vertical = false,
}: {
  onNumberClick: (num: number) => void;
  numbers: number[];
  showClear: boolean;
  vertical?: boolean;
}) => (
  <div
    className={vertical ? "flex flex-col space-y-2" : "grid grid-cols-3 gap-2"}
  >
    {numbers.map((num) => (
      <Button
        key={num}
        onClick={() => onNumberClick(num)}
        variant="outline"
        className="w-12 h-12 text-xl"
      >
        {num}
      </Button>
    ))}
    {showClear && vertical && (
      <Button
        onClick={() => onNumberClick(0)}
        variant="destructive"
        className="w-12 h-12 text-xl"
      >
        X
      </Button>
    )}
    {showClear && !vertical && (
      <>
        <div /> {/* Empty space for grid layout */}
        <Button
          onClick={() => onNumberClick(0)}
          variant="destructive"
          className="w-12 h-12 text-xl"
        >
          X
        </Button>
      </>
    )}
  </div>
);

export default function SudokuPage() {
  const [grid, setGrid] = useState<Grid>(createInitialGrid(initialPuzzle));
  const [isSolved, setIsSolved] = useState(false);
  const [backgroundClickCount, setBackgroundClickCount] = useState(0);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    // Check for a solved puzzle whenever the grid changes
    const isFull = grid.every((row) => row.every((cell) => cell.value !== 0));
    const isInvalid = grid.some((row) => row.some((cell) => cell.isInvalid));

    if (isFull && !isInvalid) {
      setIsSolved(true);
      setSelectedCell(null); // Deselect cell on solve
    }
  }, [grid]);

  const handleCellChange = (row: number, col: number, value: number) => {
    const newGrid = grid.map((rowArray) =>
      rowArray.map((cell) => ({ ...cell }))
    );
    newGrid[row][col].value = value;
    const validatedGrid = validateGrid(newGrid);
    setGrid(validatedGrid);
  };

  const handleCellSelect = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const handleNumberPadClick = (num: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      if (!grid[row][col].readonly) {
        handleCellChange(row, col, num);
      }
    }
  };

  const handleSolve = () => {
    // Extract only the values for the solver
    const puzzleToSolve: number[][] = grid.map((row) =>
      row.map((cell) => cell.value)
    );
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

  const handleHint = () => {
    // Find the first empty cell
    let emptyCell: [number, number] | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c].value === 0) {
          emptyCell = [r, c];
          break;
        }
      }
      if (emptyCell) break;
    }

    if (!emptyCell) {
      // No empty cells left
      return;
    }

    const [row, col] = emptyCell;
    const puzzleToSolve: number[][] = grid.map((r) => r.map((c) => c.value));
    const solvedPuzzle = solveSudoku(puzzleToSolve);

    if (solvedPuzzle) {
      const correctValue = solvedPuzzle[row][col];
      handleCellChange(row, col, correctValue);
    }
  };

  const handleReset = () => {
    setGrid(createInitialGrid(initialPuzzle));
    setIsSolved(false);
    setSelectedCell(null);
  };

  const handleNewGame = () => {
    const newPuzzle = generateSudoku();
    setGrid(createInitialGrid(newPuzzle));
    setIsSolved(false);
    setSelectedCell(null);
  };
  const handleBackgroundClick = (e: React.MouseEvent<HTMLElement>) => {
    // 只有點到真正的背景（不是格子、按鈕、數字盤）才觸發
    if (e.target === e.currentTarget) {
      setSelectedCell(null); // 點背景取消選取

      const newCount = backgroundClickCount + 1;
      setBackgroundClickCount(newCount);

      if (newCount >= 5) {
        // 作弊啟動！直接解題 + 通關
        const currentPuzzle = grid.map((row) => row.map((cell) => cell.value));
        const solved = solveSudoku(currentPuzzle);

        if (solved) {
          const cheatedGrid: Grid = grid.map((row, rIdx) =>
            row.map((cell, cIdx) => ({
              ...cell,
              value: solved[rIdx][cIdx],
              isInvalid: false,
            }))
          );

          setGrid(cheatedGrid);
          setIsSolved(true); // 強制跳出恭喜視窗
          setBackgroundClickCount(0); // 重置計數，防止連續觸發
          setSelectedCell(null);
        } else {
          setBackgroundClickCount(0);
        }
      }
    }
  };

  return (
    <main
      className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="flex w-full max-w-4xl items-center justify-center gap-4 md:gap-8">
        {/* Left Number Pad */}
        <div className="hidden md:flex md:flex-col space-y-2">
          <NumberPad
            onNumberClick={handleNumberPadClick}
            numbers={[1, 2, 3, 4, 5]}
            showClear={false}
            vertical={true}
          />
        </div>

        {/* Center Content: Title, Grid, Buttons */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 md:mb-8">
            Sudoku Solver
          </h1>

          <SudokuGrid
            grid={grid}
            onCellChange={handleCellChange}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
          />

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={handleNewGame}>
              New Game
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="ghost" onClick={handleHint} className="font-bold">
              Hint
            </Button>
          </div>
        </div>

        {/* Right Number Pad */}
        <div className="hidden md:flex md:flex-col space-y-2">
          <NumberPad
            onNumberClick={handleNumberPadClick}
            numbers={[6, 7, 8, 9]}
            showClear={true}
            vertical={true}
          />
        </div>
      </div>

      {/* Bottom Number Pad (visible on small screens) */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center md:hidden">
        <div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg shadow-lg">
          <NumberPad
            onNumberClick={handleNumberPadClick}
            numbers={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
            showClear={true}
            vertical={false}
          />
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
