import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PSY_VIBE_SYSTEM_INSTRUCTION = `
SYSTEM INSTRUCTION: PSY-VIBE AI CORE ENGINE (EXACT MATCH WITH LANDING PAGE UI)
====================================================================================================
[ROLE & SYSTEM IDENTITY]
You are "VibeBot Empathy AI", the primary AI Core Engine powering "PSY-VIBE" (Youth Sanctuary - Ruang Aman Curhat AI & Skrining Emosi Tanpa Stigma).
- Platform Context: Web-based multimodal screening platform with upcoming Android & iOS Mobile App (Color Theme: Pure White #FFFFFF, Light Ice Blue #F0F9FF, & Soft Sky Blue #38BDF8).
- Persona: Warm, empathetic, active listener, supportive, calm, and non-judgmental.
- Tagline & Promise: "Bicara bebas di web tanpa rasa takut dihakimi. AI multimodal membaca mikro-ekspresi wajah dan intonasi nada suaramu secara objektif, aman, dan 100% terjaga kerahasiannya."
- Security & Privacy: 100% Rahasia & Anonim, Skrining Cepat 3 Menit, End-to-End (E2E) Terenkripsi.
- Language: Natural Indonesian youth register (santai, ramah, peduli, tanpa istilah kaku/formalitas berlebihan). Never sound robotic or judgmental.

[MULTIMODAL DUAL-SENSING INPUT MODALITIES]
During the user's web/app curhat session, you process continuous real-time background telemetry from two primary sensing modalities:
1. KAMERA WEB (MICRO-EXPRESSION VIA FACS):
   - Menganalisis ketegangan wajah, kerutan dahi, dan pola senyum palsu (smiling depression) via FACS (Facial Action Coding System) secara real-time.
   - Parameters: Micro-Tension Index, Eye-Blink Rhythm Rate, Mimik Wajah.
2. MIKROFON WEB (VOICE PROSODY & NLP):
   - Menganalisis nada suara, jeda bicara, intonasi akustik, serta sentimen makna kata saat pengguna bercerita tanpa ada penilaian menghakimi.
   - Parameters: Pitch Cadence Dynamics, Acoustic Stress Biomarker, Contextual Sentiment NLP.

[5 FITUR UNGGULAN PLATFORM WEB INTEGRATION]
Align guidance with:
1. SKRINING DUAL-SENSING: Deteksi dini kelelahan emosional dan stres lewat web browser.
2. TEMAN CURHAT AI 24/7 (VibeBot): Asisten empatik selalu siap mendengarkan.
3. KONSULTASI GURU BK & PSIKOLOG: Menghubungkan ke konselor BK sekolah atau psikolog mitra secara aman.
4. JURNAL MOOD HARIAN: Memantau grafik emosi harian disertai refleksi pintar & afirmasi.
5. DIREKTORI PSIKOLOG & RS TERDEKAT (GPS ENABLED): Menemukan faskes mental, puskesmas ramah remaja terdekat.

[DECISION FUSION & PROCESSING RULES]
1. EMPATHETIC FIRST RESPONSE: Always validate the user's emotions in warm Indonesian.
2. DETECT SMILING DEPRESSION (MISMATCH):
   - If user types/says "Aku biasa aja" or "Gak apa-apa kok" or tries to act strong, BUT Camera Sensing shows high tension (>40%) OR Voice Sensing shows low monotone pitch:
   - Gently address it: "Muka dan suaramu keliatan capek banget padahal... Kamu nggak harus selalu keliatan kuat di depanku kok. Cerita aja pelan-pelan ya."
3. SPECTRUM MAPPING & FEATURE ROUTING:
   - NORMAL / STABLE: Provide positive affirmation and guide them to use "Jurnal Mood Harian".
   - AT-RISK / RENTAN: Provide deep active listening and suggest light relaxation/reflection.
   - DEPRESSIVE INDICATORS: Provide deep comfort and offer to connect them with "Guru BK Sekolah" or direct them to "Direktori Psikolog & RS Terdekat".
4. CRISIS SAFEGUARD (24/7 EMERGENCY):
   - If severe depression or self-harm keywords are detected, immediately present a crisis intervention message:
   "Butuh Bantuan Krisis Cepat? Hubungi Hotline Sejiwa Kemenkes 119 (Bebas Pulsa 24 Jam). Kamu berharga dan kamu tidak sendirian."
`;

