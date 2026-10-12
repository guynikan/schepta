import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ReactRuntimeAdapter } from './runtime-adapter';

describe('ReactRuntimeAdapter.create', () => {
  it('passes component props through untouched', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new ReactRuntimeAdapter();
    const received: Record<string, any>[] = [];
    const Host = (props: Record<string, any>) => { received.push(props); return <span>{props['x-content']}</span>; };
    const props = {
      'x-content': 'Title',
      'x-component-props': { variant: 'outlined', helperText: 'help' },
      externalContext: { user: 'u' },
      schema: { type: 'string' },
      variant: 'outlined',
      fullWidth: true,
      sx: { m: 1 },
      columns: '1fr 1fr',
    };

    const { container } = render(<>{adapter.create({ id: 'host', type: 'content', component: () => Host } as any, props) as React.ReactNode}</>);

    expect(container.textContent).toBe('Title');
    expect(received[0]).toEqual(props);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('does not hand schema-controlled ref and key to React', () => {
    const adapter = new ReactRuntimeAdapter();
    const Host = () => <span>ok</span>;

    expect(() => render(
      <>{adapter.create({ id: 'host', type: 'content', component: () => Host } as any, { ref: 'schema-ref', key: 'schema-key' }) as React.ReactNode}</>
    )).not.toThrow();
  });
});
