import React from 'react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Base props common to both button and anchor
interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

// Props specific to anchor element (when href is present)
type LinkButtonProps = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps | 'href'> & {
  href: string; // href is required for LinkButtonProps
  type?: never; // Cannot have button type
};

// Props specific to button element (when href is NOT present)
type NativeButtonProps = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
  href?: never; // href is disallowed for NativeButtonProps
  type?: 'button' | 'submit' | 'reset';
};

// Combined type using discriminated union based on href
type ButtonProps = LinkButtonProps | NativeButtonProps;

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    as: ComponentProp, // Rename to avoid conflict with component variable
    disabled, // Destructure disabled here
    ...props // All other props (specific to button or anchor)
  }, ref) => {

    // Determine the component type based on whether href is passed
    const Component = ComponentProp || (props.href ? 'a' : 'button');

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary:
        'bg-primary text-white hover:bg-primary-dark focus:ring-primary border border-transparent',
      secondary:
        'bg-secondary text-neutral-900 hover:bg-secondary-dark hover:text-white focus:ring-secondary border border-transparent dark:bg-secondary-dark dark:text-neutral-100 dark:hover:bg-secondary',
      accent:
        'bg-accent text-white hover:bg-accent-dark focus:ring-accent border border-transparent',
      outline:
        'border border-primary text-primary bg-transparent hover:bg-primary/10 focus:ring-primary dark:border-primary dark:text-primary dark:hover:bg-primary/20',
      ghost:
        'text-primary hover:bg-primary/10 focus:ring-primary dark:text-primary dark:hover:bg-primary/20 border border-transparent',
      link:
        'text-primary hover:text-primary-dark focus:outline-none focus:underline dark:text-primary dark:hover:text-primary-dark border border-transparent shadow-none px-0 py-0',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      icon: 'p-2',
    };

    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      icon: 'w-5 h-5',
    };

    const buttonClasses = twMerge(
      clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )
    );

    const content = (
      <>
        {leftIcon && React.cloneElement(leftIcon, { className: twMerge(clsx("inline-block", iconSize[size], rightIcon ? 'mr-2' : '')) })}
        {(size !== 'icon' || children) && <span className="inline-block">{children}</span>}
        {rightIcon && React.cloneElement(rightIcon, { className: twMerge(clsx("inline-block", iconSize[size], leftIcon ? 'ml-2' : '')) })}
      </>
    );

    if (props.href) {
      // Extract props specifically for the <a> tag, exclude ButtonProps
      const { href, as, ...anchorProps } = props as LinkButtonProps;
      return (
        <Link href={href} passHref legacyBehavior>
          {/* Forward the ref to the underlying <a> tag */}
          <a ref={ref as React.Ref<HTMLAnchorElement>} className={buttonClasses} {...anchorProps}>
            {content}
          </a>
        </Link>
      );
    }

    // Handle rendering as a standard button
    // Extract props specifically for the <button> tag, exclude ButtonProps
    const { as, ...nativeButtonProps } = props as NativeButtonProps;
    return (
      <Component
        ref={ref as React.Ref<HTMLButtonElement>} // Forward ref to button/component
        className={buttonClasses}
        disabled={disabled} // Pass disabled prop explicitly
        type={nativeButtonProps.type || 'button'} // Default type if not provided
        {...nativeButtonProps} // Pass remaining native button props
      >
        {content}
      </Component>
    );
  }
);

// Add display name for easier debugging
Button.displayName = 'Button';

export default Button;