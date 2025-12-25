/**
 * Gender text transformation - fallback for dynamic content
 * Ivrita handles most transformations automatically, but this is used for:
 * - Dynamic text that changes after render (like toggle buttons)
 * - Fallback if Ivrita isn't loaded yet
 */
export async function genderText(text: string, gender?: string | null): Promise<string> {
  if (!gender) {
    return text;
  }

  try {
    // Try to use Ivrita for proper Hebrew gendering
    const IvritaModule = await import('ivrita') as any;
    const Ivrita = IvritaModule.default || IvritaModule;
    
    let ivritaGender;
    if (gender === 'male') {
      ivritaGender = Ivrita.MALE;
    } else if (gender === 'female') {
      ivritaGender = Ivrita.FEMALE;
    } else {
      ivritaGender = Ivrita.NEUTRAL;
    }
    
    return Ivrita.genderize(text, ivritaGender);
  } catch (e) {
    console.error('Ivrita.genderize error:', e);
    // Fallback to simple splitting
    return genderTextFallback(text, gender);
  }
}

/**
 * Synchronous version for immediate use
 */
export function genderTextSync(text: string, gender?: string | null): string {
  if (!gender) {
    return text;
  }
  
  // Check if Ivrita is already loaded in window
  if (typeof window !== 'undefined' && (window as any).Ivrita) {
    try {
      const Ivrita = (window as any).Ivrita;
      let ivritaGender;
      if (gender === 'male') {
        ivritaGender = Ivrita.MALE;
      } else if (gender === 'female') {
        ivritaGender = Ivrita.FEMALE;
      } else {
        ivritaGender = Ivrita.NEUTRAL;
      }
      return Ivrita.genderize(text, ivritaGender);
    } catch (e) {
      console.error('Ivrita.genderize error:', e);
    }
  }
  
  return genderTextFallback(text, gender);
}

/**
 * Fallback: Simple "/" splitting
 */
function genderTextFallback(text: string, gender: string): string {
  const parts = text.split('/');
  if (parts.length !== 2) return text;
  
  if (gender === 'male') {
    return parts[0];
  } else if (gender === 'female') {
    return parts[0] + parts[1];
  }
  
  return text;
}
