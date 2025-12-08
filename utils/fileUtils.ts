import type { GenerativePart } from "../types";

/**
 * Converts a File object to a GenerativePart object.
 * @param file The file to convert.
 * @returns A promise that resolves to the GenerativePart object.
 */
export async function fileToGenerativePart(file: File): Promise<GenerativePart> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            // Fallback for ArrayBuffer case, though readAsDataURL should give a string
            resolve('');
        }
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}
