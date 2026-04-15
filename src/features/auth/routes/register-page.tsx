import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AuthStatusBanner } from '@/features/auth/components/auth-status-banner';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { useAuth } from '@/features/auth/session/use-auth';
import { ApiError } from '@/shared/api/api-error';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';

const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự.')
    .max(50, 'Tên hiển thị quá dài.'),
  email: z.string().trim().email('Vui lòng nhập email hợp lệ.'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự.')
    .regex(/[A-Za-z]/, 'Mật khẩu cần có ít nhất 1 chữ cái.')
    .regex(/[0-9]/, 'Mật khẩu cần có ít nhất 1 chữ số.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    const parsed = registerSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];

        if (field === 'displayName' || field === 'email' || field === 'password') {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    try {
      await auth.register(parsed.data);
      navigate('/app', { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }

      setSubmitError('Không thể tạo tài khoản lúc này. Vui lòng thử lại sau ít phút.');
    }
  });

  return (
    <AuthShell
      description="Tạo tài khoản để lưu ý tưởng, lên kế hoạch chuyến đi và đồng bộ phiên làm việc thật với backend hiện tại."
      eyebrow="Tao tai khoan"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link className="font-semibold text-[var(--color-forest)]" to="/auth/login">
            Đăng nhập
          </Link>
        </>
      }
      title="Bat dau mot hanh trinh duoc sap xep ro rang"
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <AuthStatusBanner message={submitError} tone="danger" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="register-display-name">
            Tên hiển thị
          </label>
          <Input
            hasError={Boolean(errors.displayName)}
            id="register-display-name"
            placeholder="Bui Co Journey"
            type="text"
            {...register('displayName')}
          />
          {errors.displayName ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.displayName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="register-email">
            Email
          </label>
          <Input
            hasError={Boolean(errors.email)}
            id="register-email"
            placeholder="you@example.com"
            type="email"
            {...register('email')}
          />
          {errors.email ? <p className="text-sm text-[var(--color-danger)]">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-ink)]" htmlFor="register-password">
            Mật khẩu
          </label>
          <PasswordInput
            hasError={Boolean(errors.password)}
            id="register-password"
            placeholder="Toi thieu 8 ky tu, gom chu va so"
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-sm text-[var(--color-danger)]">{errors.password.message}</p>
          ) : null}
        </div>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Dang tao tai khoan...' : 'Tao tai khoan'}
        </Button>
      </form>
    </AuthShell>
  );
}
