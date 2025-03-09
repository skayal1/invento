// Format currency in Indian Rupees
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
};

// Format date to a readable format
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format categories display text
export const formatCategoryPath = (categoryName: string, subCategoryName?: string): string => {
  if (subCategoryName) {
    return `${categoryName} > ${subCategoryName}`;
  }
  return categoryName;
};