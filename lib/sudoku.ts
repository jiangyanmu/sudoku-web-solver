// @/lib/sudoku.ts
type Grid = number[][];

export const isValidMove = (
  grid: Grid,
  row: number,
  col: number,
  num: number
): boolean => {
  if (num === 0) return true;

  // 檢查行
  for (let x = 0; x < 9; x++)
    if (grid[row][x] === num && x !== col) return false;
  // 檢查列
  for (let x = 0; x < 9; x++)
    if (grid[x][col] === num && x !== row) return false;
  // 檢查 3x3
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (
        grid[i + startRow][j + startCol] === num &&
        (i + startRow !== row || j + startCol !== col)
      )
        return false;

  return true;
};

const shuffleArray = <T>(array: T[]): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// 真正的回溯解題器（修改原地，回傳是否成功）
const solveSudokuInPlace = (grid: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudokuInPlace(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true; // 全填滿
};

// 給外部呼叫用的安全版本（不會改到原盤面）
export const solveSudoku = (puzzle: number[][]): number[][] | null => {
  const grid = puzzle.map((row) => row.slice());
  return solveSudokuInPlace(grid) ? grid : null;
};

// 產生新題目
export const generateSudoku = (removeCount = 42): number[][] => {
  const grid: number[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  // 填對角線三宮（保證可解）
  for (let box = 0; box < 9; box += 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(nums);
    let idx = 0;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) grid[box + i][box + j] = nums[idx++];
  }

  solveSudokuInPlace(grid); // 填滿

  const puzzle = grid.map((row) => row.slice());
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) positions.push([r, c]);
  shuffleArray(positions);

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= removeCount) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const test = puzzle.map((row) => row.slice());
    if (!solveSudokuInPlace(test)) {
      puzzle[r][c] = backup;
    } else {
      removed++;
    }
  }

  return puzzle;
};
