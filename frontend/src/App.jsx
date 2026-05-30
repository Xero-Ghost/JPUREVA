import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Directory from './pages/Directory';
import LabHub from './pages/LabHub';
import PartnerPortal from './pages/PartnerPortal';
import TrustStories from './pages/TrustStories';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';
import PartnerProfile from './pages/PartnerProfile';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col bg-grain">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/lab-hub" element={<LabHub />} />
              <Route path="/partner-portal" element={<PartnerPortal />} />
              <Route path="/trust-stories" element={<TrustStories />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/partner/dashboard" element={<PartnerDashboard />} />
              <Route path="/consumer/dashboard" element={<ConsumerDashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/:partnerSlug" element={<PartnerProfile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
