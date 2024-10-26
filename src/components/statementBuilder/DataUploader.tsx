import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { processExcelData } from './utils/dataProcessing';
import { DataUploaderProps } from './types';

const DataUploader: React.FC<DataUploaderProps> = ({ onDataUploaded }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          const data = processExcelData(e.target.result as ArrayBuffer);
          onDataUploaded(data);
        }
      };
      
      reader.readAsArrayBuffer(file);
    },
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2">Drop your Excel file here or click to select</p>
      <p className="text-sm text-gray-500 mt-1">Supports .xlsx and .xls files</p>
    </div>
  );
};

export default DataUploader;