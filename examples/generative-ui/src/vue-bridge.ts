import { createApp, defineComponent, h, type Component } from 'vue';
import { createVuetify } from 'vuetify';
import { VueVuetifyUiSpecRenderer } from '@schepta/renderer-vue-vuetify';
import type { UiSpec } from '@schepta/core';
import 'vuetify/styles';

interface VueBridgeProps {
  spec: UiSpec;
  onSubmit: () => void;
  success?: string;
}

const VueBridge: Component = defineComponent({
  name: 'VueBridge',
  props: {
    spec: { type: Object, required: true },
    onSubmit: { type: Function, required: true },
    success: { type: String, required: false },
  },
  setup(props) {
    return () => h(VueVuetifyUiSpecRenderer, {
      spec: props.spec as UiSpec,
      success: props.success,
      actionHandlers: {
        submit_prompt: () => props.onSubmit(),
      },
    });
  },
});

export function mountVueRenderer(element: HTMLElement, props: VueBridgeProps): () => void {
  const app = createApp(VueBridge, props as unknown as Record<string, unknown>);
  app.use(createVuetify());
  app.mount(element);
  return () => app.unmount();
}
