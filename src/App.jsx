import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import CategoryPage from '@/pages/CategoryPage';
import PromptDetail from '@/pages/PromptDetail';
import Pricing from '@/pages/Pricing';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Library from '@/pages/Library';
import Admin from '@/pages/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/prompt/:id" element={<PromptDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
