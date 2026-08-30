import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { MainLayout } from './layouts/MainLayout/index';
import { Transactions } from './pages/Transactions';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Debtors } from './pages/Debtors';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions/>} />
              <Route path="categories" element={<Categories />} />
              <Route path="debtors" element={<Debtors />} />
            </Route>  

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;