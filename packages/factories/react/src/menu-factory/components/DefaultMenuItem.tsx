import React from 'react';
import { useOptionalMenuContext } from '../context';

export interface DefaultMenuItemProps {
  label: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  /**
   * Marks this item as the one matching the current page, exposed as
   * `aria-current="page"`. Without it a screen reader user has no way to tell
   * where they are in the menu — the visual highlight alone is not announced.
   */
  active?: boolean;
  onSelect?: (payload: { href?: string; label: string }) => void;
  'data-test-id'?: string;
}

export function DefaultMenuItem({
  label,
  href,
  icon,
  disabled,
  active,
  onSelect,
  'data-test-id': dataTestId,
}: DefaultMenuItemProps) {
  const menuContext = useOptionalMenuContext();
  const isActive = menuContext ? menuContext.activeItem === dataTestId : active === true;

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (onSelect) {
      // stopPropagation avoids delegated router listeners (e.g. VitePress,
      // Next.js Link capture) picking up the click after we cancel the default
      // browser navigation. Without it, some hosts still trigger client-side
      // routing even though preventDefault was called on the native event.
      event.preventDefault();
      event.stopPropagation();
      onSelect({ href, label });
    }
  };

  const content = (
    <>
      {icon ? (
        <span aria-hidden="true" style={{ marginRight: '8px' }}>
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </>
  );

  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '4px',
    color: disabled ? 'var(--schepta-text-3)' : 'var(--schepta-text-1)',
    textDecoration: 'none',
    fontSize: '14px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: disabled ? 'not-allowed' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
  };

  return (
    <li data-schepta-menu-item="true" style={{ listStyle: 'none' }}>
      {href ? (
        <a
          href={href}
          onClick={handleClick}
          aria-disabled={disabled || undefined}
          aria-current={isActive ? 'page' : undefined}
          // `pointer-events: none` alone stops the mouse but leaves the link
          // in the tab order, so a keyboard user could still focus and
          // activate a disabled item.
          tabIndex={disabled ? -1 : undefined}
          data-test-id={dataTestId}
          // `target` opts the link out of host client-side routers (e.g.
          // VitePress' window-capture click handler), which otherwise navigate
          // before our React onClick handler gets a chance to preventDefault.
          {...(onSelect ? { target: '_self' } : {})}
          style={style}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          aria-current={isActive ? 'page' : undefined}
          data-test-id={dataTestId}
          style={style}
        >
          {content}
        </button>
      )}
    </li>
  );
}
