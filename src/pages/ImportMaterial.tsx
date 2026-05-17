import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2, Brain } from 'lucide-react';
import { extractTextFromPDF } from '../lib/pdfUtils';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { translations, TranslationKey } from '../translations';

export function ImportMaterial() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "reading_pdf" | "extracting_ai" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const addWords = useStore((state) => state.addWords);
  const navigate = useNavigate();
  const { language } = useStore();
  const t = (key: TranslationKey) => translations[language][key];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'application/pdf' && !selectedFile.type.startsWith('image/')) {
      setErrorMsg(language === 'ar' ? "يرجى اختيار ملف PDF أو صورة صالحة." : "Please select a valid PDF or Image file.");
      return;
    }
    
    setFile(selectedFile);
    setErrorMsg("");
    
    try {
      let requestBody: any = {};
      
      if (selectedFile.type === 'application/pdf') {
        setStatus("reading_pdf");
        const extractedText = await extractTextFromPDF(selectedFile);
        if (!extractedText.trim()) {
          throw new Error(language === 'ar' ? "لم يتم العثور على نص يمكن قراءته في هذا الملف." : "No readable text found in this PDF.");
        }
        requestBody = { text: extractedText };
      } else {
        setStatus("reading_pdf"); // Reuse status or could make a "reading_image"
        // It's an image
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Get just the base64 part
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        
        requestBody = { 
          image: base64,
          mimeType: selectedFile.type 
        };
      }

      setStatus("extracting_ai");

      // 2. Call backend API for Gemini Extraction
      const response = await fetch('/api/extract-vocab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(language === 'ar' ? "فشل استخراج الكلمات باستخدام الذكاء الاصطناعي." : "Failed to extract vocabulary using AI.");
      }

      const data = await response.json();
      if (data.words && Array.isArray(data.words) && data.words.length > 0) {
        addWords(data.words);
        setStatus("success");
      } else {
        throw new Error(language === 'ar' ? "لم يتم العثور على كلمات صعبة لاستخراجها." : "No difficult words found to extract.");
      }

    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || (language === 'ar' ? "حدث خطأ غير معروف." : "An unknown error occurred during import."));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('import_material')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          {t('import_desc')}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center relative transition-colors hover:border-indigo-500 dark:hover:border-indigo-400">
        <input 
          type="file" 
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          disabled={status === "reading_pdf" || status === "extracting_ai"}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="pdf-upload"
        />
        
        {status === "idle" || status === "error" ? (
          <>
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 pointer-events-none">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('click_drag')}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              {t('supports_msg')}
            </p>
            
            {status === "error" && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">
                {errorMsg}
              </div>
            )}
          </>
        ) : status === "reading_pdf" ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('reading_file')}</p>
          </div>
        ) : status === "extracting_ai" ? (
          <div className="flex flex-col items-center space-y-4">
             <div className="relative">
               <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
               <Brain className="w-5 h-5 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{t('ai_extracting')}</p>
            <p className="text-sm text-gray-500">{t('take_seconds')}</p>
          </div>
        ) : status === "success" ? (
          <div className="flex flex-col items-center space-y-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('import_success')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('vocab_added')}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/list'); }}
              className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition-colors relative z-10"
            >
              {t('view_words')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
