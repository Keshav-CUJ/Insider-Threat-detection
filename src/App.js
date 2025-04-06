import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import AnomalyDashboard from './dashboard';
import Realtime from './realtime';
import './dashboard.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<AnomalyDashboard />} />
          <Route path="/realtime" element={<Realtime />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
