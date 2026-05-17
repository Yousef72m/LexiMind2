import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Home, Upload, List, Trophy, Moon, Sun, Languages } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { translations, TranslationKey } from '../translations';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = React.useState(true);
  const { streak, level } = useStore((state) => state.stats);
  const { language, setLanguage } = useStore();
  
  const t = (key: TranslationKey) => translations[language][key];

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const navItems = [
    { name: t('dashboard'), path: '/', icon: Home },
    { name: t('import_material'), path: '/import', icon: Upload },
    { name: t('study_modes'), path: '/study', icon: BookOpen },
    { name: t('vocab_list'), path: '/list', icon: List },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 shadow-sm z-10 w-full relative pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
         <div className="flex items-center space-x-2 rtl:space-x-reverse">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex justify-center items-center">
                 <BookOpen className="text-white w-4 h-4" />
             </div>
             <span className="text-lg font-bold">LexiMind</span>
         </div>
         <div className="flex items-center space-x-2 rtl:space-x-reverse">
             <button onClick={toggleLanguage} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
             </button>
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                {darkMode ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
             </button>
         </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-col shrink-0 z-10">
        <div className="p-6 flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex justify-center items-center">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">LexiMind</span>
        </div>
        
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className={`flex justify-between items-center mb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm font-medium text-indigo-100">{t('level')} {level}</span>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-bold w-max">{t('streak_day').replace('{streak}', streak.toString())}</span>
              </div>
            </div>
            <div className="w-full bg-indigo-900/50 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 font-medium"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Languages className="w-5 h-5" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </div>
          </button>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 font-medium"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? t('light_mode') : t('dark_mode')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center p-2 rounded-xl text-xs font-medium transition-colors",
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )
            }
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="truncate max-w-[80px]">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
