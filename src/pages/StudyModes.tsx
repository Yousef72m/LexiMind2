import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { WordCard } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ChevronRight, Check, X, ThumbsUp, Trophy } from 'lucide-react';
import { translations, TranslationKey } from '../translations';

export function StudyModes() {
  const { words, updateWordProgress, addXP, language } = useStore();
  const t = (key: TranslationKey) => translations[language][key];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [cardsStudied, setCardsStudied] = useState(0);

  // Stabilize the review queue using a fixed state for the duration of the session
  const [reviewQueue, setReviewQueue] = useState<WordCard[]>(() => 
    words.filter(w => w.status === 'Learning' || w.nextReview <= Date.now())
  );

  if (reviewQueue.length === 0 && !sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4">{t('caught_up')}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md">
          {t('no_cards_msg')}
        </p>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in">
        <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">{t('session_complete')}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
          {t('session_stats').replace('{cards}', cardsStudied.toString()).replace('{xp}', (cardsStudied * 10).toString())}
        </p>
        <button 
          onClick={() => { 
            setSessionCompleted(false); 
            setCurrentIndex(0); 
            setCardsStudied(0); 
            setReviewQueue(words.filter(w => w.status === 'Learning' || w.nextReview <= Date.now()));
          }}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105"
        >
          {t('review_again')}
        </button>
      </div>
    );
  }

  const currentCard = reviewQueue[currentIndex];

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleScore = (quality: number) => {
    updateWordProgress(currentCard.id, quality);
    setIsFlipped(false);
    setCardsStudied(prev => prev + 1);
    addXP(10); // Reward active study

    if (currentIndex + 1 < reviewQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 flex flex-col h-[70vh]">
      <div className="flex justify-between items-center mb-8 px-4 rtl:flex-row-reverse">
        <h1 className="text-2xl font-bold">{t('daily_review')}</h1>
        <span className="font-medium text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-1 rounded-full text-center" dir="ltr">
          {currentIndex + 1} / {reviewQueue.length}
        </span>
      </div>

      <div className="flex-1 relative" style={{ perspective: 1000 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (isFlipped ? '-flipped' : '')}
            initial={{ opacity: 0, rotateX: isFlipped ? -90 : 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: isFlipped ? 90 : -90 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 w-full h-full cursor-pointer bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 p-6 md:p-12 flex flex-col justify-center items-center text-center`}
            style={{ backfaceVisibility: 'hidden' }}
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            {!isFlipped ? (
               // Front
              <div className="space-y-6 flex flex-col items-center">
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{t('word')}</span>
                <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight" dir="ltr">
                  {currentCard.word}
                </h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); playAudio(currentCard.word); }}
                  className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-indigo-600 dark:text-indigo-400 shadow-sm"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-8 h-8" />
                </button>
                <div className="mt-12 text-gray-400 font-medium">{t('click_flip')}</div>
              </div>
            ) : (
              // Back
              <div className="w-full h-full flex flex-col overflow-y-auto overflow-x-hidden no-scrollbar pb-4 pt-10 px-2 md:px-0 md:pt-0">
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); playAudio(currentCard.word); }}
                      className={`absolute -top-12 md:-top-4 ${language === 'ar' ? '-left-2 md:-left-4' : '-right-2 md:-right-4'} p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-indigo-600 dark:text-indigo-400`}
                      title="Listen again"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <span className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">{t('meaning')}</span>
                    <h3 className={`text-2xl md:text-3xl font-bold text-gray-900 dark:text-white selectable-text`} dir="rtl">{currentCard.meaning}</h3>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />
                  <div>
                    <span className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">{t('explanation')}</span>
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 selectable-text" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' && currentCard.explanationAr ? currentCard.explanationAr : currentCard.explanation}
                    </p>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />
                  <div>
                    <span className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">{t('example')}</span>
                    <p className="text-base md:text-lg italic text-gray-600 dark:text-gray-400 selectable-text" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      "{language === 'ar' && currentCard.exampleAr ? currentCard.exampleAr : currentCard.example}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className={`mt-8 md:mt-12 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => handleScore(1)} className="py-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-2xl font-bold flex flex-col items-center justify-center transition-colors">
            <X className="w-6 h-6 mb-1" />
            <span className="text-sm">{t('hard')}</span>
          </button>
          <button onClick={() => handleScore(3)} className="py-4 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded-2xl font-bold flex flex-col items-center justify-center transition-colors">
            <Check className="w-6 h-6 mb-1" />
            <span className="text-sm">{t('good')}</span>
          </button>
          <button onClick={() => handleScore(5)} className="py-4 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-2xl font-bold flex flex-col items-center justify-center transition-colors">
            <ThumbsUp className="w-6 h-6 mb-1" />
            <span className="text-sm">{t('easy')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
