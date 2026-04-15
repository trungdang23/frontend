import { Link } from 'react-router-dom';
import { SiteHeader } from '@/shared/ui/site-header';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { Card } from '@/shared/ui/card';
import { PageSection } from '@/shared/ui/page-section';

const featuredPosts = [
  {
    id: 'ha-giang-spring-loop',
    title: 'Một vòng Hà Giang yên chậm trong 4 ngày',
    summary: 'Bản teaser cho phase community, giữ vai trò định hướng visual trước khi backend feed thật sẵn sàng.',
  },
  {
    id: 'hue-food-notes',
    title: 'Checklist ăn uống ở Huế cho người đi cuối tuần',
    summary: 'Nội dung read-only tạm thời, không giả vờ là feed production có tương tác thật.',
  },
];

export function CommunityPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageSection className="pt-12">
        <Card className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-forest)]">
            Community teaser
          </p>
          <h1 className="headline text-4xl text-[var(--color-ink)]">Góc cảm hứng cộng đồng</h1>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
            Phase hiện tại chỉ mở read-only teaser để giữ nhịp thị giác của sản phẩm. Feed, like,
            comment và detail production sẽ nối API thật sau khi backend phase community hoàn thiện.
          </p>
        </Card>
      </PageSection>

      <PageSection className="grid gap-5 lg:grid-cols-2">
        {featuredPosts.map((post) => (
          <Card className="space-y-4" key={post.id}>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(84,107,65,0.95),rgba(153,173,122,0.75))] p-8 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">Sample story</p>
              <h2 className="headline mt-3 text-3xl">{post.title}</h2>
            </div>
            <p className="text-sm leading-7 text-[var(--color-ink-soft)]">{post.summary}</p>
            <Link className={getButtonClasses()} to={`/community/${post.id}`}>
              Xem bản ghi chú
            </Link>
          </Card>
        ))}
      </PageSection>
    </div>
  );
}
