import type { ButtonHTMLAttributes } from 'react';

import { classNames } from '../../helpers/classNames';

import { getButtonClassName, type ButtonVariant } from './className';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const Button = ({ variant = 'primary', fullWidth = false, type = 'button', className, ...props }: ButtonProps) => (
  <button
    type={type}
    className={classNames(getButtonClassName(variant, fullWidth), className)}
    data-variant={variant}
    {...props}
  />
);

export default Button;
