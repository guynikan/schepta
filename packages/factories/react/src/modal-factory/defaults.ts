import { createComponentSpec, type ComponentSpec } from '@schepta/core';
import {
  DefaultModalContainer,
  DefaultModalHeader,
  DefaultModalBody,
  DefaultModalFooter,
} from './components';

export const defaultModalComponents: Record<string, ComponentSpec> = {
  ModalContainer: createComponentSpec({
    id: 'ModalContainer',
    type: 'modal-container',
    component: () => DefaultModalContainer,
  }),
  ModalHeader: createComponentSpec({
    id: 'ModalHeader',
    type: 'modal-slot',
    component: () => DefaultModalHeader,
  }),
  ModalBody: createComponentSpec({
    id: 'ModalBody',
    type: 'modal-slot',
    component: () => DefaultModalBody,
  }),
  ModalFooter: createComponentSpec({
    id: 'ModalFooter',
    type: 'modal-slot',
    component: () => DefaultModalFooter,
  }),
};
