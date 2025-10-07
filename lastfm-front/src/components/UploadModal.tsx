import { Upload, X } from 'lucide-react';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Import Data</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-700 font-medium mb-2">
          Drop your CSV file here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse
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
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
        >
          Choose File
        </label>
      </div>
    </div>
  </div>
);