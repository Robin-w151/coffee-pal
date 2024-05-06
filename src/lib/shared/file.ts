import saveAs from 'file-saver';

export function writeJsonFile(name: string, data: any): void {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, name);
}

export async function readJsonFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch (_error) {
        reject(new Error('Failed to read file!'));
      }
    };
    reader.readAsText(file);
  });
}
