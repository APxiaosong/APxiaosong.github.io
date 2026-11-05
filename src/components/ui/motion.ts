/** 系统是否开启了「减弱动态效果」。开启时，脚本中的动画和平滑滚动应当直接呈现结果 */
export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
