import React, { useState, useEffect, useRef } from 'react';

interface TicTacToeGameProps {
  onGameEnd?: (winner: 'X' | 'O' | 'draw') => void;
}

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ onGameEnd }) => {
  // Board state: 9 cells, null | 'X' | 'O'
  const [board, setBoard] = useState<Array<'X' | 'O' | null>>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true); // Player X always starts
  const [gameMode, setGameMode] = useState<'ai' | 'pvp'>('ai'); // AI vs Local 2 Players
  const [difficulty, setDifficulty] = useState<'relaxed' | 'smart'>('relaxed'); // Santai vs Pintar
  const [scores, setScores] = useState({ playerX: 0, playerO: 0, draws: 0 });
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Calming encouragement tip
  const [tipIndex, setTipIndex] = useState(0);
  const calmingTips = [
    'Tarik napas perlahan... Rehat sejenak dari tugas membantu fokus kembali.',
    'Bermain santai 2-3 menit terbukti menurunkan kadar kortisol otak.',
    'Menang atau kalah tidak masalah, yang penting pikiranmu rileks sejenak.',
    'Hargai usahamu hari ini, kamu sudah berjuang dengan baik! 🌟',
    'Minum segelas air putih dan regangkan bahumu setelah ini ya. 💧',
  ];

  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  // Optional Gentle Web Audio synthesizer (lightweight, zero bundle size)
  const playSound = (type: 'click' | 'win' | 'draw' | 'reset') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.09);
          osc.stop(ctx.currentTime + i * 0.09 + 0.2);
        });
      } else if (type === 'draw') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // Audio context might be blocked by browser gesture policies, gracefully ignore
    }
  };

  // Check winner helper
  const checkWinner = (currentBoard: Array<'X' | 'O' | null>) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a] as 'X' | 'O', line: combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'draw' as const, line: null };
    }
    return null;
  };

  // Perform AI Move
  const makeAiMove = (currentBoard: Array<'X' | 'O' | null>) => {
    setIsAiThinking(true);
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

    aiTimerRef.current = setTimeout(() => {
      // 1. Check if AI can win immediately
      for (const [a, b, c] of winningCombinations) {
        if (currentBoard[a] === 'O' && currentBoard[b] === 'O' && currentBoard[c] === null) {
          applyMove(c, 'O', currentBoard);
          return;
        }
        if (currentBoard[a] === 'O' && currentBoard[c] === 'O' && currentBoard[b] === null) {
          applyMove(b, 'O', currentBoard);
          return;
        }
        if (currentBoard[b] === 'O' && currentBoard[c] === 'O' && currentBoard[a] === null) {
          applyMove(a, 'O', currentBoard);
          return;
        }
      }

      // 2. Block Player X if about to win (higher probability on smart mode)
      const blockChance = difficulty === 'smart' ? 0.95 : 0.65;
      if (Math.random() < blockChance) {
        for (const [a, b, c] of winningCombinations) {
          if (currentBoard[a] === 'X' && currentBoard[b] === 'X' && currentBoard[c] === null) {
            applyMove(c, 'O', currentBoard);
            return;
          }
          if (currentBoard[a] === 'X' && currentBoard[c] === 'X' && currentBoard[b] === null) {
            applyMove(b, 'O', currentBoard);
            return;
          }
          if (currentBoard[b] === 'X' && currentBoard[c] === 'X' && currentBoard[a] === null) {
            applyMove(a, 'O', currentBoard);
            return;
          }
        }
      }

      // 3. Take center if available
      if (currentBoard[4] === null) {
        applyMove(4, 'O', currentBoard);
        return;
      }

      // 4. Random available corner or cell
      const emptyIndices = currentBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter((val): val is number => val !== null);

      if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        applyMove(randomIndex, 'O', currentBoard);
      }
    }, 400);
  };

  const applyMove = (index: number, symbol: 'X' | 'O', boardSnapshot: Array<'X' | 'O' | null>) => {
    setIsAiThinking(false);
    playSound('click');

    const nextBoard = [...boardSnapshot];
    nextBoard[index] = symbol;
    setBoard(nextBoard);

    const result = checkWinner(nextBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setTipIndex((prev) => (prev + 1) % calmingTips.length);

      if (result.winner === 'draw') {
        playSound('draw');
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
      } else {
        playSound('win');
        setScores((s) => ({
          ...s,
          playerX: result.winner === 'X' ? s.playerX + 1 : s.playerX,
          playerO: result.winner === 'O' ? s.playerO + 1 : s.playerO,
        }));
      }

      if (onGameEnd) {
        onGameEnd(result.winner);
      }
    } else {
      // Toggle player turn
      const nextIsX = symbol === 'O';
      setIsXNext(nextIsX);
    }
  };

  const handleCellClick = (index: number) => {
    // If cell already filled, or game ended, or AI thinking, ignore
    if (board[index] !== null || winner !== null || isAiThinking) return;

    if (isXNext) {
      applyMove(index, 'X', board);
    } else if (gameMode === 'pvp') {
      applyMove(index, 'O', board);
    }
  };

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (!isXNext && gameMode === 'ai' && winner === null) {
      const isFull = board.every((c) => c !== null);
      if (!isFull) {
        makeAiMove(board);
      }
    }
  }, [isXNext, gameMode, winner, board]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  const handleResetGame = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine(null);
    setWinner(null);
    setIsAiThinking(false);
  };

  const handleResetScores = () => {
    handleResetGame();
    setScores({ playerX: 0, playerO: 0, draws: 0 });
  };

  // Status message text
  let statusBadgeText = 'Giliran Kamu (X)';
  if (winner === 'draw') {
    statusBadgeText = 'Permainan Seri! 🤝 Pikiran segar sejenak';
  } else if (winner === 'X') {
    statusBadgeText = gameMode === 'ai' ? 'Kamu Menang! 🎉 Hebat!' : 'Pemain X Menang! 🎉';
  } else if (winner === 'O') {
    statusBadgeText = gameMode === 'ai' ? 'VibeBot Menang! 🤖 Coba lagi yuk' : 'Pemain O Menang! 🎉';
  } else if (isAiThinking) {
    statusBadgeText = 'VibeBot sedang berpikir (O)...';
  } else if (!isXNext) {
    statusBadgeText = gameMode === 'ai' ? 'Giliran VibeBot (O)' : 'Giliran Pemain (O)';
  }

  return (
    <div className="w-full bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col text-left">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-white via-[#F0F9FF] to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-[22px]">grid_3x3</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[16px] text-[#1E293B]">
                Mini Game XO (Pereda Stres)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                Ringan &amp; Santai ☕
              </span>
            </div>
            <p className="text-[12px] text-slate-500">
              Alihkan pikiran sejenak dari penat. 100% cepat, bebas kamera &amp; suara.
            </p>
          </div>
        </div>

        {/* Right Controls: Mode Toggle & Sound Toggle */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            title={soundEnabled ? 'Matikan Efek Suara' : 'Nyalakan Efek Suara'}
          >
            <span className="material-symbols-outlined text-[17px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Game Mode Pills */}
          <div className="flex items-center gap-1 bg-[#F0F9FF] p-1 rounded-xl border border-[#BAE6FD]">
            <button
              type="button"
              onClick={() => {
                setGameMode('ai');
                handleResetGame();
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                gameMode === 'ai'
                  ? 'bg-white text-[#0284C7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🤖 Lawan AI
            </button>
            <button
              type="button"
              onClick={() => {
                setGameMode('pvp');
                handleResetGame();
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                gameMode === 'pvp'
                  ? 'bg-white text-[#0284C7] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 2 Pemain
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="p-6 bg-gradient-to-b from-[#F0F9FF]/40 to-white flex flex-col items-center justify-center">
        {/* Scoreboard Bar */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-white border border-[#BAE6FD] p-2.5 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {gameMode === 'ai' ? 'Kamu (X)' : 'Pemain (X)'}
            </span>
            <span className="text-[20px] font-extrabold text-[#0284C7] block leading-tight">
              {scores.playerX}
            </span>
          </div>

          <div className="bg-white border border-slate-200 p-2.5 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Seri</span>
            <span className="text-[20px] font-extrabold text-slate-700 block leading-tight">
              {scores.draws}
            </span>
          </div>

          <div className="bg-white border border-amber-200 p-2.5 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">
              {gameMode === 'ai' ? 'VibeBot (O)' : 'Pemain (O)'}
            </span>
            <span className="text-[20px] font-extrabold text-[#EA580C] block leading-tight">
              {scores.playerO}
            </span>
          </div>
        </div>

        {/* Turn / Status Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all ${
              winner && winner !== 'draw'
                ? 'bg-[#DCFCE7] text-[#15803D] shadow-xs'
                : winner === 'draw'
                ? 'bg-amber-100 text-amber-800'
                : isAiThinking
                ? 'bg-[#E0F2FE] text-[#0284C7] animate-pulse'
                : isXNext
                ? 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]'
                : 'bg-amber-50 text-[#EA580C] border border-amber-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {winner && winner !== 'draw'
                ? 'celebration'
                : winner === 'draw'
                ? 'handshake'
                : isAiThinking
                ? 'hourglass_empty'
                : 'videogame_asset'}
            </span>
            <span>{statusBadgeText}</span>
          </span>
        </div>

        {/* 3x3 Tic-Tac-Toe Board */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square grid grid-cols-3 gap-2.5 p-3 rounded-3xl bg-white border-2 border-[#CBD5E1] shadow-[0_8px_24px_rgba(56,189,248,0.12)]">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || winner !== null || isAiThinking}
                className={`w-full h-full rounded-2xl flex items-center justify-center font-extrabold transition-all cursor-pointer ${
                  isWinningCell
                    ? 'bg-[#DCFCE7] border-2 border-[#16A34A] scale-[1.02] shadow-sm'
                    : cell === null
                    ? 'bg-[#F8FAFC] hover:bg-[#F0F9FF] hover:border-[#38BDF8] border border-slate-200 active:scale-95'
                    : 'bg-white border border-slate-200 shadow-2xs'
                }`}
                aria-label={`Kotak ${idx + 1}: ${cell || 'Kosong'}`}
              >
                {cell === 'X' && (
                  <span className="text-3xl sm:text-4xl text-[#0284C7] font-sans font-black select-none">
                    ✕
                  </span>
                )}
                {cell === 'O' && (
                  <span className="text-3xl sm:text-4xl text-[#EA580C] font-sans font-black select-none">
                    ◯
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Game Action Controls & Difficulty */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleResetGame}
            className="px-5 py-2 rounded-full bg-[#38BDF8] hover:bg-[#0284C7] text-white font-bold text-[13px] shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">restart_alt</span>
            <span>Main Lagi</span>
          </button>

          {gameMode === 'ai' && (
            <button
              type="button"
              onClick={() => {
                setDifficulty(difficulty === 'relaxed' ? 'smart' : 'relaxed');
                handleResetGame();
              }}
              className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[12px] active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Tingkat:</span>
              <span className="font-bold text-[#0284C7]">
                {difficulty === 'relaxed' ? 'Santai 🍃' : 'Tantangan ⚡'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetScores}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-semibold text-[12px] active:scale-95 transition-all cursor-pointer"
          >
            Reset Skor
          </button>
        </div>

        {/* Calming Tip Box */}
        <div className="mt-4 px-4 py-2 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[12px] text-[#0369A1] text-center max-w-sm flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] shrink-0 text-[#0284C7]">lightbulb</span>
          <span>{calmingTips[tipIndex]}</span>
        </div>
      </div>

      {/* Bottom Calming Info Footer */}
      <div className="px-5 py-3 bg-[#F8FAFC] border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px] text-[#0284C7]">spa</span>
          Bermain sejenak membantu menyegarkan fokus &amp; mengurangi kelelahan mental.
        </span>
        <span className="text-[#0284C7] font-semibold">100% Ringan • Bebas Kamera &amp; Suara</span>
      </div>
    </div>
  );
};
