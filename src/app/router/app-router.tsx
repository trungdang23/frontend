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
import { LoginPage } from '@/features/auth/routes/login-page';
import { ProtectedRoute } from '@/features/auth/routes/protected-route';
import { RegisterPage } from '@/features/auth/routes/register-page';
import { CommunityFeedPage } from '@/features/community/routes/community-feed-page';
import { HomePage } from '@/features/home/routes/home-page';
import { JournalPage } from '@/features/journal/routes/journal-page';
import { PublicJournalPage } from '@/features/journal/routes/public-journal-page';
import { ProfilePage } from '@/features/profile/routes/profile-page';
import { PublicTripPage } from '@/features/trips/public/routes/public-trip-page';
import { PlannerPage } from '@/features/trips/routes/planner-page';
import { TripFormPage } from '@/features/trips/routes/trip-form-page';
import { TripsPage } from '@/features/trips/routes/trips-page';

function PlannerTripRouteRedirect() {
  const location = useLocation();
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <Navigate
      replace
      to={tripId ? buildPlannerTripPath(tripId, location.search) : '/app/planner'}
    />
  );
}

function PlannerCompatibilityRoute() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tripId = searchParams.get('tripId')?.trim();

  return tripId ? (
    <Navigate
      replace
      to={buildPlannerTripPath(tripId, location.search)}
    />
  ) : (
    <PlannerPage />
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
      <Route element={<HomePage />} path="/" />
      <Route element={<CommunityFeedPage />} path="/community" />
      <Route element={<PublicTripPage />} path="/public/trips/:tripId" />
      <Route element={<PublicJournalPage />} path="/public/trips/:tripId/journal" />
      <Route
        element={(
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        )}
        path="/auth/login"
      />
      <Route
        element={(
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        )}
        path="/auth/register"
      />
      <Route
        element={(
          <ProtectedRoute>
            <Navigate replace to="/app/trips" />
          </ProtectedRoute>
        )}
        path="/app"
      />
      <Route
        element={(
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        )}
        path="/app/trips"
      />
      <Route
        element={(
          <ProtectedRoute>
            <TripFormPage />
          </ProtectedRoute>
        )}
        path="/app/trips/new"
      />
      <Route
        element={(
          <ProtectedRoute>
            <PlannerTripRouteRedirect />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId"
      />
      <Route
        element={(
          <ProtectedRoute>
            <TripFormPage />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId/edit"
      />
      <Route
        element={(
          <ProtectedRoute>
            <PlannerPage />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId/planner"
      />
      <Route
        element={(
          <ProtectedRoute>
            <JournalPage />
          </ProtectedRoute>
        )}
        path="/app/trips/:tripId/journal"
      />
      <Route
        element={(
          <ProtectedRoute>
            <PlannerCompatibilityRoute />
          </ProtectedRoute>
        )}
        path="/app/planner"
      />
      <Route
        element={(
          <ProtectedRoute>
            <JournalCompatibilityRoute />
          </ProtectedRoute>
        )}
        path="/app/journal"
      />
      <Route
        element={(
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
