import type { InputHTMLAttributes } from 'react';

type AuthFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  | 'autoComplete'
  | 'disabled'
  | 'inputMode'
  | 'maxLength'
  | 'minLength'
  | 'name'
  | 'pattern'
  | 'required'
  | 'type'
>;

export function AuthField({
  autoComplete,
  disabled,
  id,
  inputMode,
  label,
  maxLength,
  minLength,
  name,
  onChange,
  pattern,
  required,
  type,
  value,
}: AuthFieldProps) {
  return (
    <label
      className="flex flex-col gap-1 font-hand text-[1.7rem] leading-none text-[#231813] sm:text-[2.1rem]"
      htmlFor={id}
    >
      <span className="px-1">{label}</span>
      <input
        autoComplete={autoComplete}
        className="auth-line-input"
        disabled={disabled}
        id={id}
        inputMode={inputMode}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        onChange={onChange}
        pattern={pattern}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}