// Helper for fallback empathetic replies
function generateLocalEmpatheticResponse(
  message: string,
  telemetry: any
): { reply: string; smilingDepressionDetected: boolean; crisisDetected: boolean; suggestedFeature?: string } {
  const lower = message.trim().toLowerCase();
  
  // 1. Crisis check (highest priority)
  if (
    lower.includes('bunuh diri') ||
    lower.includes('akhiri hidup') ||
    lower.includes('mati aja') ||
    lower.includes('self harm') ||
    lower.includes('nyakitin diri') ||
    lower.includes('gak ada gunanya hidup') ||
    lower.includes('pengen mati')
  ) {
    return {
      reply: `Aku bener-bener peduli sama keselamatanmu dan aku di sini mendengarkanmu. Tapi saat perasaan ini terasa sangat berat untuk kamu tanggung sendirian, tolong izinkan tenaga profesional membantumu ya.\n\n🚨 Butuh Bantuan Krisis Cepat? Hubungi Hotline Sejiwa Kemenkes 119 (Bebas Pulsa 24 Jam) atau IGD Rumah Sakit terdekat. Kamu sangat berharga dan kamu tidak sendirian. Mau aku temani atur napas perlahan dulu?`,
      smilingDepressionDetected: false,
      crisisDetected: true,
      suggestedFeature: 'hotline',
    };
  }

  // 2. Greetings & Salutations (Halo, Hai, Assalamualaikum, Tes, P, Selamat Pagi/Malam)
  const isGreeting =
    lower === 'halo' ||
    lower === 'hai' ||
    lower === 'halo bot' ||
    lower === 'hai bot' ||
    lower === 'p' ||
    lower === 'tes' ||
    lower === 'test' ||
    lower === 'hey' ||
    lower === 'helo' ||
    lower.startsWith('halo ') ||
    lower.startsWith('hai ') ||
    lower.includes('assalamualaikum') ||
    lower.includes('selamat pagi') ||
    lower.includes('selamat siang') ||
    lower.includes('selamat sore') ||
    lower.includes('selamat malam');

  if (isGreeting) {
    return {
      reply: `Hai! Senang banget kamu mampir ke ruang aman PSY-VIBE 😊\n\nGimana perasaan dan harimu sejauh ini? Ada hal yang lagi ngeganjel di pikiran atau bikin hatimu berat hari ini? Cerita aja pelan-pelan, aku di sini siap mendengarkan sepenuhnya tanpa menghakimi apapun.`,
      smilingDepressionDetected: false,
      crisisDetected: false,
      suggestedFeature: 'jurnal',
    };
  }

  // 3. User expresses intent to share / curhat
  if (
    lower === 'aku mau cerita' ||
    lower === 'mau curhat' ||
    lower === 'cerita dong' ||
    lower === 'bisa dengerin aku cerita' ||
    lower.includes('mau curhat dong') ||
    lower.includes('dengerin aku ya')
  ) {
    return {
      reply: `Tentu, aku siap mendengarkan dengan sepenuh hati. Di sini ruang aman dan 100% rahasia untukmu. Ceritain apa aja dari bagian mana pun yang paling nyaman buat kamu mulai ya. Apa yang lagi terjadi?`,
      smilingDepressionDetected: false,
      crisisDetected: false,
      suggestedFeature: 'jurnal',
    };
  }

  // 4. Smiling Depression mismatch check
  const isDenyingTired =
    lower.includes('biasa aja') ||
    lower.includes('gapapa') ||
    lower.includes('gak apa-apa') ||
    lower.includes('baik-baik aja') ||
    lower.includes('santai aja') ||
    lower.includes('ga masalah') ||
    lower.includes('aman kok');

  const highTension =
    (telemetry?.microTension && telemetry.microTension > 35) ||
    telemetry?.facialExpression?.includes('Cemas') ||
    telemetry?.facialExpression?.includes('Lelah') ||
    telemetry?.facialExpression?.includes('Pura-pura');

  if (isDenyingTired && highTension) {
    return {
      reply: `Kamu bilang baik-baik aja, tapi sensor wajah dan nada suaramu menunjukkan ada ketegangan yang kamu tahan... Kamu nggak harus selalu terlihat kuat di depanku kok. Di ruang aman ini, kamu bebas melepas rasa lelahmu tanpa takut dinilai. Cerita aja pelan-pelan ya, apa yang sebenarnya paling membebani pikiranmu belakangan ini?`,
      smilingDepressionDetected: true,
      crisisDetected: false,
      suggestedFeature: 'guru-bk',
    };
  }

  // 5. Romance / Heartbreak / Relationships
  if (
    lower.includes('putus') ||
    lower.includes('pacar') ||
    lower.includes('gebetan') ||
    lower.includes('patah hati') ||
    lower.includes('diselingkuhi') ||
    lower.includes('ditinggalin') ||
    lower.includes('ghosting') ||
    lower.includes('cinta')
  ) {
    return {
      reply: `Patah hati atau kecewa dalam hubungan itu rasanya sakit dan campur aduk banget ya... Rasanya wajar banget kalau kamu ngerasa sedih, kecewa, atau bahkan hampa saat ini.\n\nJangan memaksakan diri untuk langsung cepat pulih. Izinkan dirimu merasakan emosi itu dulu. Mau ceritain apa yang paling bikin kamu kepikiran dari kejadian kemarin?`,
      smilingDepressionDetected: Boolean(highTension),
      crisisDetected: false,
      suggestedFeature: 'jurnal',
    };
  }

  // 6. School, Study, Exams & Teacher / Academic pressure
  if (
    lower.includes('tugas') ||
    lower.includes('sekolah') ||
    lower.includes('ujian') ||
    lower.includes('ulangan') ||
    lower.includes('nilai') ||
    lower.includes('pr') ||
    lower.includes('guru') ||
    lower.includes('kuliah') ||
    lower.includes('snbt') ||
    lower.includes('jurusan')
  ) {
    return {
      reply: `Beban tugas, ujian, dan target nilai di sekolah emang sering banget bikin kewalahan dan cemas ya... Rasanya kayak waktu dan energimu nggak pernah cukup untuk ngejar semua ekspektasi.\n\nIngat, nilaimu tidak mendefinisikan seluruh harga dirimu. Kamu sudah berusaha luar biasa sejauh ini. Kalau kamu butuh bimbingan strategi belajar atau konsultasi jalur studi, kamu juga bisa jadwalkan Janji Temu dengan Guru BK sekolah lewat platform ini lho. Mau ceritain tugas mana yang paling bikin pusing?`,
      smilingDepressionDetected: Boolean(highTension),
      crisisDetected: false,
      suggestedFeature: 'guru-bk',
    };
  }

  // 7. Friendship, Social Anxiety, Bullying & Loneliness
  if (
    lower.includes('teman') ||
    lower.includes('sahabat') ||
    lower.includes('dijauhin') ||
    lower.includes('bully') ||
    lower.includes('dibully') ||
    lower.includes('gosip') ||
    lower.includes('kesepian') ||
    lower.includes('sendiri') ||
    lower.includes('ga punya temen')
  ) {
    return {
      reply: `Merasa terasing atau diperlakukan tidak adil oleh lingkungan pertemanan itu salah satu hal yang paling menyakitkan dan menguras energi mental...\n\nKamu berhak berada di lingkungan yang menghargai dan memperlakukanmu dengan baik. Jangan tanggung perasaan ini sendirian ya. Mau ceritakan apa yang terjadi di sekolah atau lingkaran pertemananmu? Aku di sini mendengarkan.`,
      smilingDepressionDetected: false,
      crisisDetected: false,
      suggestedFeature: 'guru-bk',
    };
  }

  // 8. Family / Parental pressure & expectations
  if (
    lower.includes('orang tua') ||
    lower.includes('ortu') ||
    lower.includes('mama') ||
    lower.includes('papa') ||
    lower.includes('ayah') ||
    lower.includes('ibu') ||
    lower.includes('keluarga') ||
    lower.includes('dituntut') ||
    lower.includes('dibandingkan') ||
    lower.includes('dibandingin')
  ) {
    return {
      reply: `Dibanding-bandingkan atau dituntut memenuhi ekspektasi keluarga yang tinggi pasti bikin hati rasanya sesak dan serba salah ya...\n\nPerasaan lelah dan kecewa yang kamu rasakan itu sangat valid. Kamu adalah individu yang berharga dengan kemampuan dan jalanmu sendiri. Mau ceritain lebih lanjut apa yang orang tuamu sampaikan yang bikin hatimu terluka?`,
      smilingDepressionDetected: Boolean(highTension),
      crisisDetected: false,
      suggestedFeature: 'konselor',
    };
  }

  // 9. Burnout, Exhaustion, Sleep deprivation & Anxiety
  if (
    lower.includes('capek') ||
    lower.includes('lelah') ||
    lower.includes('burnout') ||
    lower.includes('cemas') ||
    lower.includes('takut') ||
    lower.includes('nangis') ||
    lower.includes('pusing') ||
    lower.includes('insomnia') ||
    lower.includes('sulit tidur')
  ) {
    return {
      reply: `Pasti berat banget rasanya saat tubuh dan pikiranmu terus dipaksa berjalan padahal energimu udah benar-benar terkuras habis...\n\nTerima kasih ya sudah bertahan sampai hari ini. Nggak apa-apa kalau hari ini kamu merasa lelah dan butuh jeda. Tarik napas dalam-dalam, hembuskan perlahan. Mau ceritain apa yang paling menguras energimu belakangan ini?`,
      smilingDepressionDetected: Boolean(highTension),
      crisisDetected: false,
      suggestedFeature: 'jurnal',
    };
  }

  // 10. Default warm empathetic response
  return {
    reply: `Terima kasih ya sudah mau berbagi apa yang kamu rasakan ke aku di sini. Setiap cerita dan perasaan yang kamu ungkapkan itu berharga dan valid.\n\nAku di sini mendengarkan dengan penuh perhatian. Kalau kamu merasa nyaman, boleh ceritakan lebih detail apa yang paling kamu butuhkan atau rasakan saat ini?`,
    smilingDepressionDetected: false,
    crisisDetected: false,
    suggestedFeature: 'jurnal',
  };
}

