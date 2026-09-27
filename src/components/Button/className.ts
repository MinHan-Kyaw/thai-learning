import { classNames } from '../../helpers/classNames';

import styles from './index.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export const getButtonClassName = (variant: ButtonVariant, fullWidth = false): string =>
  classNames(styles.button, styles[variant], fullWidth && styles.fullWidth);
