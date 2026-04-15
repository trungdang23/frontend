import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getButtonClasses } from '@/shared/ui/button-styles';
import { EmptyState } from '@/shared/ui/empty-state';

export function TripsPlaceholderPage() {
  const location = useLocation();

  return (
    <EmptyState
      action={
        <Link className={getButtonClasses()} to="/app">
          <span className="inline-flex items-center gap-2">
            Quay lại dashboard
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      }
      description={`Route ${location.pathname} đã được chốt để frontend không phải sửa router về sau. Màn hình này đang chờ backend phase trips trước khi mở form và dữ liệu thật.`}
      eyebrow="Blocked by backend"
      title="Trips workspace đang chờ contract production"
    />
  );
}