// Helper to ensure Gemini calls do not hang indefinitely
function withTimeout<T>(promise: Promise<T>, ms = 4500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), ms)),
  ]);
}

// API Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], telemetry = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Telemetry text representation for Multimodal context
    const telemetryContext = `
[REAL-TIME SENSOR TELEMETRY BACKGROUND]
- Kamera Web (FACS Micro-Expression):
  * Micro-Tension Index: ${telemetry.microTension ?? 14}%
  * Eye-Blink Rhythm Rate: ${telemetry.eyeBlink ?? 72}%
  * Mimik Wajah: ${telemetry.facialExpression ?? 'Tenang'}
- Mikrofon Web (Voice Prosody & NLP):
  * Pitch Cadence Dynamics: ${telemetry.pitchCadence ?? 80}%
  * Acoustic Stress Biomarker: ${telemetry.acousticStress ?? 12}% (0.${telemetry.acousticStress ?? 12})
  * Contextual Sentiment NLP: ${telemetry.vocalTone ?? 'Tenang 88%'}
`;

    // If Gemini is available, call it
    if (ai) {
      try {
        const conversationContents = [
          ...history.map((h: { sender: string; text: string }) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [
              {
                text: `${telemetryContext}\n\n[USER INPUT]:\n"${message}"`,
              },
            ],
          },
        ];

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversationContents,
            config: {
              systemInstruction: PSY_VIBE_SYSTEM_INSTRUCTION,
              temperature: 0.7,
              topP: 0.95,
            },
          }),
          4000
        );

        const replyText = response.text || '';
        const isSmilingDepression =
          replyText.toLowerCase().includes('muka dan suaramu') ||
          replyText.toLowerCase().includes('pura-pura') ||
          (telemetry.microTension > 45 && (message.toLowerCase().includes('biasa aja') || message.toLowerCase().includes('gapapa')));

        const isCrisis =
          message.toLowerCase().includes('bunuh diri') ||
          message.toLowerCase().includes('akhiri hidup') ||
          replyText.toLowerCase().includes('119');

        res.json({
          reply: replyText,
          smilingDepressionDetected: isSmilingDepression,
          crisisDetected: isCrisis,
          telemetry,
        });
        return;
      } catch (geminiError) {
        console.warn('Gemini API call failed or timed out, falling back to local empathy engine:', geminiError);
      }
    }

    // Fallback response generator
    const fallback = generateLocalEmpatheticResponse(message, telemetry);
    res.json({
      reply: fallback.reply,
      smilingDepressionDetected: fallback.smilingDepressionDetected,
      crisisDetected: fallback.crisisDetected,
      suggestedFeature: fallback.suggestedFeature,
      telemetry,
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      reply: 'Maaf ya, koneksiku sempat terputus sebentar. Tapi aku tetep di sini buat kamu kok. Mau ulang ceritanya?',
    });
  }
});

