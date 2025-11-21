// This file will contain the core logic for the Sudoku game.

// Define the grid structure for clarity, though it's implicitly used.
// A value of 0 represents an empty cell.
type Grid = number[][];

/**
 * Checks if placing a number in a specific cell is valid according to Sudoku rules.
 * @param grid The Sudoku grid (9x9 array of numbers).
 * @param row The row index of the cell.
 * @param col The column index of the cell.
 * @param num The number to check.
 * @returns boolean - True if the move is valid, false otherwise.
 */
export const isValidMove = (grid: Grid, row: number, col: number, num: number): boolean => {
  if (num === 0) {
    // A value of 0 is always "valid" in the sense that it's an empty cell.
    // The actual validation is for numbers 1-9.
    return true;
  }

  // Check if the number is already present in the same row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num && x !== col) {
      return false;
    }
  }

  // Check if the number is already present in the same column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num && x !== row) {
      return false;
    }
  }

  // Check if the number is already present in the 3x3 subgrid
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i + startRow][j + startCol] === num && (i + startRow !== row || j + startCol !== col)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Helper function to find the next empty cell in the grid.
 * @param grid The Sudoku grid.
 * @returns [row, col] of the empty cell, or null if no empty cells are found.
 */
const findEmpty = (grid: number[][]): [number, number] | null => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        return [r, c];
      }
    }
  }
  return null;
};

/**
 * Solves a Sudoku puzzle using a backtracking algorithm.
 * @param puzzle The Sudoku puzzle to solve (9x9 array of numbers, 0 for empty cells).
 * @returns The solved Sudoku grid, or null if no solution exists.
 */
export const solveSudoku = (puzzle: number[][]): number[][] | null => {
  // Create a deep copy of the puzzle to avoid modifying the original
  const grid: number[][] = puzzle.map(row => row.slice());

  // Find the next empty cell (represented by 0)
  let emptyCell = findEmpty(grid);
  let row = emptyCell ? emptyCell[0] : -1;
  let col = emptyCell ? emptyCell[1] : -1;

  // If there are no empty cells, the puzzle is solved
  if (row === -1) {
    return grid;
  }

  // Try numbers from 1 to 9
  // Shuffle numbers to get different puzzles each time
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);

  for (let num of numbers) {
    if (isValidMove(grid, row, col, num)) {
      grid[row][col] = num; // Place the number

      // Recursively try to solve the rest of the puzzle
      if (solveSudoku(grid)) {
        return grid; // If a solution is found, return it
      }

      grid[row][col] = 0; // Backtrack: reset the cell
    }
  }

  return null; // No solution found
};

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * @param array The array to shuffle.
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Generates a new solvable Sudoku puzzle.
 * Note: This basic implementation does not guarantee a unique solution.
 * @param cellsToRemove The number of cells to remove to create the puzzle difficulty.
 * @returns A new Sudoku puzzle (9x9 array of numbers, 0 for empty cells).
 */
export const generateSudoku = (cellsToRemove: number = 45): number[][] => {
  // Start with an empty grid
  let grid: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));

  // Fill the grid completely using the solver to get a valid starting board
  const fullGrid = solveSudoku(grid);

  if (!fullGrid) {
    // This should ideally not happen if solveSudoku can solve an empty grid
    console.error("Failed to generate a full Sudoku grid.");
    return Array(9).fill(0).map(() => Array(9).fill(0));
  }

  // Create a list of all cell coordinates
  const allCells: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      allCells.push([r, c]);
    }
  }
  shuffleArray(allCells); // Randomize the order of cells

  let cellsRemovedCount = 0;
  const puzzle = fullGrid.map(row => row.slice()); // Copy the full grid to start removing cells

  for (let i = 0; i < allCells.length && cellsRemovedCount < cellsToRemove; i++) {
    const [row, col] = allCells[i];
    const tempValue = puzzle[row][col]; // Store the value
    puzzle[row][col] = 0; // Remove the cell

    // This is a simplified check. A full unique solution check would involve
    // calling solveSudoku on the puzzle and ensuring it only returns one solution.
    // For now, we just ensure it remains solvable.
    if (solveSudoku(puzzle)) {
      cellsRemovedCount++;
    } else {
      puzzle[row][col] = tempValue; // If removing makes it unsolvable, put it back
    }
  }
  
  return puzzle;
};
