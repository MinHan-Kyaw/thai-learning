import { Link, type LinkProps } from 'react-router';

import { classNames } from '../../helpers/classNames';

import { getButtonClassName, type ButtonVariant } from './className';

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const ButtonLink = ({ variant = 'primary', fullWidth = false, className, ...props }: ButtonLinkProps) => (
  <Link className={classNames(getButtonClassName(variant, fullWidth), className)} {...props} />
);

export default ButtonLink;
