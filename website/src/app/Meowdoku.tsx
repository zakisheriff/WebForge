"use client";

/**
 * Meowdoku — a tiny "Queens"-style logic puzzle to play while a capture runs.
 *
 * Ported from the React Native game to plain web React. Single-player only:
 * no multiplayer, chat, energy packs or campaign. Pick a difficulty, then
 * place one cat per row, column and colour region (cats can't touch, even
 * diagonally). Single tap marks a cell with ✕, double tap places a cat.
 *
 * The puzzle engine (generation + solver) is platform-agnostic and kept close
 * to the original: every board is unique AND solvable by pure deduction.
 */

import React, { useMemo, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────────────────── */

const REGION_COLORS = [
  "#ECA0CF", "#A8D98E", "#8E7CD8", "#A3C7E8", "#F0D690",
  "#C9A21E", "#2F8B57", "#A0713F", "#C8637E", "#3197A6",
  "#F5A97E", "#7093DB", "#D2DE6F", "#C592E0",
];

const CAT_SRC = "/cat.webp";
const LIFE_SRC = "/life.webp";

const LIVES_MAX = 3;

type Difficulty = "easy" | "medium" | "hard" | "expert";

interface Puzzle {
  N: number;
  queens: [number, number][];
  regions: number[][];
}

const DIFFICULTIES: {
  key: Difficulty;
  label: string;
  sub: string;
  N: number;
  concentration: number;
  minRegion: number;
  candidates: number;
}[] = [
  { key: "easy", label: "Easy", sub: "6 × 6 grid", N: 6, concentration: 2.5, minRegion: 1, candidates: 1 },
  { key: "medium", label: "Medium", sub: "8 × 8 grid", N: 8, concentration: 0.8, minRegion: 2, candidates: 1 },
  { key: "hard", label: "Hard", sub: "10 × 10 grid", N: 10, concentration: -1.2, minRegion: 3, candidates: 1 },
  { key: "expert", label: "Expert", sub: "12 × 12 grid", N: 12, concentration: -2.5, minRegion: 5, candidates: 1 },
];

/* ── puzzle engine (pure) ────────────────────────────────────────── */

function placeQueens(N: number): [number, number][] | null {
  function backtrack(row: number, placed: [number, number][]): [number, number][] | null {
    if (row === N) return placed;
    const cols = Array.from({ length: N }, (_, i) => i);
    for (let i = cols.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cols[i], cols[j]] = [cols[j], cols[i]];
    }
    for (const c of cols) {
      let valid = true;
      for (const [qr, qc] of placed) {
        if (qc === c || (Math.abs(qr - row) <= 1 && Math.abs(qc - c) <= 1)) {
          valid = false;
          break;
        }
      }
      if (valid) {
        const res = backtrack(row + 1, [...placed, [row, c]]);
        if (res) return res;
      }
    }
    return null;
  }
  return backtrack(0, []);
}

function growRegionsRandom(N: number, queens: [number, number][], concentration = 0): number[][] {
  const regions = Array.from({ length: N }, () => Array(N).fill(-1));
  const sizes = Array(N).fill(1);
  queens.forEach(([r, c], i) => { regions[r][c] = i; });
  const totalCells = N * N;
  let assignedCount = N;

  while (assignedCount < totalCells) {
    const candidates: { r: number; c: number; colors: number[] }[] = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (regions[r][c] === -1) {
          const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          const neighborColors: number[] = [];
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < N && nc >= 0 && nc < N && regions[nr][nc] !== -1) {
              neighborColors.push(regions[nr][nc]);
            }
          }
          if (neighborColors.length > 0) candidates.push({ r, c, colors: neighborColors });
        }
      }
    }
    if (candidates.length === 0) break;
    const cand = candidates[Math.floor(Math.random() * candidates.length)];

    let color: number;
    if (concentration === 0) {
      color = cand.colors[Math.floor(Math.random() * cand.colors.length)];
    } else {
      const weights = cand.colors.map((col) => Math.pow(sizes[col], concentration));
      const total = weights.reduce((a, b) => a + b, 0);
      let roll = Math.random() * total;
      color = cand.colors[0];
      for (let i = 0; i < cand.colors.length; i++) {
        roll -= weights[i];
        if (roll <= 0) { color = cand.colors[i]; break; }
      }
    }
    regions[cand.r][cand.c] = color;
    sizes[color]++;
    assignedCount++;
  }
  return regions;
}

