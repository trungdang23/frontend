import { ArrowRight, Compass, NotebookPen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { PageSection } from '@/shared/ui/page-section';
import { SiteHeader } from '@/shared/ui/site-header';

const featureCards = [
  {
    icon: NotebookPen,
    title: 'Lên kế hoạch có trật tự',
    description:
      'Từ bước auth, dashboard tới khung trips, toàn bộ flow được chốt trước để tránh phải sửa kiến trúc giữa chừng.',
  },
  {
    icon: Compass,
    title: 'Giữ trải nghiệm giàu cảm hứng',
    description:
      'Visual direction đi theo travel journal ấm áp, nhiều khoảng thở và có cá tính thay vì một dashboard generic.',
  },
  {
    icon: Users,
    title: 'Mở rộng sang cộng đồng đúng thời điểm',
    description:
      'Community đang được giữ ở mode teaser để đồng bộ với tiến độ backend thật, tránh rework không cần thiết.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen pb-12">
      <SiteHeader />

      <PageSection className="pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[var(--color-forest)]">
              Ke hoach cho mot hanh trinh ro rang
            </p>
            <div className="space-y-4">
              <h1 className="headline max-w-4xl text-5xl leading-tight text-[var(--color-ink)] sm:text-6xl">
                Journey giúp bạn gom cảm hứng, giữ nhịp chuẩn bị và bắt đầu chuyến đi với tâm thế
                nhẹ hơn.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[var(--color-ink-soft)]">
                Phase frontend đầu tiên tập trung vào nền tảng đúng: auth thật, protected shell,
                dashboard rỗng có chủ đích, profile đồng bộ backend và roadmap rõ ràng cho trips về
                sau.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className={getButtonClasses()} to="/auth/register">
                <span className="inline-flex items-center gap-2">
                  Tạo tài khoản
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link className={getButtonClasses('secondary')} to="/community">
                Xem teaser cộng đồng
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(84,107,65,0.92),rgba(153,173,122,0.8))] p-8 text-white">
              <p className="text-sm uppercase tracking-[0.22em] text-white/72">Phase 01-04</p>
              <h2 className="headline mt-3 text-4xl">Tập trung dựng nền đúng một lần</h2>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Router public/protected, session boot bằng auth thật, token strategy rõ ràng và các
                màn P0 sẵn sàng cho vòng phát triển tiếp theo.
              </p>
            </div>
            <div className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-forest)]">
                  Ready now
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                  Login, register, me, refresh
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-white/72 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-forest)]">
                  Next dependency
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--color-ink)]">
                  Trips workspace từ backend phase 04
                </p>
              </div>
            </div>
          </Card>
        </div>
      </PageSection>

      <PageSection className="grid gap-5 lg:grid-cols-3">
        {featureCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card className="space-y-4" key={card.title}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(84,107,65,0.1)] text-[var(--color-forest)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="headline text-3xl text-[var(--color-ink)]">{card.title}</h2>
                <p className="text-sm leading-7 text-[var(--color-ink-soft)]">{card.description}</p>
              </div>
            </Card>
          );
        })}
      </PageSection>
    </div>
  );
}
