import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from '@/features/home/routes/home-page';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
