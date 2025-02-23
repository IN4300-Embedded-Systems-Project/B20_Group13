import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// local imports
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Users from './pages/Users';
import Circulation from './pages/Circulation';
import Search from './pages/Search';
// import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-100 bg-hero-pattern bg-no-repeat bg-cover flex flex-col gap-6">
                    <Navbar />
                    <div className="container mx-auto px-8 py-12 bg-gray-300 bg-opacity-85 rounded-xl shadow-lg">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/books/*" element={<Books />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/circulation" element={<Circulation />} />
                            <Route path="/search" element={<Search />} />
                            {/* <Route path="/login" element={<Login />} /> */}
                        </Routes>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
