import { Upload, X } from 'lucide-react';
import React, { useState } from 'react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-scale-in transform border border-gray-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Import Data</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-xl transition-all duration-300 transform hover:scale-110"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-500 hover:border-blue-500 hover:bg-blue-50/40'
          }`}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-blue-700" />
          </div>
          <p className="text-black font-bold mb-2 text-lg">
            Drop your CSV file here
          </p>
          <p className="text-sm text-black/70 mb-6 font-medium">
            or click the button below to browse
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={onUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 cursor-pointer font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5"
          >
            Choose File
          </label>
        </div>
      </div>
    </div>
  );
};
