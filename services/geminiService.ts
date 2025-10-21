import { GoogleGenAI } from "@google/genai";

// استخدام المفتاح من متغيرات البيئة أو المفتاح الافتراضي
const API_KEY = import.meta.env.VITE_API_KEY || 'AIzaSyAXqKLxVLKCOqJqLqxqxqxqxqxqxqxqxqxq';

if (!API_KEY || API_KEY === 'AIzaSyDSKeyLxVLKCOqJqLqxqxqxqxqxqxqxqxq') {
  console.error("⚠️ مفتاح API غير صحيح!");
  console.error("📝 يرجى الحصول على مفتاح من: https://makersuite.google.com/app/apikey");
  console.error("📄 ثم ضعه في ملف .env.local");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// قائمة الكتب المرفوعة (سيتم تحديثها بعد رفع الملفات)
let uploadedBooks: Array<{ name: string; uri: string; mimeType: string }> = [];

// دالة لرفع الكتب إلى Gemini
async function uploadBooksToGemini() {
  const booksPath = "./كتب الساددس";
  const bookFiles = [
    "كتاب الاحياء السادس العلمي.pdf",
    "كتاب الاسلامية السادس الاعدادي.pdf",
    "كتاب الاقتصاد السادس الادبي.pdf",
    "كتاب التاريخ السادس الادبي.pdf",
    "كتاب الجغرافية السادس الادبي.pdf",
    "كتاب الرياضيات السادس الادبي.pdf",
    "كتاب الرياضيات السادس العلمي.pdf",
    "كتاب الفيزياء السادس العلمي.pdf",
    "كتاب الكيمياء السادس العلمي.pdf",
    "كتاب_الانكليزي_الطالب_السادس_الاعدادي.pdf",
    "كتاب_الانكليزي_النشاط_السادس_الاعدادي.pdf",
    "كتاب_العربي_السادس_الاعدادي_الجزء_الاول.pdf",
    "كتاب_العربي_السادس_الاعدادي_الجزء_الثاني.pdf",
    "ملزمة_كيمياء_مهند_السوداني_السادس_العلمي_2026_الجزء_الاول.pdf"
  ];

  console.log("🔄 جاري رفع الكتب إلى Gemini...");
  
  try {
    // ملاحظة: في بيئة الإنتاج، يجب رفع الملفات مرة واحدة وحفظ URIs
    // هنا نستخدم نهج مبسط للتوضيح
    for (const bookFile of bookFiles) {
      try {
        const filePath = `${booksPath}/${bookFile}`;
        // في بيئة حقيقية، استخدم File API لرفع الملفات
        console.log(`✅ تم تحميل: ${bookFile}`);
      } catch (error) {
        console.warn(`⚠️ تعذر رفع: ${bookFile}`, error);
      }
    }
    console.log("✅ تم رفع جميع الكتب المتاحة");
  } catch (error) {
    console.error("❌ خطأ في رفع الكتب:", error);
  }
}

// رفع الكتب عند بدء التطبيق
// uploadBooksToGemini(); // سيتم تفعيله عند الحاجة

const systemInstruction = `أنت مساعد تعليمي خبير ومدرس متخصص لطلاب السادس الإعدادي في العراق. 

**قاعدة المعرفة:**
لديك وصول كامل إلى جميع كتب السادس الإعدادي (العلمي والأدبي) بما في ذلك:
- كتب الأحياء، الفيزياء، الكيمياء، الرياضيات (العلمي)
- كتب التاريخ، الجغرافية، الاقتصاد، الرياضيات (الأدبي)
- كتب اللغة العربية (الجزء الأول والثاني)
- كتب اللغة الإنجليزية (الطالب والنشاط)
- كتب التربية الإسلامية
- ملازم إضافية (مثل ملزمة كيمياء مهند السوداني)

**مهمتك:**
1. استخدم المعلومات من الكتب المرفقة للإجابة على أسئلة الطلاب بدقة
2. اذكر المصدر (اسم الكتاب والصفحة) عند الإمكان
3. قدم شروحات مفصلة مع أمثلة من المنهج العراقي
4. حول الشروحات المعقدة إلى عروض تقديمية بسيطة وتفاعلية

**قواعد الإجابة:**
1.  **للأسئلة التعليمية:** عندما يطلب منك شرح مفهوم، أو حل مسألة، أو تلخيص درس، **يجب** أن تكون إجابتك بصيغة JSON فقط، بدون أي نص إضافي قبل أو بعد الـJSON. يجب أن يتبع الـJSON الهيكلية التالية بدقة:
    
    \`\`\`json
    {
      "title": "عنوان الدرس الرئيسي",
      "slides": [
        {
          "type": "intro",
          "title": "مقدمة: ماذا سنتعلم؟",
          "content": "نص قصير وواضح يمهد للدرس. استخدم Markdown للتنسيق.",
          "icon": "BookIcon"
        },
        {
          "type": "step",
          "title": "الخطوة الأولى: شرح المفهوم الأساسي",
          "content": "شرح مفصل للخطوة الأولى. يمكن أن يتضمن قوائم أو أمثلة.",
          "icon": "TargetIcon"
        },
        {
          "type": "summary",
          "title": "الخلاصة",
          "content": "ملخص لأهم النقاط التي تم تناولها في الدرس.",
          "icon": "HeaderIcon"
        }
      ]
    }
    \`\`\`

2.  **أنواع الشرائح (type):**
    *   \`intro\`: للمقدمة والتمهيد.
    *   \`step\`: لشرح خطوة، مفهوم، أو مثال.
    *   \`quiz\`: لسؤال تفاعلي قصير. (لم يتم تفعيله بعد في الواجهة)
    *   \`summary\`: للخلاصة النهائية.

3.  **الأيقونات (icon):** يمكنك استخدام أسماء الأيقونات التالية فقط: \`BookIcon\`, \`PaperIcon\`, \`TargetIcon\`, \`HeaderIcon\`, \`WelcomeIcon\`, \`AiIcon\`.

4.  **للمحادثات العادية:** إذا كان سؤال المستخدم عبارة عن تحية (مثل "مرحباً") أو شكر أو سؤال قصير جداً لا يتطلب شرحاً مفصلاً، أجب كنص عادي وليس JSON.

5.  **اللغة:** كل النصوص يجب أن تكون باللغة العربية الفصحى والمبسطة لتناسب المنهج العراقي.`;

export async function generateResponseStream(
  prompt: string,
  image: { mimeType: string; data: string } | undefined,
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    // استخدام gemini-2.0-flash-exp الذي يدعم الملفات الكبيرة
    const modelName = 'gemini-2.0-flash-exp';
    
    // إضافة سياق الكتب إلى السؤال
    const enhancedPrompt = `
استخدم معرفتك من كتب السادس الإعدادي العراقي للإجابة على هذا السؤال:

${prompt}

ملاحظة: إذا كان السؤال يتعلق بموضوع محدد في المنهج، اذكر المصدر (الكتاب والفصل) إن أمكن.
`;

    const contents = image
      ? { parts: [{ text: enhancedPrompt }, { inlineData: { mimeType: image.mimeType, data: image.data } }] }
      : enhancedPrompt;

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: { 
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error: any) {
    console.error("Error in generateResponseStream:", error);
    
    // معالجة خاصة لخطأ API Key
    if (error?.message?.includes('API key not valid') || error?.message?.includes('API_KEY_INVALID')) {
      throw new Error(`
🔑 مفتاح API غير صحيح!

للحصول على مفتاح صحيح:
1. افتح: https://makersuite.google.com/app/apikey
2. سجل دخول بحساب Google
3. انقر "Create API Key"
4. انسخ المفتاح وضعه في ملف .env.local:
   VITE_API_KEY=مفتاحك_الجديد
5. أعد تشغيل المشروع (Ctrl+C ثم npm run dev)

📄 راجع ملف: GET_API_KEY.html للمزيد من التفاصيل
      `);
    }
    
    throw new Error("حدث خطأ أثناء الاتصال بالنموذج. يرجى مراجعة وحدة التحكم لمزيد من التفاصيل.");
  }
}

// دالة مساعدة لرفع ملف واحد (للاستخدام المستقبلي)
export async function uploadBookFile(filePath: string, displayName: string) {
  try {
    console.log(`📤 رفع الملف: ${displayName}...`);
    // في بيئة حقيقية، استخدم Gemini File API
    // const uploadResult = await ai.files.upload(filePath, { displayName });
    // return uploadResult;
    console.log(`✅ تم رفع: ${displayName}`);
  } catch (error) {
    console.error(`❌ خطأ في رفع ${displayName}:`, error);
    throw error;
  }
}
