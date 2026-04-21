import { ReactNode, lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedLayout } from '@/app/router/protected-layout';
import { PublicAuthLayout } from '@/app/router/public-auth-layout';
import { WorkspaceRouteSkeleton } from '@/app/router/workspace-route-skeleton';
import { PublicPageSkeleton } from '@/shared/ui/public-page-skeleton';

const LandingPage = lazy(async () => ({
  default: (await import('@/features/landing/routes/landing-page')).LandingPage,
}));

const LoginPage = lazy(async () => ({
  default: (await import('@/features/auth/routes/login-page')).LoginPage,
}));

const RegisterPage = lazy(async () => ({
  default: (await import('@/features/auth/routes/register-page')).RegisterPage,
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

const DashboardPage = lazy(async () => ({
  default: (await import('@/features/dashboard/routes/dashboard-page')).DashboardPage,
}));

const ProfilePage = lazy(async () => ({
  default: (await import('@/features/profile/routes/profile-page')).ProfilePage,
}));

const CommunityCreatePage = lazy(async () => ({
  default: (await import('@/features/community/routes/community-create-page')).CommunityCreatePage,
}));

const TripsPage = lazy(async () => ({
  default: (await import('@/features/trips/routes/trips-page')).TripsPage,
}));

const TripCreatePage = lazy(async () => ({
  default: (await import('@/features/trips/routes/trip-create-page')).TripCreatePage,
}));

const TripDetailPage = lazy(async () => ({
  default: (await import('@/features/trips/routes/trip-detail-page')).TripDetailPage,
}));

const TripEditPage = lazy(async () => ({
  default: (await import('@/features/trips/routes/trip-edit-page')).TripEditPage,
}));

function withPublicFallback(
  node: ReactNode,
  variant: 'landing' | 'community' | 'post' | 'trip',
) {
  return <Suspense fallback={<PublicPageSkeleton variant={variant} />}>{node}</Suspense>;
}

function withWorkspaceFallback(node: ReactNode) {
  return <Suspense fallback={<WorkspaceRouteSkeleton />}>{node}</Suspense>;
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
        element: withPublicFallback(<LoginPage />, 'landing'),
      },
      {
        path: 'register',
        element: withPublicFallback(<RegisterPage />, 'landing'),
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
        element: withWorkspaceFallback(<DashboardPage />),
      },
      {
        path: 'profile',
        element: withWorkspaceFallback(<ProfilePage />),
      },
      {
        path: 'community/new',
        element: withWorkspaceFallback(<CommunityCreatePage />),
      },
      {
        path: 'trips',
        element: withWorkspaceFallback(<TripsPage />),
      },
      {
        path: 'trips/new',
        element: withWorkspaceFallback(<TripCreatePage />),
      },
      {
        path: 'trips/:tripId',
        element: withWorkspaceFallback(<TripDetailPage />),
      },
      {
        path: 'trips/:tripId/edit',
        element: withWorkspaceFallback(<TripEditPage />),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
];
