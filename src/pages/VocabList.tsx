import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Volume2, Download, Trash2, Filter } from 'lucide-react';
import { WordCard } from '../types';
import { translations, TranslationKey } from '../translations';

export function VocabList() {
  const { words, language } = useStore();
  const t = (key: TranslationKey) => translations[language][key];
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("All");

  const filteredWords = words.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.meaning.includes(searchTerm);
    const matchesDifficulty = filterDifficulty === "All" || w.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const exportWords = (onlyHard = false) => {
    const listToExport = onlyHard ? words.filter(w => w.difficulty === 'Hard') : words;
    if (listToExport.length === 0) {
      alert("No words to export.");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Word,Meaning,Explanation,Difficulty\n"
      + listToExport.map(e => `${e.word},${e.meaning},"${e.explanation}",${e.difficulty}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leximind_vocabulary_${onlyHard ? 'hard' : 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('vocab_list_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('manage_search')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => exportWords(true)}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('export_hard')}</span>
          </button>
          <button 
            onClick={() => exportWords(false)}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('export_csv')}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`w-5 h-5 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
          <input 
            type="text" 
            placeholder={t('search_placeholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium`}
          />
        </div>
        <div className="relative">
          <Filter className={`w-5 h-5 absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
          <select 
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className={`appearance-none ${language === 'ar' ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium`}
          >
            <option value="All">{t('all_difficulties')}</option>
            <option value="Easy">{t('easy')}</option>
            <option value="Medium">{t('medium')}</option>
            <option value="Hard">{t('hard')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWords.map((word) => (
          <WordCardItem key={word.id} word={word} onPlayAudio={() => playAudio(word.word)} t={t} language={language} />
        ))}
        {filteredWords.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500">
            {t('no_words_found')}
          </div>
        )}
      </div>
    </div>
  );
}

function WordCardItem({ word, onPlayAudio, t, language }: { word: WordCard, onPlayAudio: () => void, t: any, language: string, key?: React.Key }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 rtl:space-x-reverse selectable-text" dir="ltr">
            <span>{word.word}</span>
            <button 
              onClick={onPlayAudio}
              className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </h3>
          <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mt-1 selectable-text" dir="rtl">{word.meaning}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-md font-medium shrink-0 ${
          word.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          word.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {word.difficulty === 'Easy' ? t('easy') : word.difficulty === 'Medium' ? t('medium') : t('hard')}
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 selectable-text" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {language === 'ar' && word.explanationAr ? word.explanationAr : word.explanation}
        </p>
        <p className="text-sm italic text-gray-500 border-l-2 rtl:border-l-0 rtl:border-r-2 border-indigo-200 dark:border-indigo-900 pl-3 rtl:pl-0 rtl:pr-3 selectable-text" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          "{language === 'ar' && word.exampleAr ? word.exampleAr : word.example}"
        </p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-500 font-medium">
        <span>{t('status')}: {word.status === 'Learning' ? t('learning') : word.status === 'Mastered' ? t('mastered') : t('learning')}</span>
        <span>{t('rev')}: {new Date(word.nextReview).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
