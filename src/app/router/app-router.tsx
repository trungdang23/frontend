import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CommunityFeedPage } from '@/features/community/routes/community-feed-page';
import { HomePage } from '@/features/home/routes/home-page';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<CommunityFeedPage />} path="/community" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
