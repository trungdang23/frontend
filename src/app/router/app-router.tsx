import { Suspense, lazy, type ReactNode } from 'react';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
  useParams,
} from 'react-router-dom';
import {
  buildJournalTripPath,
  buildPlannerTripPath,
} from '@/app/router/trip-route-redirects';
import { GuestRoute } from '@/features/auth/routes/guest-route';
import { ProtectedRoute } from '@/features/auth/routes/protected-route';

const HomePage = lazy(async () => ({
  default: (await import('@/features/home/routes/home-page')).HomePage,
}));
const CommunityFeedPage = lazy(async () => ({
  default: (await import('@/features/community/routes/community-feed-page')).CommunityFeedPage,
}));
const PublicTripPage = lazy(async () => ({
  default: (await import('@/features/trips/public/routes/public-trip-page')).PublicTripPage,
}));
const PublicJournalPage = lazy(async () => ({
  default: (await import('@/features/journal/routes/public-journal-page')).PublicJournalPage,
}));
const LoginPage = lazy(async () => ({
  default: (await import('@/features/auth/routes/login-page')).LoginPage,
}));
const RegisterPage = lazy(async () => ({
  default: (await import('@/features/auth/routes/register-page')).RegisterPage,
}));
const TripsPage = lazy(async () => ({
  default: (await import('@/features/trips/routes/trips-page')).TripsPage,
}));
const TripFormPage = lazy(async () => ({
  default: (await import('@/features/trips/routes/trip-form-page')).TripFormPage,
}));
const PlannerPage = lazy(async () => ({
  default: (await import('@/features/trips/routes/planner-page')).PlannerPage,
}));
const JournalPage = lazy(async () => ({
  default: (await import('@/features/journal/routes/journal-page')).JournalPage,
}));
const ProfilePage = lazy(async () => ({
  default: (await import('@/features/profile/routes/profile-page')).ProfilePage,
}));

function RouteFallback() {
  return (
    <div aria-busy="true" className="page-backdrop flex min-h-screen items-center justify-center px-6 py-10">
      <div className="paper-panel flex w-full max-w-md flex-col items-center gap-4 px-8 py-10" role="status">
        <span className="sr-only">Loading page</span>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[rgba(122,75,57,0.16)] border-t-[var(--color-warm-red)]" />
        <div className="h-3 w-32 animate-pulse rounded-full bg-[rgba(122,75,57,0.16)]" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-[rgba(122,75,57,0.1)]" />
      </div>
    </div>
  );
}

function withRouteFallback(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

function PlannerTripRouteRedirect() {
  const location = useLocation();
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <Navigate
      replace
      to={tripId ? buildPlannerTripPath(tripId, location.search) : '/app/trips/new'}
    />
  );
}

function PlannerCompatibilityRoute() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tripId = searchParams.get('tripId')?.trim();

  return (
    <Navigate
      replace
      to={tripId ? buildPlannerTripPath(tripId, location.search) : '/app/trips/new'}
    />
  );
}

function JournalCompatibilityRoute() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tripId = searchParams.get('tripId')?.trim();

  return (
    <Navigate
      replace
      to={tripId ? buildJournalTripPath(tripId, location.search) : '/app/profile'}
    />
  );
}

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={withRouteFallback(<HomePage />)} path="/" />
      <Route element={withRouteFallback(<CommunityFeedPage />)} path="/community" />
      <Route element={withRouteFallback(<PublicTripPage />)} path="/public/trips/:tripId" />
      <Route
        element={withRouteFallback(<PublicJournalPage />)}
        path="/public/trips/:tripId/journal"
      />
      <Route
        element={withRouteFallback(
          <GuestRoute>
            <LoginPage />
          </GuestRoute>,
        )}
        path="/auth/login"
      />
      <Route
        element={withRouteFallback(
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>,
        )}
        path="/auth/register"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <Navigate replace to="/app/trips" />
          </ProtectedRoute>
        )}
        path="/app"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        )}
        path="/app/trips"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <TripFormPage />
          </ProtectedRoute>
        )}
        path="/app/trips/new"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <PlannerTripRouteRedirect />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <TripFormPage />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId/edit"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <PlannerPage />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId/planner"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <JournalPage />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId/journal"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <PlannerCompatibilityRoute />
          </ProtectedRoute>
        )}
        path="/app/planner"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <JournalCompatibilityRoute />
          </ProtectedRoute>
        )}
        path="/app/journal"
      />
      <Route
        element={withRouteFallback(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
        path="/app/profile"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </>,
  ),
);

export function AppRouter() {
  return <RouterProvider router={appRouter} />;
}
