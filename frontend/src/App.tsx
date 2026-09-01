import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryClient';
import { lightTheme, darkTheme } from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeModeContext';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { MainLayout } from './layouts/MainLayout/index';
import { PeriodProvider } from './contexts/PeriodContext';

// Code-splitting: cada página autenticada só é baixada quando visitada pela
// primeira vez, em vez de tudo ir no bundle inicial.
const Transactions = lazy(() => import('./pages/Transactions').then((m) => ({ default: m.Transactions })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Categories = lazy(() => import('./pages/Categories').then((m) => ({ default: m.Categories })));
const Debtors = lazy(() => import('./pages/Debtors').then((m) => ({ default: m.Debtors })));
const Subscriptions = lazy(() => import('./pages/Subscriptions').then((m) => ({ default: m.Subscriptions })));
const Goals = lazy(() => import('./pages/Goals').then((m) => ({ default: m.Goals })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));

const RouteFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
    <CircularProgress size={28} />
  </Box>
);


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
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </BrowserRouter>
        </PeriodProvider>
      </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <AppRoutes />
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

export default App;