export const formatWeight = (weight: number): string => {
  return weight.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

export const formatWaste = (waste: number): string => {
  return waste.toFixed(2);
};