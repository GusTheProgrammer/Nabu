export function parseWindowTitle(rawTitle: string): { title: string; source: string } {
  if (!rawTitle) return { title: '', source: '' };

  const parts = rawTitle.split(' - ');
  let source = '';
  let title = rawTitle;

  if (parts.length > 1) {
    source = parts[parts.length - 1].trim();

    title = parts
      .slice(0, -1)
      .join(' - ')
      .replace(/\s*and \d+ more pages\s*/i, '')
      .replace(/\s*Personal\s*/i, '')
      .replace(/\s*-\s*$/, '')
      .trim();
  }

  return { title, source };
}

export async function getImageMetadata(base64: string): Promise<{
  width: number;
  height: number;
  sizeKB: number;
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const paddingChars = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
      const sizeInBytes = Math.floor((base64.length * 3) / 4 - paddingChars);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeKB: Math.round(sizeInBytes / 1024),
      });
    };
    img.onerror = () => resolve({ width: 0, height: 0, sizeKB: 0 });
    img.src = `data:image/png;base64,${base64}`;
  });
}

const REGEX = {
  URL: /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i,
  EMAIL:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  COLOR: /^(#([0-9a-f]{3}){1,2}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d.]+%?\))$/i,
};

export function detectSpecialType(text: string): {
  type: 'link' | 'email' | 'color' | 'text';
  value: string;
} {
  const trimmedText = text.trim();
  if (REGEX.URL.test(trimmedText)) {
    return { type: 'link', value: trimmedText };
  }
  if (REGEX.EMAIL.test(trimmedText)) {
    return { type: 'email', value: trimmedText };
  }
  if (REGEX.COLOR.test(trimmedText)) {
    return { type: 'color', value: trimmedText };
  }
  return { type: 'text', value: text };
}
