import type { KairosPlugin } from '../../core/types/plugin.js';
import enginePlugin from './engine.js';

// Simple wrapper that re-exports engine functionality
const holidayPlugin: KairosPlugin = enginePlugin;

export default holidayPlugin;
