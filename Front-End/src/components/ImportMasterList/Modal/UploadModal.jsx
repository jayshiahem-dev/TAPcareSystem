import React from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText,
  UploadCloud 
} from 'lucide-react';

const UploadModal = ({ 
  show, 
  onClose,
  file,
  isDragging,
  uploadStatus,
  fileInputRef,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  resetFile,
  simulateUpload,
  isLoading = false
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UploadCloud size={24} className="text-orange-600 dark:text-orange-400" />
              Upload Excel File
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload Excel file to update master list
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploadStatus === 'uploading'}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                ${isDragging 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'border-gray-300 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="text-orange-600 dark:text-orange-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Drag Excel file here</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Or click to browse your computer</p>
              <div className="mt-4 flex gap-2 justify-center">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">.XLSX</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">.XLS</span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">.CSV</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                    <FileText className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={resetFile}
                  disabled={uploadStatus === 'uploading'}
                  className="p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full text-gray-400 dark:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Upload Status */}
              {uploadStatus === 'uploading' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">Uploading file to server...</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Please wait while we process your file
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  onClick={onClose}
                  disabled={uploadStatus === 'uploading'}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  onClick={simulateUpload}
                  disabled={uploadStatus === 'uploading' || uploadStatus === 'success' || isLoading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${uploadStatus === 'success' 
                      ? 'bg-green-500 dark:bg-green-600' 
                      : 'bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600'
                    }`}
                >
                  {uploadStatus === 'idle' && (
                    <><Upload size={18} /> Start Upload</>
                  )}
                  {uploadStatus === 'uploading' && (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Uploading...</>
                  )}
                  {uploadStatus === 'success' && (
                    <><CheckCircle2 size={18} /> Upload Complete!</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 dark:text-orange-500 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Important Notes</h5>
              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <li>• Ensure correct column format in Excel file</li>
                <li>• Backup your existing master list before uploading new file</li>
                <li>• Duplicate records may be overwritten</li>
                <li>• File will be processed directly on the server</li>
                <li>• Supported formats: .xlsx, .xls, .csv</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;