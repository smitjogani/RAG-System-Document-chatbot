import React, { useState } from 'react';
import UploadPanel from './components/UploadPanel';
import ChatPanel from './components/ChatPanel';

function App() {
  const [updateKey, setUpdateKey] = useState(Date.now());

  const handleUploadSuccess = () => {
    setUpdateKey(Date.now());
  };

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans bg-gray-50">
      <UploadPanel onUploadSuccess={handleUploadSuccess} />
      <ChatPanel key={updateKey} />
    </div>
  );
}

export default App;
