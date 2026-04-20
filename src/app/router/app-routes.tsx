import { ReactNode, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardPage } from '@/features/dashboard/routes/dashboard-page';
import { ProfilePage } from '@/features/profile/routes/profile-page';
import { TripCreatePage } from '@/features/trips/routes/trip-create-page';
import { TripDetailPage } from '@/features/trips/routes/trip-detail-page';
import { TripEditPage } from '@/features/trips/routes/trip-edit-page';
import { TripsPage } from '@/features/trips/routes/trips-page';
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

const PublicTripPage = lazy(async () => ({
  default: (await import('@/features/trips/public/routes/public-trip-page')).PublicTripPage,
}));

const PublicTripsPage = lazy(async () => ({
  default: (await import('@/features/trips/public/routes/public-trips-page')).PublicTripsPage,
}));

function withPublicFallback(
  node: ReactNode,
  variant: 'landing' | 'community' | 'post' | 'trip',
) {
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
    path: '/trips',
    children: [
      {
        index: true,
        element: withPublicFallback(<PublicTripsPage />, 'trip'),
      },
      {
        path: ':tripId',
        element: withPublicFallback(<PublicTripPage />, 'trip'),
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
        path: 'trips',
        element: <TripsPage />,
      },
      {
        path: 'trips/new',
        element: <TripCreatePage />,
      },
      {
        path: 'trips/:tripId',
        element: <TripDetailPage />,
      },
      {
        path: 'trips/:tripId/edit',
        element: <TripEditPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
];
