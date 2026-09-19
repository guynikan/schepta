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

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
  useOptionalModalContext,
  type ModalContextValue,
  type ModalSize,
} from './context';
import {
  focusTopmostModal,
  getTopmostModal,
  hasModalContainer,
  registerModal,
} from '../a11y/modal-stack';

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

  const stackTokenRef = useRef<object>();
  if (!stackTokenRef.current) stackTokenRef.current = {};
  const parentModalContext = useOptionalModalContext();
  const parentStackToken = parentModalContext?.stackToken;

  const applyOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const applyOpenRef = useRef(applyOpen);
  const dismissibleRef = useRef(dismissible);
  applyOpenRef.current = applyOpen;
  dismissibleRef.current = dismissible;

  // Register every open modal, including custom ModalContainers. The default
  // container attaches its DOM node to this same entry for focus-aware stack
  // ordering; custom containers still retain Escape dismissal via this hook.
  useEffect(() => {
    if (!isOpen) return;
    const token = stackTokenRef.current!;
    const unregister = registerModal(
      token,
      () => {
        if (dismissibleRef.current) applyOpenRef.current(false);
      },
      parentStackToken
    );
    return () => {
      if (!unregister()) return;
      // Custom containers do not use useFocusTrap, so restore focus here when
      // one closes beneath a still-open default container.
      focusTopmostModal();
    };
  }, [isOpen, parentStackToken]);

  useEffect(() => {
    if (!isOpen) return;
    const token = stackTokenRef.current!;
    const handleKeyDown = (event: KeyboardEvent) => {
      // The default container handles Escape on its dialog so React can stop
      // the event before it reaches another modal. This listener is the
      // fallback for custom containers, which do not render that handler.
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      const topmost = getTopmostModal();
      if (hasModalContainer(token)) return;
      if (!topmost || topmost.token !== token) return;
      event.stopPropagation();
      event.stopImmediatePropagation();
      topmost.onEscape();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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

  const baseId = useId();

  const contextValue = useMemo<ModalContextValue>(
    () => ({
      isOpen,
      dismissible,
      size,
      close,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
      stackToken: stackTokenRef.current!,
      parentStackToken,
    }),
    [isOpen, dismissible, size, close, baseId, parentStackToken]
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
