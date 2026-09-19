/**
 * ModalFactory smoke tests
 *
 * Validates that ModalFactory: renders nothing while closed, renders the
 * dialog with header/body/footer when open, emits onOpenChange, closes on
 * backdrop click and ESC key when dismissible, ignores dismissal when
 * not dismissible, honors both uncontrolled (defaultOpen) and controlled
 * (open) modes, and exposes an imperative ref API.
 */

import React, { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { ModalFactory, type ModalFactoryRef } from './modal-factory';

const confirmSchema = {
  type: 'object',
  'x-component': 'ModalContainer',
  'x-component-props': {
    ariaLabel: 'Confirm',
    size: 'md',
    dismissible: true,
  },
  properties: {
    header: {
      type: 'object',
      'x-component': 'ModalHeader',
      'x-ui': { order: 1 },
      'x-component-props': {
        title: 'Delete project',
        description: 'Cannot be undone',
      },
    },
    body: {
      type: 'object',
      'x-component': 'ModalBody',
      'x-ui': { order: 2 },
      'x-content': 'Are you sure?',
    },
    footer: {
      type: 'object',
      'x-component': 'ModalFooter',
      'x-ui': { order: 3 },
      'x-component-props': { align: 'end' },
    },
  },
};

describe('ModalFactory', () => {
  it('renders nothing when closed (no backdrop, no dialog)', () => {
    render(<ModalFactory schema={confirmSchema} />);
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();
    expect(document.body.querySelector('[data-schepta-modal-backdrop="true"]')).toBeNull();
  });

  it('renders header / body / footer when defaultOpen is true', () => {
    const { getByText } = render(
      <ModalFactory schema={confirmSchema} defaultOpen />
    );
    expect(document.body.querySelector('[data-schepta-modal="true"]')).not.toBeNull();
    expect(getByText('Delete project')).toBeInTheDocument();
    expect(getByText('Cannot be undone')).toBeInTheDocument();
    expect(getByText('Are you sure?')).toBeInTheDocument();
    expect(document.body.querySelector('footer[data-schepta-modal-footer="true"]')).not.toBeNull();
  });

  it('applies the schema size to the dialog as a data attribute', () => {
    render(
      <ModalFactory
        schema={{
          ...confirmSchema,
          'x-component-props': {
            ...confirmSchema['x-component-props'],
            size: 'lg',
          },
        }}
        defaultOpen
      />
    );
    expect(
      document.body.querySelector('[data-schepta-modal="true"]')
        ?.getAttribute('data-modal-size')
    ).toBe('lg');
  });

  it('closes on backdrop click when dismissible', () => {
    const onOpenChange = vi.fn();
    render(
      <ModalFactory schema={confirmSchema} defaultOpen onOpenChange={onOpenChange} />
    );
    const backdrop = document.body.querySelector(
      '[data-schepta-modal-backdrop="true"]'
    ) as HTMLElement;
    fireEvent.mouseDown(backdrop, { target: backdrop, currentTarget: backdrop });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();
  });

  it('does not close on dialog-body click', () => {
    const onOpenChange = vi.fn();
    render(
      <ModalFactory schema={confirmSchema} defaultOpen onOpenChange={onOpenChange} />
    );
    const dialog = document.body.querySelector(
      '[data-schepta-modal="true"]'
    ) as HTMLElement;
    fireEvent.mouseDown(dialog);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-schepta-modal="true"]')).not.toBeNull();
  });

  it('does not close on backdrop click when dismissible is false', () => {
    const onOpenChange = vi.fn();
    const schema = {
      ...confirmSchema,
      'x-component-props': {
        ...confirmSchema['x-component-props'],
        dismissible: false,
      },
    };
    render(
      <ModalFactory schema={schema} defaultOpen onOpenChange={onOpenChange} />
    );
    const backdrop = document.body.querySelector(
      '[data-schepta-modal-backdrop="true"]'
    ) as HTMLElement;
    fireEvent.mouseDown(backdrop, { target: backdrop, currentTarget: backdrop });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.body.querySelector('[data-schepta-modal="true"]')).not.toBeNull();
  });

  it('closes on ESC when dismissible', () => {
    const onOpenChange = vi.fn();
    render(
      <ModalFactory schema={confirmSchema} defaultOpen onOpenChange={onOpenChange} />
    );
    const dialog = document.body.querySelector(
      '[data-schepta-modal="true"]'
    ) as HTMLElement;
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();
  });

  it('closes only the topmost modal on ESC', () => {
    const parentOnOpenChange = vi.fn();
    const childOnOpenChange = vi.fn();
    render(
      <>
        <ModalFactory
          schema={confirmSchema}
          defaultOpen
          onOpenChange={parentOnOpenChange}
        />
        <ModalFactory
          schema={confirmSchema}
          defaultOpen
          onOpenChange={childOnOpenChange}
        />
      </>
    );

    const dialogs = document.body.querySelectorAll('[data-schepta-modal="true"]');
    const childDialog = dialogs[1] as HTMLElement;
    fireEvent.keyDown(childDialog, { key: 'Escape' });
    expect(childOnOpenChange).toHaveBeenLastCalledWith(false);
    expect(parentOnOpenChange).not.toHaveBeenCalled();
    expect(document.body.querySelectorAll('[data-schepta-modal="true"]')).toHaveLength(1);

    const parentDialog = document.body.querySelector(
      '[data-schepta-modal="true"]'
    ) as HTMLElement;
    fireEvent.keyDown(parentDialog, { key: 'Escape' });
    expect(parentOnOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();
  });

  it('closes when clicking the header close button', () => {
    const onOpenChange = vi.fn();
    render(
      <ModalFactory schema={confirmSchema} defaultOpen onOpenChange={onOpenChange} />
    );
    const closeBtn = document.body.querySelector(
      '[data-test-id="modal-close"]'
    ) as HTMLElement;
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();
  });

  it('supports the ref API to open / close / toggle / read state', () => {
    const ref = createRef<ModalFactoryRef>();
    const onOpenChange = vi.fn();
    render(
      <ModalFactory ref={ref} schema={confirmSchema} onOpenChange={onOpenChange} />
    );

    expect(ref.current?.isOpen()).toBe(false);

    act(() => ref.current?.open());
    expect(ref.current?.isOpen()).toBe(true);
    expect(document.body.querySelector('[data-schepta-modal="true"]')).not.toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    act(() => ref.current?.close());
    expect(ref.current?.isOpen()).toBe(false);
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();

    act(() => ref.current?.toggle());
    expect(ref.current?.isOpen()).toBe(true);
    act(() => ref.current?.toggle());
    expect(ref.current?.isOpen()).toBe(false);
  });

  it('respects controlled mode (open prop wins over internal state)', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ModalFactory schema={confirmSchema} open={false} onOpenChange={onOpenChange} />
    );
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();

    rerender(
      <ModalFactory schema={confirmSchema} open={true} onOpenChange={onOpenChange} />
    );
    expect(document.body.querySelector('[data-schepta-modal="true"]')).not.toBeNull();

    // ref.close() in controlled mode should emit the change but the open
    // state only updates when the parent re-renders with open={false}.
    rerender(
      <ModalFactory schema={confirmSchema} open={false} onOpenChange={onOpenChange} />
    );
    expect(document.body.querySelector('[data-schepta-modal="true"]')).toBeNull();
  });

  it('hides the close button when showCloseButton=false on the header', () => {
    const schema = {
      ...confirmSchema,
      properties: {
        ...confirmSchema.properties,
        header: {
          ...confirmSchema.properties.header,
          'x-component-props': {
            ...confirmSchema.properties.header['x-component-props'],
            showCloseButton: false,
          },
        },
      },
    };
    render(
      <ModalFactory schema={schema} defaultOpen />
    );
    expect(document.body.querySelector('[data-test-id="modal-close"]')).toBeNull();
  });

  it('hides the close button when the modal is not dismissible', () => {
    const schema = {
      ...confirmSchema,
      'x-component-props': {
        ...confirmSchema['x-component-props'],
        dismissible: false,
      },
    };
    render(<ModalFactory schema={schema} defaultOpen />);
    expect(document.body.querySelector('[data-test-id="modal-close"]')).toBeNull();
  });
});
