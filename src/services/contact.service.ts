import { apiClient } from '@/lib/api/client';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  submission_id: string;
}

export const contactService = {
  /**
   * Submit contact form
   */
  submitContactForm: async (data: ContactFormData): Promise<ContactSubmissionResponse> => {
    const response = await apiClient.post<ContactSubmissionResponse>('/contact/', data);
    return response.data;
  },
};
