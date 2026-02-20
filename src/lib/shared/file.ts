import saveAs from 'file-saver';

export function writeJsonFile(name: string, data: any): void {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, name);
}

export async function readJsonFile(file: File): Promise<any> {
  try {
    const text = await file.text();
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to read file!', { cause: error });
  }
}