function isContiguous(regions: number[][], N: number, regionId: number): boolean {
  const cells: [number, number][] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (regions[r][c] === regionId) cells.push([r, c]);
  }
  if (cells.length === 0) return true;
  const visited = new Set<string>();
  const queue: [number, number][] = [cells[0]];
  visited.add(`${cells[0][0]},${cells[0][1]}`);
  let count = 0;
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    count++;
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && regions[nr][nc] === regionId) {
        const key = `${nr},${nc}`;
        if (!visited.has(key)) { visited.add(key); queue.push([nr, nc]); }
      }
    }
  }
  return count === cells.length;
}

function solvePuzzle(N: number, regions: number[][]): [number, number][][] {
  const solutions: [number, number][][] = [];
  const usedCol = new Array(N).fill(false);
  const usedReg = new Array(N).fill(false);
  const placement = new Array(N).fill(-1);
  function backtrack(row: number) {
    if (solutions.length >= 2) return;
    if (row === N) {
      solutions.push(placement.map((c, r) => [r, c] as [number, number]));
      return;
    }
    const prevCol = row > 0 ? placement[row - 1] : -2;
    for (let c = 0; c < N; c++) {
      if (usedCol[c]) continue;
      const reg = regions[row][c];
      if (usedReg[reg]) continue;
      if (Math.abs(prevCol - c) <= 1) continue;
      usedCol[c] = true; usedReg[reg] = true; placement[row] = c;
      backtrack(row + 1);
      usedCol[c] = false; usedReg[reg] = false; placement[row] = -1;
      if (solutions.length >= 2) return;
    }
  }
  backtrack(0);
  return solutions;
}

function findSolutionWithCats(N: number, regions: number[][], cats: [number, number][]): [number, number][] | null {
  const fixedCol = new Array(N).fill(-1);
  for (const [r, c] of cats) {
    if (fixedCol[r] !== -1 && fixedCol[r] !== c) return null;
    fixedCol[r] = c;
  }
  const usedCol = new Array(N).fill(false);
  const usedReg = new Array(N).fill(false);
  const placement = new Array(N).fill(-1);
  function backtrack(row: number): boolean {
    if (row === N) return true;
    const prevCol = row > 0 ? placement[row - 1] : -2;
    const candidates = fixedCol[row] !== -1 ? [fixedCol[row]] : Array.from({ length: N }, (_, i) => i);
    for (const c of candidates) {
      if (usedCol[c]) continue;
      const reg = regions[row][c];
      if (usedReg[reg]) continue;
      if (Math.abs(prevCol - c) <= 1) continue;
      usedCol[c] = true; usedReg[reg] = true; placement[row] = c;
      if (backtrack(row + 1)) return true;
      usedCol[c] = false; usedReg[reg] = false; placement[row] = -1;
    }
    return false;
  }
  if (!backtrack(0)) return null;
  return placement.map((c, r) => [r, c] as [number, number]);
}

function catsOnBoard(board: number[][]): [number, number][] {
  const res: [number, number][] = [];
  for (let r = 0; r < board.length; r++) for (let c = 0; c < board.length; c++) {
    if (board[r][c] === 2) res.push([r, c]);
  }
  return res;
}

function isWinningBoard(board: number[][], regions: number[][]): boolean {
  const N = board.length;
  const cats = catsOnBoard(board);
  if (cats.length !== N) return false;
  const rows = new Set<number>(), cols = new Set<number>(), regs = new Set<number>();
  for (const [r, c] of cats) {
    if (rows.has(r) || cols.has(c) || regs.has(regions[r][c])) return false;
    rows.add(r); cols.add(c); regs.add(regions[r][c]);
  }
  for (let i = 0; i < cats.length; i++) for (let j = i + 1; j < cats.length; j++) {
    if (Math.abs(cats[i][0] - cats[j][0]) <= 1 && Math.abs(cats[i][1] - cats[j][1]) <= 1) return false;
  }
  return true;
}

