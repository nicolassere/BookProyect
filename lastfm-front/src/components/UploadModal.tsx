import { Upload, X } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-scale-in transform">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 transform hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary-400 hover:bg-primary-50/30 transition-all duration-300 group">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
          <Upload className="w-8 h-8 text-primary-600" />
        </div>
        <p className="text-gray-700 font-bold mb-2 text-lg">
          Drop your CSV file here
        </p>
        <p className="text-sm text-gray-500 mb-6 font-medium">
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
          className="inline-block px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 cursor-pointer font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transform hover:-translate-y-0.5"
        >
          Choose File
        </label>
      </div>
    </div>
  </div>
);