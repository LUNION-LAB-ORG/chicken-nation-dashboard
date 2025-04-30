const API_URL = process.env.NEXT_PUBLIC_API_URL;
 
export const formatImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '';
  
  try {
     if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
     if (imageUrl.startsWith('uploads/')) {
      return `${API_URL}/${imageUrl}`;
    }
     
    if (!imageUrl.startsWith('/')) {
      return '/' + imageUrl;
    }
    
    return imageUrl;
  } catch (error) {
    console.error('URL d\'image invalide:', imageUrl, error);
    return '';
  }
};

export const base64ToFile = async (base64Image: string, fileName: string = 'image.jpg'): Promise<File> => {
  try {
    const response = await fetch(base64Image);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('Erreur lors de la conversion de l\'image base64 en fichier:', error);
    throw error;
  }
};
 
export const addImageToFormData = async (
  formData: FormData, 
  image: File | string | null,
  fieldName: string = 'image'
): Promise<FormData> => {
  if (!image) return formData;
  
   if (image instanceof File) {
    formData.append(fieldName, image);
    return formData;
  }
  
   if (typeof image === 'string' && image.startsWith('data:')) {
    try {
      const file = await base64ToFile(image);
      formData.append(fieldName, file);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image au FormData:', error);
    }
  } 
   else if (typeof image === 'string') {
    formData.append('image_url', image);
  }
  
  return formData;
};
