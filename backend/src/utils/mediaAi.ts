import { env } from '../config/env.js';

export interface ImageUploadResult {
  url: string;
  publicId: string;
  provider: 'cloudinary' | 'local';
}

export async function uploadImageBase64(
  base64Data: string,
  folder = 'dkfitt/dishes',
): Promise<ImageUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const mockUrl = `https://res.cloudinary.com/dev/image/upload/v1/${folder}/mock-${Date.now()}.jpg`;
    return { url: mockUrl, publicId: `${folder}/mock`, provider: 'local' };
  }

  const payload = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const body = new URLSearchParams({
    file: `data:image/jpeg;base64,${payload}`,
    folder,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET ?? 'dkfitt_unsigned',
  });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary error: ${response.status}`);
  }

  const data = (await response.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id, provider: 'cloudinary' };
}

export interface GeneratedRecipe {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Array<{ name: string; quantity: string }>;
  preparation: string;
  tags: string[];
  source: 'gemini' | 'template';
}

export async function generateRecipeWithAi(prompt: string): Promise<GeneratedRecipe> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      name: 'Bowl nutritivo DK-FITT',
      category: 'Almuerzos / Cenas',
      calories: 420,
      protein: 32,
      carbs: 38,
      fat: 14,
      ingredients: [
        { name: 'Pechuga de pollo', quantity: '120g' },
        { name: 'Arroz integral', quantity: '80g' },
        { name: 'Brócoli', quantity: '100g' },
      ],
      preparation:
        'Cocinar el arroz. Asar la pechuga y saltear el brócoli. Servir en bowl y condimentar al gusto.',
      tags: ['Alto en Proteína', 'Balanceado'],
      source: 'template',
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Genera una receta saludable en JSON con campos name, category, calories, protein, carbs, fat, ingredients[{name,quantity}], preparation, tags[]. Prompt: ${prompt}`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{}') as GeneratedRecipe;
    return { ...parsed, source: 'gemini' };
  } catch {
    return {
      name: 'Receta generada',
      category: 'Almuerzos / Cenas',
      calories: 400,
      protein: 25,
      carbs: 35,
      fat: 15,
      ingredients: [{ name: 'Ingrediente mixto', quantity: '1 porción' }],
      preparation: text || 'Preparar y servir.',
      tags: ['IA'],
      source: 'gemini',
    };
  }
}

export function getMediaConfig() {
  return {
    cloudinaryConfigured: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    ),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: env.nodeEnv,
  };
}

export async function analyzeFoodImageWithVision(
  imageBase64: string,
): Promise<import('../types/tracking.js').FoodVisionAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  const payload = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  if (!apiKey) {
    return {
      foodName: 'Ensalada mixta',
      calories: 180,
      protein: 8,
      carbs: 22,
      fat: 6,
      servingEstimate: '1 plato mediano',
      confidence: 'media',
      notes: 'Estimación de plantilla local sin GEMINI_API_KEY',
      source: 'template',
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Analiza la imagen de comida y responde SOLO JSON con: foodName, calories, protein, carbs, fat, servingEstimate, confidence (alta|media|baja), notes.',
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: payload,
                },
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini Vision error: ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] ?? '{}') as Record<string, unknown>;
    return {
      foodName: String(parsed.foodName ?? 'Alimento detectado'),
      calories: Number(parsed.calories ?? 0),
      protein: Number(parsed.protein ?? 0),
      carbs: Number(parsed.carbs ?? 0),
      fat: Number(parsed.fat ?? 0),
      servingEstimate: String(parsed.servingEstimate ?? '1 porción'),
      confidence: ['alta', 'media', 'baja'].includes(String(parsed.confidence))
        ? (String(parsed.confidence) as 'alta' | 'media' | 'baja')
        : 'media',
      notes: String(parsed.notes ?? ''),
      source: 'gemini',
    };
  } catch {
    return {
      foodName: 'Alimento detectado',
      calories: 250,
      protein: 12,
      carbs: 30,
      fat: 8,
      servingEstimate: '1 porción',
      confidence: 'baja',
      notes: text || 'No se pudo parsear la respuesta de Gemini',
      source: 'gemini',
    };
  }
}
