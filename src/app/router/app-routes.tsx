import { ReactNode, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardPage } from '@/features/dashboard/routes/dashboard-page';
import { ProfilePage } from '@/features/profile/routes/profile-page';
import { TripsPlaceholderPage } from '@/features/trips/routes/trips-placeholder-page';
import { ProtectedLayout } from '@/app/router/protected-layout';
import { PublicAuthLayout } from '@/app/router/public-auth-layout';
import { LoginPage } from '@/features/auth/routes/login-page';
import { RegisterPage } from '@/features/auth/routes/register-page';
import { PublicPageSkeleton } from '@/shared/ui/public-page-skeleton';

const LandingPage = lazy(async () => ({
  default: (await import('@/features/landing/routes/landing-page')).LandingPage,
}));

const CommunityPage = lazy(async () => ({
  default: (await import('@/features/community/routes/community-page')).CommunityPage,
}));

const CommunityPostPage = lazy(async () => ({
  default: (await import('@/features/community/routes/community-post-page')).CommunityPostPage,
}));

function withPublicFallback(node: ReactNode, variant: 'landing' | 'community' | 'post') {
  return <Suspense fallback={<PublicPageSkeleton variant={variant} />}>{node}</Suspense>;
}

export const appRoutes = [
  {
    path: '/',
    element: withPublicFallback(<LandingPage />, 'landing'),
  },
  {
    path: '/auth',
    element: <PublicAuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/community',
    children: [
      {
        index: true,
        element: withPublicFallback(<CommunityPage />, 'community'),
      },
      {
        path: ':postId',
        element: withPublicFallback(<CommunityPostPage />, 'post'),
      },
    ],
  },
  {
    path: '/app',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'trips/new',
        element: <TripsPlaceholderPage />,
      },
      {
        path: 'trips/:tripId',
        element: <TripsPlaceholderPage />,
      },
      {
        path: 'trips/:tripId/edit',
        element: <TripsPlaceholderPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
];
