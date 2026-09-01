import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeModeContext';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { MainLayout } from './layouts/MainLayout/index';
import { Transactions } from './pages/Transactions';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Debtors } from './pages/Debtors';
import { Subscriptions } from './pages/Subscriptions';
import { Goals } from './pages/Goals';
import { Profile } from './pages/Profile';
import { PeriodProvider } from './contexts/PeriodContext';


const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { mode } = useThemeMode();
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
      <AuthProvider>
        <PeriodProvider>
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
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="goals" element={<Goals />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </PeriodProvider>
      </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export function App() {
  return (
    <ThemeModeProvider>
      <AppRoutes />
    </ThemeModeProvider>
  );
}

export default App;