/**
 * App Component
 * 
 * Main application component with routing and authentication provider.
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Header } from './components/Layout';
import { ProtectedRoute } from './components/Layout';
import { 
  Discover, 
  CourseDetails, 
  Profile, 
  Favorites, 
  Recommendations,
  NotFound 
} from './pages';
import { ScrollToTop } from './components';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <Router>
          <div className="app">
            <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Discover />} />
              <Route path="/course/:id" element={<CourseDetails />} />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recommendations" 
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
            <ScrollToTop />
          </div>
        </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
