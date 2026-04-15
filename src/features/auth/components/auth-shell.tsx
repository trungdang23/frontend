import { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/card';

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  footer: ReactNode;
}>;

export function AuthShell({ children, description, eyebrow, footer, title }: AuthShellProps) {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid lg:grid-cols-[1.2fr_0.9fr]">
        <section className="hidden flex-col justify-between rounded-[2rem] bg-[rgba(84,107,65,0.92)] p-10 text-white shadow-[var(--shadow-soft)] lg:flex">
          <div className="space-y-5">
            <Link className="headline text-4xl" to="/">
              Journey
            </Link>
            <p className="max-w-md text-sm uppercase tracking-[0.25em] text-white/65">
              Bản ghi nhớ cho những chuyến đi nhiều cảm hứng
            </p>
          </div>

          <div className="space-y-4">
            <p className="headline max-w-lg text-5xl leading-tight">
              Lên kế hoạch, giữ cảm hứng, và trở về với một hành trình còn nguyên ký ức.
            </p>
            <p className="max-w-md text-base leading-7 text-white/78">
              Trải nghiệm phase đầu tập trung vào auth, dashboard rỗng có chủ đích và nền tảng
              sẵn sàng cho trips sau khi backend hoàn thiện.
            </p>
          </div>
        </section>

        <Card className="mx-auto w-full max-w-xl">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-forest)]">
                {eyebrow}
              </p>
              <div className="space-y-2">
                <h1 className="headline text-4xl text-[var(--color-ink)]">{title}</h1>
                <p className="text-sm leading-7 text-[var(--color-ink-soft)]">{description}</p>
              </div>
            </div>
            {children}
            <div className="border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-ink-soft)]">
              {footer}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
