/**
 * Debug utility for eSewa link functionality
 * Add this to your MakeOfferModal to diagnose issues
 */

export const debugEsewaLink = {
  /**
   * Log all request details
   */
  logRequest: (data: any) => {
    console.group('🔍 eSewa Link Request');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request Data:', data);
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Access Token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
    console.groupEnd();
  },

  /**
   * Log response details
   */
  logResponse: (response: any, error: boolean = false) => {
    if (error) {
      console.group('❌ eSewa Link Error');
      console.error('Error:', response);
      console.error('Status:', response?.status);
      console.error('Message:', response?.message);
      console.error('Errors:', response?.errors);
      console.groupEnd();
    } else {
      console.group('✅ eSewa Link Success');
      console.log('Response:', response);
      console.log('Success:', response?.success);
      console.log('Data:', response?.data);
      console.groupEnd();
    }
  },

  /**
   * Test API connectivity
   */
  testConnectivity: async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    
    console.group('🌐 Testing API Connectivity');
    console.log('Base URL:', baseUrl);
    
    try {
      const response = await fetch(`${baseUrl}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      console.log('Status:', response.status);
      console.log('OK:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('User Data:', data);
        console.log('✅ API is reachable');
      } else {
        console.error('❌ API returned error:', response.status);
      }
    } catch (error) {
      console.error('❌ Cannot reach API:', error);
    }
    
    console.groupEnd();
  },

  /**
   * Validate form data
   */
  validateData: (fullName: string, mobileNumber: string) => {
    console.group('✔️ Validating Form Data');
    
    const issues = [];
    
    if (!fullName || fullName.trim().length === 0) {
      issues.push('Full name is empty');
    }
    
    if (mobileNumber && mobileNumber.length > 0 && mobileNumber.length !== 10) {
      issues.push('Mobile number should be 10 digits');
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Validation Issues:', issues);
    } else {
      console.log('✅ All validations passed');
    }
    
    console.log('Full Name:', fullName);
    console.log('Mobile Number:', mobileNumber || '(not provided)');
    console.groupEnd();
    
    return issues.length === 0;
  }
};

// Export for use in components
export default debugEsewaLink;
