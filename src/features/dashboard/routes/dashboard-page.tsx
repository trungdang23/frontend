import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/session/use-auth';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export function DashboardPage() {
  const auth = useAuth();

  return (
    <div className="space-y-8">
      <Card className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-forest)]">
            Dashboard
          </p>
          <div className="space-y-3">
            <h1 className="headline text-4xl text-[var(--color-ink)]">
              Chao {auth.user?.displayName || 'ban'}, hanh trinh tiep theo dang cho duoc len lich.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--color-ink-soft)]">
              Phase này tập trung mở app shell, auth thật và trạng thái rỗng có chủ đích. Khi BE
              phase trips sẵn sàng, khu vực này sẽ chuyển sang danh sách chuyến đi thật mà không cần
              đổi routing nền.
            </p>
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(84,107,65,0.94),rgba(153,173,122,0.74))] p-6 text-white shadow-[var(--shadow-card)]">
          <p className="text-sm uppercase tracking-[0.2em] text-white/72">Next action</p>
          <h2 className="headline mt-3 text-3xl">Chuẩn bị workspace cho chuyến đi đầu tiên</h2>
          <p className="mt-3 text-sm leading-7 text-white/78">
            API trips chưa mở ở backend nên CTA hiện điều hướng tới placeholder có nhãn rõ ràng để
            tránh tạo cảm giác đây đã là tính năng production hoàn chỉnh.
          </p>
          <Link
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--color-forest)] transition hover:bg-[rgba(255,255,255,0.88)]"
            to="/app/trips/new"
          >
            <Plus className="h-4 w-4" />
            Tao chuyen di dau tien
          </Link>
        </div>
      </Card>

      <EmptyState
        action={
          <Link className={getButtonClasses()} to="/app/profile">
            <span className="inline-flex items-center gap-2">
              Xem hồ sơ hiện tại
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        }
        description="Journey đã sẵn sàng session thật với backend và giữ dashboard ở trạng thái trống có chủ đích, giúp team mở rộng trips sau mà không phải đập lại nền."
        eyebrow="Empty state"
        title="Chưa có chuyến đi nào trong tài khoản của bạn"
      />
    </div>
  );
}
