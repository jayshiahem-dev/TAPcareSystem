import React from 'react';
import { 
  CreditCard, 
  Printer, 
  Download, 
  AlertCircle, 
  X,
  User,
  Home,
  MapPin,
  Phone,
  Mail,
  IdCard,
  Radio,
  QrCode
} from 'lucide-react';

const CardModal = ({
  show,
  onClose,
  resident,
  cardType,
  setCardType,
  printOrientation,
  setPrintOrientation,
  onPrint,
  onDownload
}) => {
  if (!show || !resident) return null;

  const formatCardDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard size={24} className="text-green-600 dark:text-green-400" />
              Generate ID Card
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Preview and print ID card for {resident.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Card Customization Options */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Card Customization</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Card Type</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="standard">Standard Card</option>
                  <option value="premium">Premium Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Print Orientation</label>
                <select
                  value={printOrientation}
                  onChange={(e) => setPrintOrientation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Print Options</label>
                <div className="flex gap-2">
                  <button 
                    onClick={onPrint}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <Printer size={14} />
                    Print Card
                  </button>
                  <button 
                    onClick={onDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card Preview */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Card Preview</h4>
            <div id="card-to-print" className="flex justify-center">
              <div className={`w-full max-w-md border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg ${cardType === 'premium' ? 'bg-gradient-to-br from-blue-50 to-green-50' : 'bg-white'}`}>
                {/* Card Header */}
                <div className={`p-4 ${cardType === 'premium' ? 'bg-gradient-to-r from-orange-600 to-orange-500' : 'bg-orange-600'} text-white text-center`}>
                  <h2 className="text-xl font-bold">MUNICIPAL IDENTIFICATION CARD</h2>
                  <p className="text-sm opacity-90">{resident.municipality} Municipality</p>
                </div>
                
                {/* Card Body */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Column - Photo and Basic Info */}
                    <div className="md:w-1/3">
                      <div className="mb-4">
                        <div className="w-32 h-32 mx-auto bg-gray-200 rounded-lg border-4 border-white shadow flex items-center justify-center">
                          <User size={48} className="text-gray-400" />
                          <div className="absolute bottom-0 right-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-tl">
                            ID Photo
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mb-4">
                        <div className="inline-block p-2 bg-gray-100 rounded-lg">
                          <QrCode size={80} className="text-gray-700" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Scan for verification</p>
                      </div>
                      
                      <div className="text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          resident.status === 'Validated' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {resident.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right Column - Details */}
                    <div className="md:w-2/3">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">{resident.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Resident ID: <strong>RES-{resident.id.toString().padStart(4, '0')}</strong></span>
                          {resident.rfid && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              <Radio size={10} />
                              {resident.rfid}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Age / Gender</p>
                          <p className="font-medium">{resident.age} / {resident.gender}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Birthdate</p>
                          <p className="font-medium">{resident.birthdate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Civil Status</p>
                          <p className="font-medium">{resident.civilStatus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Blood Type</p>
                          <p className="font-medium">{resident.bloodType || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Address</p>
                        <p className="font-medium">{resident.address}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            <Home size={10} />
                            {resident.barangay}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                            <MapPin size={10} />
                            {resident.municipality}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Contact Information</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={12} className="text-gray-400" />
                          <span>{resident.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <Mail size={12} className="text-gray-400" />
                          <span>{resident.email}</span>
                        </div>
                      </div>
                      
                      {cardType === 'premium' && (
                        <div className="border-t pt-4 mt-4">
                          <p className="text-xs text-gray-500 mb-2">Government IDs</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="font-semibold">TIN</p>
                              <p className="text-gray-600">{resident.tin || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold">SSS</p>
                              <p className="text-gray-600">{resident.sss || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-semibold">PhilHealth</p>
                              <p className="text-gray-600">{resident.philhealth || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <div>
                      <p>Issued: {formatCardDate()}</p>
                      <p>Valid until: {new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p>Municipal Mayor</p>
                      <p className="font-bold">Signature</p>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-gray-500">
                    This card is property of {resident.municipality} Municipality. If found, please return to Municipal Hall.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
            <button 
              onClick={onPrint}
              className="px-6 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-bold flex items-center gap-2"
            >
              <Printer size={16} />
              Print Card Now
            </button>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Printing Instructions</h5>
              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                <li>• Ensure printer has enough paper and ink</li>
                <li>• Use high-quality card stock for best results</li>
                <li>• Adjust print orientation based on your needs</li>
                <li>• Laminate the card for durability</li>
                <li>• Verify all information before printing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;