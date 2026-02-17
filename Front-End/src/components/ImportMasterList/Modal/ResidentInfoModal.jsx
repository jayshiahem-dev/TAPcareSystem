import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Home, 
  MapPin, 
  IdCard, 
  Radio, 
  Edit, 
  X,
  AlertCircle
} from 'lucide-react';
import ResidentModal from '../Modal/AddResidentModal';

const ResidentInfoModal = ({ 
  show, 
  onClose,
  resident,
  theme,
  onGenerateCard,
  onAssignRFID,
  getStatusColor,
  onUpdateResident,
  municipalityOptions = [],
  genderOptions = [],
  civilStatusOptions = [],
  bloodTypeOptions = []
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);

  if (!show || !resident) return null;

  // Safe helper for missing fields
  const safeText = (text, fallback = '-') => {
    if (text === undefined || text === null || text === '') return fallback;
    return text;
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return 0;
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 0;
    }
  };

  // Function to handle edit button click
  const handleEditClick = () => {
    const residentCopy = { ...resident };
    setEditingResident(residentCopy);
    setShowEditModal(true);
  };

  // Function to handle resident update
  const handleUpdateResident = () => {
    if (editingResident && onUpdateResident) {
      onUpdateResident(editingResident);
    }
    setShowEditModal(false);
  };

  // Get full name
  const getFullName = () => {
    const parts = [];
    if (resident.firstname) parts.push(resident.firstname);
    if (resident.middlename && resident.middlename !== 'N/A') parts.push(resident.middlename);
    if (resident.lastname) parts.push(resident.lastname);
    if (resident.suffix && resident.suffix !== 'None') parts.push(resident.suffix);
    
    return parts.length > 0 ? parts.join(' ') : 'Unknown';
  };

  return (
    <>
      {/* Main Info Modal */}
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300">
          
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User size={24} className="text-orange-600 dark:text-orange-400" />
                Resident Information
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Complete details for {safeText(getFullName())}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <User size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="font-medium">{safeText(getFullName())}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Age</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                      <span>{calculateAge(resident.birthdate)} years old</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Gender</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        resident.gender === 'Male' 
                          ? theme === 'dark' 
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-blue-100 text-blue-700'
                          : theme === 'dark'
                            ? 'bg-pink-900/30 text-pink-400'
                            : 'bg-pink-100 text-pink-700'
                      }`}>
                        {safeText(resident.gender)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Birthdate</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                      <span>{formatDate(resident.birthdate)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Civil Status</label>
                    <div className="text-gray-900 dark:text-gray-200">
                      <span className="font-medium">{safeText(resident.civil_status)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Occupation</label>
                    <div className="text-gray-900 dark:text-gray-200">
                      <span className="font-medium">{safeText(resident.occupation)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Employment Status</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        theme === 'dark' 
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {safeText(resident.employment_status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Religion</label>
                    <div className="text-gray-900 dark:text-gray-200">
                      <span className="font-medium">{safeText(resident.religion)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Number</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <Phone size={16} className="text-gray-400 dark:text-gray-500" />
                      <span>{safeText(resident.contact_number)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Birth Place</label>
                    <div className="text-gray-900 dark:text-gray-200">
                      <span className="font-medium">{safeText(resident.birth_place)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label>
                    <div className="flex items-start gap-2 text-gray-900 dark:text-gray-200">
                      <Home size={16} className="text-gray-400 dark:text-gray-500 mt-1" />
                      <span>{safeText(resident.address)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Barangay</label>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                        <Home size={12} />
                        {safeText(resident.barangay)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Municipality</label>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium">
                        <MapPin size={12} />
                        {safeText(resident.municipality)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sitio</label>
                    <div className="text-gray-900 dark:text-gray-200">
                      <span className="font-medium">{safeText(resident.sitio)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* System Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                System Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resident ID</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <IdCard size={16} className="text-gray-400 dark:text-gray-500" />
                      <span className="font-medium">
                        {resident._id ? `RES-${resident._id.substring(0, 8)}` : 'RES-0000'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">RFID Number</label>
                    <div className="flex items-center gap-2">
                      {resident.rfid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                          <Radio size={12} />
                          {resident.rfid}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500 italic">No RFID assigned</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${getStatusColor(resident.status)}`}>
                        {safeText(resident.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
                    <div className="text-gray-900 dark:text-gray-200">
                      <span className="font-medium">{safeText(resident.role)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Household ID</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <Home size={16} className="text-gray-400 dark:text-gray-500" />
                      <span>{safeText(resident.household_id)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date Registered</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                      <span>{formatDate(resident.dateRegistered)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Updated</label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                      <span>{formatDate(resident.lastUpdated)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-3">
                {onAssignRFID && (
                  <button 
                    onClick={() => onAssignRFID(resident)}
                    className="px-6 py-2 bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-bold"
                  >
                    <Radio size={16} className="inline mr-2" />
                    {resident.rfid ? 'Update RFID' : 'Assign RFID'}
                  </button>
                )}
                <button 
                  onClick={handleEditClick}
                  className="px-6 py-2 bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-bold"
                >
                  <Edit size={16} className="inline mr-2" />
                  Edit Information
                </button>
              </div>
            </div>

          </div>

          {/* Modal Footer Notes */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                This information is confidential and should only be accessed by authorized personnel.
                Please ensure data privacy compliance when handling resident information.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ResidentModal
          mode="edit"
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          residentData={editingResident}
          setResidentData={setEditingResident}
          onSubmit={handleUpdateResident}
          municipalityOptions={municipalityOptions}
          genderOptions={genderOptions}
          civilStatusOptions={civilStatusOptions}
          bloodTypeOptions={bloodTypeOptions}
        />
      )}
    </>
  );
};

export default ResidentInfoModal;