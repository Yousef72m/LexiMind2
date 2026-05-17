export type Difficulty = "Easy" | "Medium" | "Hard";
export type Status = "Learning" | "Reviewing" | "Mastered";

export interface WordCard {
  id: string;
  word: string;
  meaning: string;
  explanation: string;
  explanationAr?: string;
  example: string;
  exampleAr?: string;
  difficulty: Difficulty;
  status: Status;
  nextReview: number; // Unix timestamp
  interval: number; // In days
  easeFactor: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string;
}
