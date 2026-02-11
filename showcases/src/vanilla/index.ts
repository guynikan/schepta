import { singleSpaVanilla } from './singleSpaVanilla';
import { createAppRoot } from './app';
import { vanillaStyles } from './styles';
import { attachTabBehavior } from './tabs';

const lifecycles = singleSpaVanilla({
  render() {
    const el = createAppRoot();
    attachTabBehavior(el);
    return el;
  },
  styles: vanillaStyles,
});

export const { bootstrap, mount, unmount } = lifecycles;
