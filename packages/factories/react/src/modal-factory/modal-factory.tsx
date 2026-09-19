/**
 * React Modal Factory
 *
 * Renders a dialog / modal from a JSON schema. The schema describes the
 * dialog's layout (header / body / footer slots, size, dismissibility)
 * while open state is controlled by the consumer via the `open` prop or
 * the imperative ref API.
 *
 * Follows the same pattern as TableFactory / TabsFactory: dynamic state
 * (`isOpen`) lives in a dedicated `ModalContext` shared with the default
 * components, so the orchestrator's static subtree cache stays valid
 * while the dialog still reacts to open / close.
 */

import React, { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ComponentSpec, MiddlewareFn } from '@schepta/core';
import modalSchemaDefinition from '@schepta/factories/schemas/modal-schema.json';
import {
  createReactFactory,
  type FactoryBaseProps,
  type FactorySetupHook,
} from '../create-factory';
import { defaultModalComponents } from './defaults';
import {
  ModalProvider,
  type ModalContextValue,
  type ModalSize,
} from './context';

export type { ModalSize };

export interface ModalFactoryRef {
  /** Opens the dialog. */
  open: () => void;
  /** Closes the dialog. */
  close: () => void;
  /** Toggles the dialog. */
  toggle: () => void;
  /** Reads the current open state. */
  isOpen: () => boolean;
}

export interface ModalFactoryProps extends FactoryBaseProps {
  components?: Record<string, ComponentSpec>;
  customComponents?: Record<string, ComponentSpec>;
  renderers?: Partial<Record<string, any>>;
  externalContext?: Record<string, any>;
  middlewares?: MiddlewareFn[];
  /**
   * Controlled open state. When provided, the factory is in controlled mode
   * and ignores the imperative `open`/`close` unless the consumer updates
   * `open` in the `onOpenChange` handler.
   */
  open?: boolean;
  /** Initial open state (uncontrolled). Defaults to `false`. */
  defaultOpen?: boolean;
  /** Fired whenever the open state changes. */
  onOpenChange?: (open: boolean) => void;
  debug?: boolean;
}

// Tokens are ordered by the moment each modal opens, so an Escape key closes
// only the topmost open modal even when effects re-run after a parent render.
const openModalStack: object[] = [];

const useModalSetup: FactorySetupHook<ModalFactoryProps, ModalFactoryRef> = ({
  props,
}) => {
  const {
    schema,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
  } = props;

  const isControlled = controlledOpen !== undefined;
  const size: ModalSize =
    (schema?.['x-component-props']?.size as ModalSize) ?? 'md';
  const dismissible: boolean =
    schema?.['x-component-props']?.dismissible !== false;

  const [internalOpen, setInternalOpen] = useState<boolean>(defaultOpen);
  const isOpen = isControlled ? !!controlledOpen : internalOpen;

  const applyOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const modalTokenRef = useRef<object>();
  if (!modalTokenRef.current) modalTokenRef.current = {};
  const applyOpenRef = useRef(applyOpen);
  applyOpenRef.current = applyOpen;
  const dismissibleRef = useRef(dismissible);
  dismissibleRef.current = dismissible;

  const close = useCallback(() => {
    if (!isOpen) return;
    applyOpen(false);
  }, [isOpen, applyOpen]);

  const openFn = useCallback(() => {
    if (isOpen) return;
    applyOpen(true);
  }, [isOpen, applyOpen]);

  const toggle = useCallback(() => {
    applyOpen(!isOpen);
  }, [isOpen, applyOpen]);

  // Initial focus, Tab cycling and focus restoration are owned by the
  // `useFocusTrap` hook in DefaultModalContainer, which focuses the first
  // focusable child rather than the dialog itself.

  // Global ESC handler — complements the one on the backdrop so consumers
  // who render the modal at the top of the tree don't need the backdrop
  // to have focus. Every open modal registers a token; only the last token
  // handles Escape, which keeps nested modals from closing as a group.
  useEffect(() => {
    if (!isOpen) return;
    const token = modalTokenRef.current!;
    openModalStack.push(token);
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openModalStack[openModalStack.length - 1] === token) {
        event.stopPropagation();
        if (dismissibleRef.current) applyOpenRef.current(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      const index = openModalStack.indexOf(token);
      if (index >= 0) openModalStack.splice(index, 1);
    };
  }, [isOpen]);

  const baseId = useId();

  const contextValue = useMemo<ModalContextValue>(
    () => ({
      isOpen,
      dismissible,
      size,
      close,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
    }),
    [isOpen, dismissible, size, close, baseId]
  );

  const wrap = useCallback(
    (children: ReactNode) => (
      <ModalProvider value={contextValue}>{children}</ModalProvider>
    ),
    [contextValue]
  );

  const externalContext = useMemo(
    () => ({
      modal: {
        isOpen,
        size,
        dismissible,
      },
    }),
    [isOpen, size, dismissible]
  );

  const refApi = useMemo<ModalFactoryRef>(
    () => ({
      open: openFn,
      close,
      toggle,
      isOpen: () => isOpen,
    }),
    [openFn, close, toggle, isOpen]
  );

  return {
    refApi,
    externalContext,
    wrap,
  };
};

export const ModalFactory = createReactFactory<ModalFactoryProps, ModalFactoryRef>({
  displayName: 'ModalFactory',
  schemaDefinition: modalSchemaDefinition,
  rootComponentKey: 'ModalContainer',
  defaultComponents: defaultModalComponents,
  useSetup: useModalSetup,
});
