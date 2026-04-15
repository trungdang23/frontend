import { House, LogOut, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/session/use-auth';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';

const navItems = [
  { label: 'Dashboard', to: '/app', icon: House },
  { label: 'Ho so', to: '/app/profile', icon: UserRound },
];

export function AppShell() {
  const auth = useAuth();

  return (
    <div className="min-h-screen">
      <header className="page-shell pt-5">
        <div className="glass-panel flex flex-col gap-4 rounded-[var(--radius-xl)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="headline text-3xl text-[var(--color-forest)]">Journey Workspace</p>
            <p className="text-sm text-[var(--color-ink-soft)]">
              Xin chào {auth.user?.displayName || 'bạn'}, phase protected shell đã sẵn sàng.
            </p>
          </div>
          <Button onClick={auth.logout} variant="secondary">
            <span className="inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Dang xuat
            </span>
          </Button>
        </div>
      </header>

      <div className="page-shell grid gap-8 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="glass-panel rounded-[var(--radius-xl)] p-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive
                        ? 'bg-[rgba(84,107,65,0.12)] text-[var(--color-forest)]'
                        : 'text-[var(--color-ink-soft)] hover:bg-white/60 hover:text-[var(--color-forest)]',
                    )
                  }
                  end={item.to === '/app'}
                  key={item.to}
                  to={item.to}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
