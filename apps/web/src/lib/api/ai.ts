/**
 * AI API Client
 * Handles AI-powered product image analysis
 */

import { api } from '../api';

export interface ProductAnalysisResult {
  title: string;
  brand: string;
  category: string;
  suggestedPrice: number | null;
  tags: string[];
  description: string;
  confidence: number;
}

export interface AnalyzeImageResponse {
  success: boolean;
  data?: ProductAnalysisResult;
  error?: string;
}

/**
 * Analyze product image using AI
 * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @param mimeType - Optional MIME type
 */
export async function analyzeProductImage(
  imageBase64: string,
  mimeType?: string
): Promise<AnalyzeImageResponse> {
  const response = await api.post<AnalyzeImageResponse>('/ai/analyze-image', {
    image: imageBase64,
    mimeType,
  });
  return response.data;
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
