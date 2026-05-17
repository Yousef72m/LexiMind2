import React from 'react';
import { useStore } from '../store/useStore';
import { Brain, FileText, CheckCircle2, TrendingUp, Presentation, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations, TranslationKey } from '../translations';

export function Dashboard() {
  const { words, stats, checkStreak, language } = useStore();
  const t = (key: TranslationKey) => translations[language][key];
  
  React.useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  const masteredCount = words.filter(w => w.status === 'Mastered').length;
  const learningCount = words.filter(w => w.status === 'Learning' || w.status === 'Reviewing').length;
  const toReviewCount = words.filter(w => w.nextReview <= Date.now()).length;
  
  const recentWords = words.slice(-5).reverse();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header section */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t('welcome_back')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          {t('review_msg').replace('{count}', toReviewCount.toString()).replace('{streak}', stats.streak.toString())}
        </p>
      </header>

      {/* Quick Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title={t('total_words')} value={words.length} icon={FileText} color="bg-blue-500" />
        <StatCard title={t('mastered')} value={masteredCount} icon={CheckCircle2} color="bg-green-500" />
        <StatCard title={t('learning')} value={learningCount} icon={TrendingUp} color="bg-yellow-500" />
        <StatCard title={t('xp_earned')} value={stats.xp} icon={Brain} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Action Banner */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between overflow-hidden relative group">
            <div className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} -m-8 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500`} />
            
            <div className="relative z-10">
              <Presentation className="w-12 h-12 text-indigo-200 mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('ready_session')}</h2>
              <p className="text-indigo-200 text-lg mb-8 max-w-md">
                {t('focus_msg')}
              </p>
              
              <Link 
                to="/study" 
                className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-white text-indigo-900 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors"
              >
                <span>{t('start_reviewing')}</span>
                <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Words List */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">{t('recently_added')}</h3>
            <Link to="/list" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
              {t('view_all')}
            </Link>
          </div>
          
          {recentWords.length > 0 ? (
            <div className="space-y-4">
              {recentWords.map(w => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100" dir="ltr">{w.word}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{w.meaning}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                    w.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    w.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {w.difficulty === 'Easy' ? t('easy') : w.difficulty === 'Medium' ? t('medium') : t('hard')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>{t('no_words')}</p>
              <Link to="/import" className="text-indigo-600 hover:underline mt-2 inline-block">{t('import_material')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center space-x-4 rtl:space-x-reverse">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}
