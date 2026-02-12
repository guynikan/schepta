/**
 * Default FormSectionTitle Component for Vue
 *
 * Section title (x-content).
 */

import { defineComponent, h, type PropType } from 'vue';

export const DefaultFormSectionTitle = defineComponent({
  name: 'DefaultFormSectionTitle',
  props: {
    'x-content': String,
  },
  setup(props, { slots }) {
    return () =>
      h(
        'h2',
        {
          style: {
            marginBottom: '16px',
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--schepta-text-1)',
          },
        },
        props['x-content'] ?? slots.default?.()
      );
  },
});
