/**
 * @schepta/factory-react
 * 
 * React factories for schepta rendering engine.
 * No external form library dependencies (react-hook-form, formik, etc.)
 * 
 * Users can integrate form libraries by creating custom components.
 * See showcases/react/src/basic-ui/components/rhf/ for RHF integration.
 * See showcases/react/src/basic-ui/components/formik/ for Formik integration.
 */

// Main factory
export {
  FormFactory,
  type FormFactoryProps,
  type FormFactoryRef,
} from './form-factory';

// Factory primitive for building custom factories
export {
  createReactFactory,
  useScheptaOrchestrator,
  type CreateReactFactoryConfig,
  type FactoryBaseProps,
  type FactorySetupContext,
  type FactorySetupHook,
  type FactorySetupReturn,
  type UseScheptaOrchestratorInput,
  type UseScheptaOrchestratorResult,
} from './create-factory';

// Built-in Menu factory (reference implementation built on createReactFactory)
export {
  MenuFactory,
  defaultMenuComponents,
  DefaultMenuContainer,
  DefaultMenuGroup,
  DefaultMenuItem,
  type MenuFactoryProps,
  type MenuFactoryRef,
  type MenuSelectionPayload,
  type DefaultMenuContainerProps,
  type DefaultMenuGroupProps,
  type DefaultMenuItemProps,
} from './menu-factory';

// Built-in Table factory
export {
  TableFactory,
  DefaultTableContainer,
  DefaultTableColumn,
  TableProvider,
  useTableContext,
  useOptionalTableContext,
  type TableFactoryProps,
  type TableFactoryRef,
  type TableSelectionPayload,
  type TableRowKeyGetter,
  type TableColumnMeta,
  type TableSortState,
  type TableSelectionMode,
  type SortDirection,
  type TableContextValue,
  type DefaultTableContainerProps,
  type DefaultTableColumnProps,
} from './table-factory';

// Built-in Layout factory (application shell: header / sidebar / main / footer)
export {
  LayoutFactory,
  defaultLayoutComponents,
  DefaultLayoutContainer,
  DefaultLayoutHeader,
  DefaultLayoutSidebar,
  DefaultLayoutMain,
  DefaultLayoutFooter,
  type LayoutFactoryProps,
  type LayoutFactoryRef,
  type LayoutVariant,
  type SidebarPosition,
  type DefaultLayoutContainerProps,
  type DefaultLayoutHeaderProps,
  type DefaultLayoutSidebarProps,
  type DefaultLayoutMainProps,
  type DefaultLayoutFooterProps,
} from './layout-factory';

// Built-in Tabs factory
export {
  TabsFactory,
  defaultTabsComponents,
  DefaultTabsContainer,
  DefaultTabPanel,
  TabsProvider,
  useTabsContext,
  useOptionalTabsContext,
  type TabsFactoryProps,
  type TabsFactoryRef,
  type TabsChangePayload,
  type TabMeta,
  type TabsOrientation,
  type TabsVariant,
  type TabsContextValue,
  type DefaultTabsContainerProps,
  type DefaultTabPanelProps,
} from './tabs-factory';

// Built-in Modal factory (dialog / confirmation)
export {
  ModalFactory,
  defaultModalComponents,
  DefaultModalContainer,
  DefaultModalHeader,
  DefaultModalBody,
  DefaultModalFooter,
  ModalProvider,
  useModalContext,
  useOptionalModalContext,
  type ModalFactoryProps,
  type ModalFactoryRef,
  type ModalSize,
  type ModalContextValue,
  type DefaultModalContainerProps,
  type DefaultModalHeaderProps,
  type DefaultModalBodyProps,
  type DefaultModalFooterProps,
} from './modal-factory';

// Components (types and defaults)
export {
  DefaultFormContainer,
  DefaultSubmitButton,
  // Field a11y contract — reuse these in custom input components so they
  // expose the same label / error / describedby wiring as the built-ins.
  useFieldA11y,
  FieldMessages,
  FormSectionProvider,
  useOptionalFormSectionContext,
  type UseFieldA11yOptions,
  type UseFieldA11yResult,
  type FieldMessagesProps,
  type FormSectionContextValue,
  type HeadingLevel,
  type FormContainerProps,
  type SubmitButtonProps,
  type SubmitButtonComponentType,
  // Input components
  DefaultInputText,
  DefaultInputSelect,
  DefaultInputCheckbox,
  DefaultInputDate,
  DefaultInputPhone,
  DefaultInputAutocomplete,
  DefaultInputTextarea,
  DefaultInputNumber,
  type InputTextProps,
  type InputTextComponentType,
  type InputSelectProps,
  type InputSelectOption,
  type InputSelectComponentType,
  type InputCheckboxProps,
  type InputCheckboxComponentType,
  type InputDateProps,
  type InputDateComponentType,
  type InputPhoneProps,
  type InputPhoneComponentType,
  type InputAutocompleteProps,
  type InputAutocompleteOption,
  type InputAutocompleteComponentType,
  type InputTextareaProps,
  type InputTextareaComponentType,
  type InputNumberProps,
  type InputNumberComponentType,
  // Container components
  DefaultFormField,
  DefaultFormSectionContainer,
  DefaultFormSectionTitle,
  DefaultFormSectionGroup,
  DefaultFormSectionGroupContainer,
  type FormFieldProps,
  type FormFieldComponentType,
  type FormSectionContainerProps,
  type FormSectionContainerComponentType,
  type FormSectionTitleProps,
  type FormSectionTitleComponentType,
  type FormSectionGroupProps,
  type FormSectionGroupComponentType,
  type FormSectionGroupContainerProps,
  type FormSectionGroupContainerComponentType,
} from './components';

// Renderers (types and defaults)
export {
  DefaultFieldRenderer,
} from './renderers';

// Context and hooks for form state management
export {
  ScheptaFormProvider,
  useScheptaFormAdapter,
  useScheptaFormValues,
  useScheptaFieldValue,
  useScheptaFieldError,
  useScheptaFormErrors,
  type ScheptaFormProviderProps,
} from './context';

// Accessibility primitives (for custom components)
export * from './a11y';

// Hooks (for advanced usage)
export * from './hooks';

// Utilities
export * from './utils';

// Re-export internal components for advanced usage
export { FormRenderer } from './form-renderer';
