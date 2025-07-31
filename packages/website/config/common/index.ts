import yaml from 'js-yaml';
import YAML_CONFIG from './common.yaml?raw';

export const CONFIG = yaml.load(YAML_CONFIG) as { [key: string]: any };

// 风格切换
export const APPEARANCE_KEY = 'ascend-theme-appearance';
