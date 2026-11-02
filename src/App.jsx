import { Navigate, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import { useAuth } from "./context/AuthContext";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import CreateMatch from "./pages/CreateMatch";
import MatchDetails from "./pages/MatchDetails";
import LiveScoring from "./pages/LiveScoring";
import Scorecard from "./pages/Scorecard";
import Leaderboard from "./pages/Leaderboard";
import PlayerProfile from "./pages/PlayerProfile";
import Tournaments from "./pages/Tournaments";
import TournamentDetails from "./pages/TournamentDetails";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function Placeholder({ title }) {
  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-gray-100">

      <div className="text-5xl mb-5">🏏</div>

      <h1 className="text-2xl font-bold text-gray-800">
        {title}
      </h1>

      <p className="text-gray-500 mt-3">
        This module will be developed in the next stages.
      </p>

    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* Public pages */}

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <Login />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <Register />
        }
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Protected application */}

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
        
      >
        <Route
  path="/matches/:id"
  element={<Placeholder title="Match Details" />}
/>
        <Route path="/matches" element={<Matches />} />

<Route path="/create-match" element={<CreateMatch />} />
        <Route path="/teams" element={<Teams />} />

<Route path="/players" element={<Players />} />
<Route path="/matches/:id" element={<MatchDetails />} />
<Route path="/matches/:id/live" element={<LiveScoring />} />
<Route path="/matches/:id/scorecard" element={<Scorecard />} />
<Route path="/leaderboard" element={<Leaderboard />} />
<Route path="/players/:id" element={<PlayerProfile />} />
<Route path="/tournaments" element={<Tournaments />} />
<Route path="/tournaments/:id" element={<TournamentDetails />} />
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/profile" element={<Profile />} />
<Route path="/settings" element={<Settings />} />



        <Route path="/" element={<Dashboard />} />

        <Route path="/matches" element={<Placeholder title="Matches" />} />

        <Route path="/matches/:id" element={<Placeholder title="Match Details" />} />

        <Route path="/create-match" element={<Placeholder title="Create Match" />} />

        <Route path="/teams" element={<Placeholder title="Teams Management" />} />

        <Route path="/players" element={<Placeholder title="Players Management" />} />

        <Route path="/tournaments" element={<Placeholder title="Tournaments" />} />

        <Route path="/leaderboard" element={<Placeholder title="Leaderboard" />} />

        <Route path="/profile" element={<Placeholder title="My Profile" />} />

        <Route path="/settings" element={<Placeholder title="Settings" />} />

      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/" : "/login"} replace />
        }
      />

    </Routes>
  );
}