// Can this board be completed by deduction alone (no guessing)?
function solvableByDeduction(N: number, regions: number[][], queens: [number, number][]): boolean {
  const solution = new Set(queens.map(([r, c]) => `${r},${c}`));
  const st: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
  let placed = 0;

  const eliminateFor = (grid: number[][], r: number, c: number) => {
    for (let i = 0; i < N; i++) {
      if (i !== c && grid[r][i] === 0) grid[r][i] = 1;
      if (i !== r && grid[i][c] === 0) grid[i][c] = 1;
    }
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && grid[nr][nc] === 0) grid[nr][nc] = 1;
    }
    const reg = regions[r][c];
    for (let rr = 0; rr < N; rr++) for (let cc = 0; cc < N; cc++) {
      if (regions[rr][cc] === reg && (rr !== r || cc !== c) && grid[rr][cc] === 0) grid[rr][cc] = 1;
    }
  };

  const catInRow = new Array(N).fill(false);
  const catInCol = new Array(N).fill(false);
  const catInReg = new Array(N).fill(false);
  const place = (r: number, c: number): boolean => {
    if (!solution.has(`${r},${c}`)) return false;
    st[r][c] = 2; placed++;
    catInRow[r] = true; catInCol[c] = true; catInReg[regions[r][c]] = true;
    eliminateFor(st, r, c);
    return true;
  };

  const openCellsOfRegion = (grid: number[][], id: number): [number, number][] => {
    const res: [number, number][] = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (regions[r][c] === id && grid[r][c] === 0) res.push([r, c]);
    }
    return res;
  };

  let guard = 0;
  while (placed < N && guard++ < N * N * 4) {
    let progress = false;

    for (let id = 0; id < N && !progress; id++) {
      if (catInReg[id]) continue;
      const cells = openCellsOfRegion(st, id);
      if (cells.length === 0) return false;
      if (cells.length === 1) { if (!place(cells[0][0], cells[0][1])) return false; progress = true; }
    }
    for (let r = 0; r < N && !progress; r++) {
      if (catInRow[r]) continue;
      const cs: number[] = [];
      for (let c = 0; c < N; c++) if (st[r][c] === 0) cs.push(c);
      if (cs.length === 0) return false;
      if (cs.length === 1) { if (!place(r, cs[0])) return false; progress = true; }
    }
    for (let c = 0; c < N && !progress; c++) {
      if (catInCol[c]) continue;
      const rs: number[] = [];
      for (let r = 0; r < N; r++) if (st[r][c] === 0) rs.push(r);
      if (rs.length === 0) return false;
      if (rs.length === 1) { if (!place(rs[0], c)) return false; progress = true; }
    }
    if (progress) continue;

    for (let id = 0; id < N && !progress; id++) {
      if (catInReg[id]) continue;
      const cells = openCellsOfRegion(st, id);
      const rows = new Set(cells.map((x) => x[0]));
      if (rows.size === 1) {
        const row = cells[0][0];
        for (let c = 0; c < N; c++) if (st[row][c] === 0 && regions[row][c] !== id) { st[row][c] = 1; progress = true; }
      }
      const cols = new Set(cells.map((x) => x[1]));
      if (cols.size === 1) {
        const col = cells[0][1];
        for (let r = 0; r < N; r++) if (st[r][col] === 0 && regions[r][col] !== id) { st[r][col] = 1; progress = true; }
      }
    }
    for (let row = 0; row < N && !progress; row++) {
      if (catInRow[row]) continue;
      const regs = new Set<number>();
      for (let c = 0; c < N; c++) if (st[row][c] === 0) regs.add(regions[row][c]);
      if (regs.size === 1) {
        const id = regs.values().next().value as number;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          if (r !== row && st[r][c] === 0 && regions[r][c] === id) { st[r][c] = 1; progress = true; }
        }
      }
    }
    for (let col = 0; col < N && !progress; col++) {
      if (catInCol[col]) continue;
      const regs = new Set<number>();
      for (let r = 0; r < N; r++) if (st[r][col] === 0) regs.add(regions[r][col]);
      if (regs.size === 1) {
        const id = regs.values().next().value as number;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          if (c !== col && st[r][c] === 0 && regions[r][c] === id) { st[r][c] = 1; progress = true; }
        }
      }
    }
    if (progress) continue;

    for (let r = 0; r < N && !progress; r++) {
      for (let c = 0; c < N && !progress; c++) {
        if (st[r][c] !== 0) continue;
        const hyp = st.map((row) => [...row]);
        hyp[r][c] = 2;
        eliminateFor(hyp, r, c);
        let contradiction = false;
        for (let id = 0; id < N && !contradiction; id++) {
          if (catInReg[id] || id === regions[r][c]) continue;
          if (openCellsOfRegion(hyp, id).length === 0) contradiction = true;
        }
        for (let rr = 0; rr < N && !contradiction; rr++) {
          if (catInRow[rr] || rr === r) continue;
          if (!hyp[rr].some((v) => v === 0)) contradiction = true;
        }
        for (let cc = 0; cc < N && !contradiction; cc++) {
          if (catInCol[cc] || cc === c) continue;
          let any = false;
          for (let rr = 0; rr < N; rr++) if (hyp[rr][cc] === 0) { any = true; break; }
          if (!any) contradiction = true;
        }
        if (contradiction) { st[r][c] = 1; progress = true; }
      }
    }

    if (!progress) return false;
  }
  return placed === N;
}

