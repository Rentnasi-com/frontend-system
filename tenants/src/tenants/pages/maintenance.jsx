import { useState, useEffect } from 'react';
import { 
  WrenchScrewdriverIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Maintenance = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    urgency: 'medium',
    category: 'general'
  });

  // Sample maintenance requests data
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'Leaky kitchen faucet',
      description: 'The faucet in the kitchen drips constantly, even when fully turned off.',
      status: 'open',
      urgency: 'high',
      category: 'plumbing',
      createdAt: '2023-06-15T10:30:00',
      messages: [
        {
          id: 1,
          sender: 'tenant',
          text: 'Just wanted to follow up on this issue. It\'s getting worse.',
          timestamp: '2023-06-16T09:15:00'
        },
        {
          id: 2,
          sender: 'manager',
          text: 'We\'ve scheduled a plumber for tomorrow between 10am-2pm.',
          timestamp: '2023-06-16T14:30:00'
        }
      ]
    },
    {
      id: 2,
      title: 'Broken bedroom blinds',
      description: 'The blinds in the master bedroom won\'t raise or lower properly.',
      status: 'in-progress',
      urgency: 'medium',
      category: 'furniture',
      createdAt: '2023-06-10T08:45:00',
      messages: [
        {
          id: 1,
          sender: 'manager',
          text: 'We\'ve ordered replacement parts. Should arrive next week.',
          timestamp: '2023-06-11T11:20:00'
        }
      ]
    },
    {
      id: 3,
      title: 'AC not cooling properly',
      description: 'The air conditioning isn\'t cooling below 75 degrees even when set lower.',
      status: 'completed',
      urgency: 'high',
      category: 'hvac',
      createdAt: '2023-05-28T16:20:00',
      messages: [
        {
          id: 1,
          sender: 'tenant',
          text: 'The AC technician came by and fixed the issue. Working great now!',
          timestamp: '2023-06-02T10:45:00'
        }
      ]
    }
  ]);

  // Set the first request as selected by default
  useEffect(() => {
    if (requests.length > 0 && !selectedRequest) {
      setSelectedRequest(requests[0]);
    }
  }, [requests, selectedRequest]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRequest) return;

    const updatedRequests = requests.map(request => {
      if (request.id === selectedRequest.id) {
        const newMsg = {
          id: request.messages.length + 1,
          sender: 'tenant',
          text: newMessage,
          timestamp: new Date().toISOString()
        };
        return {
          ...request,
          messages: [...request.messages, newMsg],
          status: request.status === 'completed' ? 'open' : request.status
        };
      }
      return request;
    });

    setRequests(updatedRequests);
    setSelectedRequest(updatedRequests.find(r => r.id === selectedRequest.id));
    setNewMessage('');
  };

  const handleCreateRequest = () => {
    const newReq = {
      id: requests.length + 1,
      ...newRequest,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: []
    };

    setRequests([newReq, ...requests]);
    setSelectedRequest(newReq);
    setShowNewRequestModal(false);
    setNewRequest({
      title: '',
      description: '',
      urgency: 'medium',
      category: 'general'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      case 'in-progress':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getUrgencyBadge = (urgency) => {
    const classes = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${classes[urgency]}`}>
        {urgency}
      </span>
    );
  };

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6 h-full">
      {/* Left sidebar - Requests list */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Maintenance Requests</h3>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
            {requests.map(request => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedRequest?.id === request.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium truncate">{request.title}</h4>
                  <div className="flex items-center">
                    {getStatusIcon(request.status)}
                    {getUrgencyBadge(request.urgency)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{request.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  {request.messages.length > 0 && (
                    <span className="flex items-center text-xs text-gray-500">
                      <ChatBubbleLeftRightIcon className="h-3 w-3 mr-1" />
                      {request.messages.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content - Request details and chat */}
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        {selectedRequest ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{selectedRequest.title}</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedRequest.status)}
                  {getUrgencyBadge(selectedRequest.urgency)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{selectedRequest.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span>Created: {new Date(selectedRequest.createdAt).toLocaleString()}</span>
                <span className="mx-2">•</span>
                <span>Category: {selectedRequest.category}</span>
              </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
              <div className="space-y-4">
                {selectedRequest.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'tenant' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${message.sender === 'tenant' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                    >
                      <p>{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'tenant' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center p-6">
              <WrenchScrewdriverIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Select a maintenance request or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">New Maintenance Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    rows={3}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="Detailed description of the problem"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  >
                    <option value="general">General</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="furniture">Furniture</option>
                    <option value="pest">Pest Control</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateRequest}
                  disabled={!newRequest.title || !newRequest.description}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;