/**
 * API service for FruitSense backend
 */

const API_BASE_URL = 'http://localhost:8000';

export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Analysis failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getAvailableClasses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/classes`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    return false;
  }
};