function mutateRegionsToInvalidate(regions: number[][], N: number, targetQueens: [number, number][], altQueens: [number, number][]): boolean {
  const targetSet = new Set(targetQueens.map(([r, c]) => `${r},${c}`));
  for (const [r, c] of altQueens) {
    if (!targetSet.has(`${r},${c}`)) {
      const oldColor = regions[r][c];
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          const newColor = regions[nr][nc];
          if (newColor !== oldColor) {
            const otherAlt = altQueens.some(([ar, ac]) => (ar !== r || ac !== c) && regions[ar][ac] === newColor);
            if (otherAlt) {
              regions[r][c] = newColor;
              if (isContiguous(regions, N, oldColor) && isContiguous(regions, N, newColor)) return true;
              regions[r][c] = oldColor;
            }
          }
        }
      }
    }
  }
  return false;
}

function generateUniquePuzzle(N: number, concentration = 0, minRegionSize = 1, depth = 0): Puzzle {
  let queens = placeQueens(N);
  while (!queens) queens = placeQueens(N);

  const checkRegionSizes = (regs: number[][]): boolean => {
    const sizes = new Array(N).fill(0);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const reg = regs[r][c];
      if (reg !== -1) sizes[reg]++;
    }
    return sizes.every((sz) => sz >= minRegionSize);
  };

  const grow = (): number[][] => growRegionsRandom(N, queens!, concentration);

  const freshBoard = (): number[][] => {
    let regs = grow();
    let attempts = 0;
    const maxAttempts = N >= 11 ? 40 : 100;
    while (!checkRegionSizes(regs) && attempts < maxAttempts) {
      attempts++;
      if (attempts % 10 === 0) { queens = placeQueens(N); while (!queens) queens = placeQueens(N); }
      regs = grow();
    }
    return regs;
  };

  let regions = freshBoard();
  let fallback: Puzzle | null = null;

  let iterations = 0;
  const maxIterations = N >= 11 ? 50 : 160;
  while (iterations < maxIterations) {
    iterations++;
    const solutions = solvePuzzle(N, regions);
    if (solutions.length === 1) {
      if (solvableByDeduction(N, regions, queens)) return { N, queens, regions };
      if (!fallback) fallback = { N, queens: queens.map((q) => [...q] as [number, number]), regions: regions.map((row) => [...row]) };
      queens = placeQueens(N); while (!queens) queens = placeQueens(N);
      regions = freshBoard();
      continue;
    }
    const alt = solutions.find((s) => {
      const sKey = s.map(([r, c]) => `${r},${c}`).sort().join(";");
      const qKey = queens!.map(([r, c]) => `${r},${c}`).sort().join(";");
      return sKey !== qKey;
    });
    if (alt) {
      const mutated = mutateRegionsToInvalidate(regions, N, queens, alt);
      if (!mutated) { queens = placeQueens(N); while (!queens) queens = placeQueens(N); regions = freshBoard(); }
    }
  }
  if (fallback) return fallback;
  if (depth > 2) return { N, queens, regions };
  return generateUniquePuzzle(N, concentration + 0.6, Math.max(1, minRegionSize - 1), depth + 1);
}

