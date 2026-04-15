import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { useAuth } from '@/features/auth/session/use-auth';
import { ApiError } from '@/shared/api/api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';

const loginSchema = z.object({
  email: z.string().trim().email('Vui lòng nhập email hợp lệ.'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const nextPath = location.state?.from?.pathname || '/app';

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (field === 'email' || field === 'password') {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    try {
      await auth.login(parsed.data);
      navigate(nextPath, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError('Không thể đăng nhập lúc này. Vui lòng thử lại sau ít phút.');
    }
  });

  return (
    <AuthShell
      description="Đăng nhập để tiếp tục với dashboard, trạng thái chuyến đi và hồ sơ cá nhân của bạn."
      eyebrow="Dang nhap"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link className="font-semibold text-[var(--color-forest)]" to="/auth/register">
            Tạo tài khoản mới
          </Link>
        </>
      }
      title="Tro lai voi hanh trinh dang dang do"
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthStatusBanner message={auth.notice} tone={auth.noticeTone} />
        <AuthStatusBanner message={submitError} tone="danger" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="login-email">
            Email
          </label>
          <Input
            hasError={Boolean(errors.email)}
            id="login-email"
            placeholder="you@example.com"
            type="email"
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-[var(--color-danger)]">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="login-password">
            Mật khẩu
          </label>
          <PasswordInput
            hasError={Boolean(errors.password)}
            id="login-password"
            placeholder="Nhap mat khau cua ban"
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.password.message}</p>
          ) : null}
        </div>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Dang dang nhap...' : 'Dang nhap'}
        </Button>
      </form>
    </AuthShell>
  );
}
