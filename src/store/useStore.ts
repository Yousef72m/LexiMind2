import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WordCard, UserStats, Status, Difficulty } from "../types";
import { Language } from "../translations";

interface AppState {
  words: WordCard[];
  stats: UserStats;
  language: Language;
  addWords: (newWords: Omit<WordCard, "id" | "status" | "nextReview" | "interval" | "easeFactor">[]) => void;
  updateWordProgress: (id: string, quality: number) => void;
  addXP: (amount: number) => void;
  checkStreak: () => void;
  setLanguage: (lang: Language) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      words: [],
      stats: {
        xp: 0,
        level: 1,
        streak: 0,
        lastStudyDate: "",
      },
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      addWords: (newWords) => {
        set((state) => {
          const cards: WordCard[] = newWords.map((w) => ({
            ...w,
            id: Math.random().toString(36).substring(7),
            status: "Learning",
            nextReview: Date.now(),
            interval: 0,
            easeFactor: 2.5,
          }));
          return { words: [...state.words, ...cards] };
        });
      },
      updateWordProgress: (id, quality) => {
        // SM-2 algorithm implementation
        set((state) => {
          const updatedWords = state.words.map((w) => {
            if (w.id !== id) return w;
            
            let { interval, easeFactor, status } = w;
            
            if (quality < 3) { // 0, 1, 2 = failed
              interval = 1;
            } else {
              if (interval === 0) interval = 1;
              else if (interval === 1) interval = 6;
              else interval = Math.round(interval * easeFactor);
            }

            easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (easeFactor < 1.3) easeFactor = 1.3;

            return {
              ...w,
              interval,
              easeFactor,
              nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
              status: interval > 10 ? ("Mastered" as Status) : ("Reviewing" as Status),
            };
          });

          return { words: updatedWords };
        });
      },
      addXP: (amount) => {
        set((state) => {
          let newXP = state.stats.xp + amount;
          let newLevel = Math.floor(newXP / 100) + 1;
          return {
            stats: { ...state.stats, xp: newXP, level: newLevel },
          };
        });
      },
      checkStreak: () => {
        const today = new Date().toISOString().split("T")[0];
        set((state) => {
          const lastDate = state.stats.lastStudyDate;
          let newStreak = state.stats.streak;
          
          if (lastDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            if (lastDate === yesterday) {
              newStreak += 1;
            } else {
              newStreak = 1; // Reset streak if missed a day
            }
          }
          
          return {
            stats: { ...state.stats, streak: newStreak, lastStudyDate: today },
          };
        });
      },
    }),
    {
      name: "leximind-storage",
    }
  )
);