function giveawayScore(p: Puzzle): number {
  const sizes = new Array(p.N).fill(0);
  p.regions.forEach((row) => row.forEach((v) => { if (v !== -1) sizes[v]++; }));
  const ones = sizes.filter((s) => s === 1).length;
  const twos = sizes.filter((s) => s === 2).length;
  return ones * 100 + twos * 25 - Math.min(...sizes);
}

/* ── component ───────────────────────────────────────────────────── */

type Phase = "menu" | "generating" | "play" | "won" | "lost";
type Cell = { r: number; c: number };

export default function Meowdoku() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [diff, setDiff] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [board, setBoard] = useState<number[][]>([]); // 0 empty, 1 mark, 2 cat, 3 wrong, 4 auto-cross
  const [lives, setLives] = useState(LIVES_MAX);
  const [wrongCell, setWrongCell] = useState<Cell | null>(null);

  const lastTap = useRef<{ r: number; c: number; t: number } | null>(null);
  const DOUBLE_TAP_MS = 400;

  const startGame = (d: Difficulty) => {
    setDiff(d);
    setPhase("generating");
    const cfg = DIFFICULTIES.find((x) => x.key === d)!;
    // Defer so the spinner paints before the (potentially heavy) generation.
    setTimeout(() => {
      let p = generateUniquePuzzle(cfg.N, cfg.concentration, cfg.minRegion);
      for (let i = 1; i < cfg.candidates; i++) {
        const cand = generateUniquePuzzle(cfg.N, cfg.concentration, cfg.minRegion);
        if (giveawayScore(cand) < giveawayScore(p)) p = cand;
      }
      setPuzzle(p);
      setBoard(Array.from({ length: p.N }, () => Array(p.N).fill(0)));
      setLives(LIVES_MAX);
      setWrongCell(null);
      setPhase("play");
    }, 60);
  };

  const backToMenu = () => {
    setPhase("menu");
    setPuzzle(null);
    setBoard([]);
  };

  const placedCount = useMemo(() => board.flat().filter((v) => v === 2).length, [board]);
  const completedRegions = useMemo(() => {
    const set = new Set<number>();
    if (!puzzle) return set;
    for (let r = 0; r < puzzle.N; r++) for (let c = 0; c < puzzle.N; c++) {
      if (board[r]?.[c] === 2) set.add(puzzle.regions[r][c]);
    }
    return set;
  }, [board, puzzle]);

  const toggleMark = (r: number, c: number) => {
    if (!puzzle || phase !== "play") return;
    const v = board[r][c];
    if (v === 2 || v === 3 || v === 4) return;
    const next = board.map((row, ri) => row.map((val, ci) => (ri === r && ci === c ? (val === 1 ? 0 : 1) : val)));
    setBoard(next);
  };

  const placeCat = (r: number, c: number) => {
    if (!puzzle || phase !== "play") return;
    const v = board[r][c];
    if (v === 2 || v === 3 || v === 4) return;

    const correct = !!findSolutionWithCats(puzzle.N, puzzle.regions, [...catsOnBoard(board), [r, c]]);
    if (!correct) {
      // Lock as a red ✕, drop a life.
      const nb = board.map((row, ri) => row.map((val, ci) => (ri === r && ci === c ? 3 : val)));
      setBoard(nb);
      setWrongCell({ r, c });
      setTimeout(() => setWrongCell(null), 600);
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) setTimeout(() => setPhase("lost"), 400);
      return;
    }

    const nb = board.map((row) => [...row]);
    nb[r][c] = 2;
    const N = puzzle.N;
    const reg = puzzle.regions[r][c];
    for (let i = 0; i < N; i++) {
      if (i !== c && nb[r][i] === 0) nb[r][i] = 4;
      if (i !== r && nb[i][c] === 0) nb[i][c] = 4;
    }
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N && nb[nr][nc] === 0) nb[nr][nc] = 4;
    }
    for (let ri = 0; ri < N; ri++) for (let ci = 0; ci < N; ci++) {
      if (puzzle.regions[ri][ci] === reg && (ri !== r || ci !== c) && nb[ri][ci] === 0) nb[ri][ci] = 4;
    }
    setBoard(nb);
    if (isWinningBoard(nb, puzzle.regions)) setTimeout(() => setPhase("won"), 350);
  };

  const onCellTap = (r: number, c: number) => {
    const now = Date.now();
    const last = lastTap.current;
    if (last && last.r === r && last.c === c && now - last.t < DOUBLE_TAP_MS) {
      lastTap.current = null;
      placeCat(r, c);
    } else {
      lastTap.current = { r, c, t: now };
      toggleMark(r, c);
    }
  };

  const reveal = () => {
    if (!puzzle || phase !== "play" || lives <= 1) return;
    const sol = findSolutionWithCats(puzzle.N, puzzle.regions, catsOnBoard(board)) || puzzle.queens;
    const unplaced = sol.filter(([qr, qc]) => board[qr][qc] !== 2);
    if (unplaced.length === 0) return;
    const [qr, qc] = unplaced[Math.floor(Math.random() * unplaced.length)];
    setLives((l) => l - 1);
    placeCat(qr, qc);
  };

  /* ── render ─────────────────────────────────────────────────── */

  if (phase === "menu") {
    return (
      <div className="mw-wrap">
        <MeowStyles />
        <div className="mw-menu">
          <div className="mw-menu-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mw-mascot" src={CAT_SRC} alt="" />
            <div>
              <h4 className="mw-title">Meowdoku</h4>
              <p className="mw-sub">Play while we capture. One cat per row, column and colour.</p>
            </div>
          </div>
          <div className="mw-modes">
            {DIFFICULTIES.map((d) => (
              <button key={d.key} type="button" className="mw-mode" onClick={() => startGame(d.key)}>
                <span className="mw-mode-label">{d.label}</span>
                <span className="mw-mode-sub">{d.sub}</span>
              </button>
            ))}
          </div>
          <a className="mw-promo" href="https://pretend.theatom.lk" target="_blank" rel="noreferrer">
            Get the full Meowdoku experience and more at pretend.theatom.lk
          </a>
        </div>
      </div>
    );
  }

  if (phase === "generating" || !puzzle) {
    return (
      <div className="mw-wrap">
        <MeowStyles />
        <div className="mw-generating">
          <span className="mw-spinner" />
          <span>Shuffling the cats…</span>
        </div>
      </div>
    );
  }

  const N = puzzle.N;

  return (
    <div className="mw-wrap">
      <MeowStyles />
      <div className="mw-topbar">
        <button type="button" className="mw-chip" onClick={backToMenu}>← Modes</button>
        <div className="mw-progress">
          <div className="mw-progress-track">
            <div className="mw-progress-fill" style={{ width: `${(placedCount / N) * 100}%` }} />
          </div>
          <span className="mw-progress-text">{placedCount}/{N}</span>
        </div>
        <div className="mw-lives" aria-label={`${lives} lives left`}>
          {Array.from({ length: LIVES_MAX }).map((_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} className="mw-life" src={LIFE_SRC} alt="" style={{ opacity: i < lives ? 1 : 0.22 }} />
          ))}
        </div>
      </div>

      <div
        className="mw-board"
        style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, aspectRatio: "1 / 1" }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const color = REGION_COLORS[puzzle.regions[r][c] % REGION_COLORS.length];
            const done = completedRegions.has(puzzle.regions[r][c]);
            const isWrong = wrongCell?.r === r && wrongCell?.c === c;
            const mark = cell === 1 || cell === 3 || cell === 4;
            return (
              <button
                key={`${r},${c}`}
                type="button"
                className={`mw-cell${done ? " mw-cell-done" : ""}${isWrong ? " mw-cell-wrong" : ""}`}
                style={{ background: color }}
                onClick={() => onCellTap(r, c)}
                aria-label={`Row ${r + 1}, column ${c + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cell === 2 && <img className="mw-cat" src={CAT_SRC} alt="cat" />}
                {mark && (
                  <span className={`mw-x${cell === 3 ? " mw-x-wrong" : ""}`} aria-hidden>
                    <span className="mw-x-bar" />
                    <span className="mw-x-bar" />
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>

      <div className="mw-actions">
        <span className="mw-hint">Click a box to mark it, double-click to reveal a cat</span>
        <button type="button" className="mw-chip" onClick={reveal} disabled={lives <= 1}>
          Reveal a cat · costs a life
        </button>
      </div>

      {phase === "won" && (
        <div className="mw-overlay">
          <div className="mw-modal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mw-mascot" src={CAT_SRC} alt="" />
            <h4 className="mw-title">Solved!</h4>
            <p className="mw-sub">Nice — {DIFFICULTIES.find((d) => d.key === diff)!.label} cleared with {lives}/{LIVES_MAX} lives.</p>
            <div className="mw-modal-actions">
              <button type="button" className="mw-btn" onClick={() => startGame(diff)}>Play again</button>
              <button type="button" className="mw-chip" onClick={backToMenu}>Change mode</button>
            </div>
          </div>
        </div>
      )}

      {phase === "lost" && (
        <div className="mw-overlay">
          <div className="mw-modal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mw-mascot mw-mascot-sad" src={CAT_SRC} alt="" />
            <h4 className="mw-title">Out of lives</h4>
            <p className="mw-sub">The cats got away. Try again?</p>
            <div className="mw-modal-actions">
              <button type="button" className="mw-btn" onClick={() => startGame(diff)}>Retry</button>
              <button type="button" className="mw-chip" onClick={backToMenu}>Change mode</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── scoped styles ───────────────────────────────────────────────── */

function MeowStyles() {
  return (
    <style>{`
      .mw-wrap {
        position: relative;
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
        background: var(--card-bg, #fbf4ea);
        border: 1px solid var(--border-color, #eadfd2);
        border-radius: 20px;
        padding: 16px;
        font-family: var(--font-sans, system-ui, sans-serif);
        box-sizing: border-box;
      }
      .mw-title { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; margin: 0; color: var(--text-primary, #191919); }
      .mw-sub { font-size: 12.5px; margin: 2px 0 0; color: var(--text-secondary, #595856); line-height: 1.4; }
      .mw-mascot { width: 46px; height: 46px; object-fit: contain; flex-shrink: 0; }
      .mw-mascot-sad { filter: grayscale(0.4); transform: rotate(-8deg); }

      .mw-menu-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .mw-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .mw-mode {
        display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
        padding: 14px 16px; border-radius: 14px; cursor: pointer;
        background: #fff; border: 1.5px solid var(--border-color, #eadfd2);
        transition: transform 0.12s ease, border-color 0.12s ease;
      }
      .mw-mode:hover { transform: translateY(-2px); border-color: var(--accent-color, #3fa34d); }
      .mw-mode-label { font-size: 15px; font-weight: 800; color: var(--text-primary, #191919); }
      .mw-mode-sub { font-size: 12px; color: var(--text-secondary, #595856); }

      .mw-promo {
        display: block; margin-top: 14px; text-align: center; font-size: 12px; font-weight: 600;
        color: var(--accent-color, #3fa34d); text-decoration: none;
      }
      .mw-promo:hover { text-decoration: underline; }

      .mw-generating { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; color: var(--text-secondary, #595856); font-size: 13px; font-weight: 600; }
      .mw-spinner { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--border-color, #eadfd2); border-top-color: var(--accent-color, #3fa34d); animation: mw-spin 0.7s linear infinite; }
      @keyframes mw-spin { to { transform: rotate(360deg); } }

      .mw-topbar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
      .mw-progress { flex: 1; display: flex; align-items: center; gap: 8px; }
      .mw-progress-track { flex: 1; height: 8px; border-radius: 5px; background: var(--border-color, #eadfd2); overflow: hidden; }
      .mw-progress-fill { height: 100%; border-radius: 5px; background: var(--accent-color, #3fa34d); transition: width 0.25s ease; }
      .mw-progress-text { font-size: 13px; font-weight: 800; color: var(--accent-color, #3fa34d); min-width: 34px; }
      .mw-lives { display: flex; gap: 3px; }
      .mw-life { width: 20px; height: 20px; object-fit: contain; transition: opacity 0.2s ease; }

      .mw-chip {
        font-size: 12px; font-weight: 700; padding: 7px 12px; border-radius: 999px; cursor: pointer;
        background: #fff; border: 1.5px solid var(--border-color, #eadfd2); color: var(--text-primary, #191919);
        white-space: nowrap;
      }
      .mw-chip:hover:not(:disabled) { border-color: var(--accent-color, #3fa34d); }
      .mw-chip:disabled { opacity: 0.4; cursor: not-allowed; }

      .mw-board { display: grid; gap: 3px; width: 100%; user-select: none; }
      .mw-cell {
        position: relative; border: none; padding: 0; margin: 0; cursor: pointer;
        border-radius: 20%; display: flex; align-items: center; justify-content: center;
        aspect-ratio: 1 / 1; transition: box-shadow 0.15s ease, transform 0.08s ease;
        font-size: clamp(12px, 4vw, 22px);
      }
      .mw-cell:active { transform: scale(0.94); }
      .mw-cell-done { box-shadow: inset 0 0 0 2px rgba(255,255,255,0.65); }
      .mw-cell-wrong { animation: mw-shake 0.4s ease-in-out; }
      @keyframes mw-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
      .mw-cat {
        width: 82%; height: 82%; object-fit: contain;
        animation: mw-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }
      @keyframes mw-pop { 0% { transform: scale(0.3); } 100% { transform: scale(1); } }

      /* Big, bold, cute cross built from two rounded bars. */
      .mw-x {
        position: relative; width: 46%; height: 46%;
        animation: mw-pop 0.18s ease-out;
      }
      .mw-x-bar {
        position: absolute; top: 50%; left: 0; width: 100%; height: 22%;
        min-height: 3.5px; border-radius: 999px; background: #fff;
      }
      .mw-x-bar:first-child { transform: translateY(-50%) rotate(45deg); }
      .mw-x-bar:last-child { transform: translateY(-50%) rotate(-45deg); }
      .mw-x-wrong .mw-x-bar { background: #ff4d4d; }

      .mw-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 12px; }
      .mw-hint { font-size: 11.5px; color: var(--text-secondary, #595856); }

      .mw-overlay {
        position: absolute; inset: 0; border-radius: 20px;
        background: rgba(30,20,14,0.55); backdrop-filter: blur(2px);
        display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 5;
        animation: mw-fade 0.2s ease;
      }
      @keyframes mw-fade { from { opacity: 0; } to { opacity: 1; } }
      .mw-modal {
        background: #fff; border-radius: 18px; padding: 24px; text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 6px; max-width: 300px; width: 100%;
        animation: mw-rise 0.28s cubic-bezier(0.16,1,0.3,1);
      }
      @keyframes mw-rise { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .mw-modal-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 10px; }
      .mw-btn {
        width: 100%; padding: 12px; border-radius: 999px; border: none; cursor: pointer;
        background: var(--accent-color, #3fa34d); color: #fff; font-size: 14px; font-weight: 800;
      }
      .mw-btn:hover { filter: brightness(1.05); }

      @media (max-width: 480px) {
        .mw-modes { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
