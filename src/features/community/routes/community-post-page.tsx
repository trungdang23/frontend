import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/shared/ui/site-header';
import { Card } from '@/shared/ui/card';
import { PageSection } from '@/shared/ui/page-section';

export function CommunityPostPage() {
  const { postId } = useParams();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <PageSection className="pt-12">
        <Card className="space-y-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-forest)]"
            to="/community"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại cộng đồng
          </Link>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-forest)]">
              Community detail placeholder
            </p>
            <h1 className="headline text-4xl text-[var(--color-ink)]">
              Bài viết mẫu: {postId || 'post'}
            </h1>
          </div>
          <p className="max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
            Route detail đã được chốt để sau này nối API thật mà không cần đổi cấu trúc router. Ở
            phase này màn hình chỉ đóng vai trò giữ chỗ có chủ đích, không phát sinh tương tác giả.
          </p>
        </Card>
      </PageSection>
    </div>
  );
}
