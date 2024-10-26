import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onDrop: (files: File[]) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2">Drop your Excel file here or click to select</p>
    </div>
  );
};

export default FileDropzone;