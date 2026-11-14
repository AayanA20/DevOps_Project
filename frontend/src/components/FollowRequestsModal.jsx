import React, { useState } from 'react';
import { X, Check, UserX, UserPlus } from 'lucide-react';
import { userService } from '../services/userService';

const FollowRequestsModal = ({ isOpen, onClose, requests = [], onActionCompleted }) => {
  const [requestList, setRequestList] = useState(requests);
  const [processingId, setProcessingId] = useState(null);

  if (!isOpen) return null;

  const handleAction = async (requesterId, action) => {
    setProcessingId(requesterId);
    try {
      await userService.respondFollowRequest(requesterId, action);
      setRequestList((prev) => prev.filter((r) => (r._id || r.id) !== requesterId));
      if (onActionCompleted) {
        onActionCompleted();
      }
    } catch (err) {
      alert(`Failed to ${action} request: ` + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4 text-instagram-blue" />
            <h2 className="text-sm font-bold text-gray-900">Follow Requests</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 max-h-96 overflow-y-auto divide-y divide-gray-100">
          {requestList.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-xs">
              No pending follow requests
            </div>
          ) : (
            requestList.map((req) => {
              const reqId = req._id || req.id;
              const isProcessing = processingId === reqId;
              const avatar =
                req.profilePicture ||
                `https://ui-avatars.com/api/?name=${req.username || 'User'}&background=random`;

              return (
                <div key={reqId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3 truncate mr-3">
                    <img
                      src={avatar}
                      alt={req.username}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-gray-900 truncate">{req.username}</p>
                      <p className="text-[11px] text-gray-400 truncate">{req.bio || 'Wants to follow you'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(reqId, 'approve')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-instagram-blue hover:bg-instagram-hoverBlue text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </button>
                    <button
                      onClick={() => handleAction(reqId, 'reject')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowRequestsModal;