// API Route for Affirmation Generation
app.post('/api/affirmation', async (req, res) => {
  try {
    const { mood = 'tenang', topic = 'belajar' } = req.body;
    if (ai) {
      try {
        const prompt = `Buatkan 1 kalimat afirmasi positif menenangkan dan 1 tips mindful singkat untuk remaja Indonesia yang sedang merasa "${mood}" terkait topik "${topic}". Gunakan bahasa santai, hangat, dan menguatkan hati.`;
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              systemInstruction: 'Kamu adalah VibeBot Empathy AI di platform PSY-VIBE Youth Sanctuary.',
            },
          }),
          3500
        );
        res.json({ affirmation: response.text });
        return;
      } catch (e) {
        console.warn('Affirmation Gemini call failed:', e);
      }
    }

    const defaultAffirmations = [
      'Nggak apa-apa istirahat sejenak. Kamu berharga bukan cuma karena apa yang kamu capai, tapi karena dirimu apa adanya.',
      'Satu langkah kecil hari ini sudah sangat berarti. Tarik napas dalam-dalam, kamu sedang berproses dengan luar biasa.',
      'Kamu berhak merasa lelah, dan kamu nggak harus menyenangkan semua orang sepanjang waktu. Sayangi dirimu dulu hari ini.',
    ];
    res.json({ affirmation: defaultAffirmations[Math.floor(Math.random() * defaultAffirmations.length)] });
  } catch (e) {
    res.json({ affirmation: 'Kamu berharga, kuat, dan tidak sendirian menghadapi hari ini.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`PSY-VIBE Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
