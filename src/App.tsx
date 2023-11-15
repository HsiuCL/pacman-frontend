import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import "./Share.css";
import Game from './components/Game';
import SpecialThanks from './components/SpecialThanks';

function App() {
  return (
    <Router>
        <div className="App">
            <div className="app-content">
            <Routes>
                <Route path="/game" element={<Game />} />
                <Route path="/specialThanks" element={<SpecialThanks />} />
            </Routes>
            </div>
        </div>
    </Router>
  );
}

export default App;
