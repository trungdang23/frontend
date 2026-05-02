import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import {
  buildJournalCompatibilityPath,
  buildPlannerCompatibilityPath,
} from '@/app/router/trip-route-redirects';
import { GuestRoute } from '@/features/auth/routes/guest-route';
import { LoginPage } from '@/features/auth/routes/login-page';
import { ProtectedRoute } from '@/features/auth/routes/protected-route';
import { RegisterPage } from '@/features/auth/routes/register-page';
import { CommunityFeedPage } from '@/features/community/routes/community-feed-page';
import { HomePage } from '@/features/home/routes/home-page';
import { JournalPage } from '@/features/journal/routes/journal-page';
import { ProfilePage } from '@/features/profile/routes/profile-page';
import { PlannerPage } from '@/features/trips/routes/planner-page';

function PlannerTripRouteRedirect() {
  const location = useLocation();
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <Navigate
      replace
      to={tripId ? buildPlannerCompatibilityPath(tripId, location.search) : '/app/planner'}
    />
  );
}

function JournalTripRouteRedirect() {
  const location = useLocation();
  const { tripId } = useParams<{ tripId: string }>();

  return (
    <Navigate
      replace
      to={tripId ? buildJournalCompatibilityPath(tripId, location.search) : '/app/journal'}
    />
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<CommunityFeedPage />} path="/community" />
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
              <Navigate replace to="/app/planner" />
            </ProtectedRoute>
          )}
          path="/app"
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
              <PlannerTripRouteRedirect />
            </ProtectedRoute>
          )}
          path="/app/trips/:tripId/planner"
        />
        <Route
          element={(
            <ProtectedRoute>
              <JournalTripRouteRedirect />
            </ProtectedRoute>
          )}
          path="/app/trips/:tripId/journal"
        />
        <Route
          element={(
            <ProtectedRoute>
              <PlannerPage />
            </ProtectedRoute>
          )}
          path="/app/planner"
        />
        <Route
          element={(
            <ProtectedRoute>
              <JournalPage />
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
      </Routes>
    </BrowserRouter>
  );
}
