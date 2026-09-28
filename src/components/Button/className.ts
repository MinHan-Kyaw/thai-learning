import { classNames } from '../../helpers/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

const BASE_CLASS_NAME =
  'inline-flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-8 py-3 text-[1.0625rem] font-extrabold tracking-[0.02em] no-underline transition-[transform,box-shadow,background-color] duration-100 active:translate-y-[3px] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-line disabled:text-ink-muted disabled:shadow-edge-strong disabled:active:translate-y-0';

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand text-white shadow-edge-brand-dark hover:bg-brand-dark',
  secondary: 'border-line-strong bg-surface text-brand shadow-edge-strong hover:bg-brand-light',
  danger: 'border-transparent bg-error text-white shadow-edge-error-dark',
};

export const getButtonClassName = (variant: ButtonVariant, fullWidth = false): string =>
  classNames(BASE_CLASS_NAME, VARIANT_CLASS_NAMES[variant], fullWidth && 'w-full');
