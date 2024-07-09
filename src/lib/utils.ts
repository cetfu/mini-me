import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toBase64(fileList: FileList): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (fileList.length === 0) {
      reject(new Error("FileList is empty."));
      return;
    }

    const file = fileList[0];

    if (!(file instanceof Blob)) {
      reject(new TypeError("Parameter is not of type 'Blob'."));
      return;
    }

    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};
