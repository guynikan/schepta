<template>
  <div>
    <div
      style="
        margin-bottom: 24px;
        padding: 20px;
        background: var(--schepta-bg-soft);
        border: 1px solid var(--schepta-border);
        border-radius: 8px;
      "
    >
      <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 18px; font-weight: 600; color: var(--schepta-text-1)">
        What you can see in this form:
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8">
        <li style="margin-bottom: 8px">
          <strong>Custom Components (x-custom):</strong> Social Name field with toggle behavior
        </li>
        <li style="margin-bottom: 8px">
          <strong>Template Expressions:</strong> Conditional visibility (spouseName appears when
          maritalStatus is 'married')
        </li>
        <li style="margin-bottom: 8px">
          <strong>Disabled Fields:</strong> Enrollment field is disabled
        </li>
        <li style="margin-bottom: 8px">
          <strong>Required Fields:</strong> Email, Phone, First Name, Last Name, Accept Terms
        </li>
        <li style="margin-bottom: 8px">
          <strong>Grid Layout:</strong> 2-column grid with full-width fields (socialName, spouseName)
        </li>
        <li style="margin-bottom: 8px">
          <strong>Input Types:</strong> Text, Phone, Select, Date, Textarea, Checkbox
        </li>
        <li style="margin-bottom: 8px">
          <strong>Sections:</strong> Organized with section containers and titles
          <ul style="margin-top: 4px; margin-bottom: 4px">
            <li>
              <strong>User Information</strong> contains two subsections:
              <ul style="margin-top: 4px">
                <li><strong>basicInfo:</strong> enrollment, firstName, lastName, socialName, userType, birthDate, maritalStatus, spouseName</li>
                <li><strong>additionalInfo:</strong> bio, acceptTerms</li>
              </ul>
            </li>
          </ul>
        </li>
        <li style="margin-bottom: 8px">
          <strong>Field Ordering:</strong> Custom order via x-ui.order
        </li>
        <li style="margin-bottom: 8px">
          <strong>Initial Values:</strong> Pre-filled enrollment value
        </li>
        <li style="margin-bottom: 8px">
          <strong>External Context:</strong> State management for custom components
        </li>
      </ul>
    </div>
    <div
      style="
        border: 1px solid var(--schepta-border);
        padding: 24px;
        border-radius: 8px;
      "
    >
      <FormFactory
        :schema="schema"
        :initial-values="initialValues"
        :custom-components="customComponents"
        :external-context="externalContext"
        :on-submit="handleSubmit"
        :debug="true"
      />
    </div>
    <div
      v-if="submittedValues"
      style="
        margin-top: 24px;
        padding: 16px;
        background: var(--schepta-bg-soft);
        border: 1px solid var(--schepta-border);
        border-radius: 8px;
      "
    >
      <h3 style="margin-top: 0; color: var(--schepta-text-1)">Submitted Values:</h3>
      <pre
        style="
          background: var(--schepta-bg);
          padding: 12px;
          border-radius: 4px;
          overflow: auto;
          font-size: 13px;
        "
      >
        {{ JSON.stringify(submittedValues, null, 2) }}
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FormFactory } from '@schepta/factory-vue';
import { generateValidationSchema, createComponentSpec, type FormSchema } from '@schepta/core';
import SocialNameInput from './SocialNameInput.vue';

const props = defineProps<{
  schema: FormSchema;
}>();

const submittedValues = ref<Record<string, any> | null>(null);
const openSocialName = ref(false);

const initialValues = computed(() => {
  const { initialValues: schemaInitialValues } = generateValidationSchema(props.schema);
  return {
    ...schemaInitialValues,
    userInfo: {
      enrollment: '8743',
    },
  };
});

const customComponents = computed(() => ({
  socialName: createComponentSpec({
    id: 'socialName',
    type: 'field',
    component: () => SocialNameInput,
  }),
}));

const externalContext = computed(() => ({
  openSocialName: openSocialName.value,
  setOpenSocialName: (value: boolean) => {
    openSocialName.value = value;
  },
}));

const handleSubmit = (values: Record<string, any>) => {
  console.log('Form submitted:', values);
  submittedValues.value = values;
};
</script>
