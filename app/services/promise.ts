import type { AxiosResponse } from 'axios';
import { apiClient } from './axiosInstance';

export interface PromiseItem {
  verse: string;
  reference: string;
}

export interface PrayerResponse {
  promise: PromiseItem[];
  prayer: string;
}

export interface PromiseAIRequest {
  query: string;
  lang?: string;
}

/**
 * Fetch promise and prayer data from AI service
 */
export const getPromiseAndPrayerFromAI = async (
  params: PromiseAIRequest
): Promise<AxiosResponse<PrayerResponse>> => {
  try {
    const response = await apiClient.post<PrayerResponse>('ai-data', {
      query: params.query,
      lang: params.lang || 'en',
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch promise and prayer data:', error);
    throw error;
  }
};






/**
 * Save user reaction to a promise or prayer
 */
export const saveReaction = async (
  reactionData: {
    response_type: string;
    user_id: string;
    response: string | PromiseItem;
    reaction: string;
  }
): Promise<AxiosResponse<any>> => {
  try {
    const response = await apiClient.post('interaction', {
      response_type: reactionData.response_type,
      response: reactionData.response,
      reaction: reactionData.reaction,
    });
    return response;
  } catch (error) {
    console.error('Failed to save reaction:', error);
    throw error;
  }
};
