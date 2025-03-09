import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toast } from 'sonner-native';

// Type definitions
export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  price: number;
  quantity: number;
  createdAt: number;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  date: number;
}

interface InventorySummary {
  totalItems: number;
  totalValue: number;
  categoryBreakdown: {
    [categoryId: string]: {
      count: number;
      value: number;
      subCategories: {
        [subCategoryId: string]: {
          count: number;
          value: number;
        }
      }
    }
  };
}

interface RevenueSummary {
  totalSales: number;
  totalRevenue: number;
  todaySales: number;
  todayRevenue: number;
}

interface DataContextType {
  categories: Category[];
  products: Product[];
  sales: Sale[];
  inventorySummary: InventorySummary;
  revenueSummary: RevenueSummary;
  addCategory: (name: string) => void;
  addSubCategory: (categoryId: string, name: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'totalAmount'>) => void;
  getProductById: (id: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getSubCategoryById: (id: string) => SubCategory | undefined;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getSubCategoriesByCategoryId: (categoryId: string) => SubCategory[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary>({
    totalItems: 0,
    totalValue: 0,
    categoryBreakdown: {}
  });
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary>({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0
  });

  // Load data from AsyncStorage on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCategories = await AsyncStorage.getItem('categories');
        const storedProducts = await AsyncStorage.getItem('products');
        const storedSales = await AsyncStorage.getItem('sales');

        if (storedCategories) setCategories(JSON.parse(storedCategories));
        if (storedProducts) setProducts(JSON.parse(storedProducts));
        if (storedSales) setSales(JSON.parse(storedSales));
      } catch (error) {
        toast.error('Failed to load data');
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Update local storage whenever data changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('categories', JSON.stringify(categories));
        await AsyncStorage.setItem('products', JSON.stringify(products));
        await AsyncStorage.setItem('sales', JSON.stringify(sales));
      } catch (error) {
        toast.error('Failed to save data');
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [categories, products, sales]);

  // Calculate inventory summary whenever products change
  useEffect(() => {
    const summary: InventorySummary = {
      totalItems: 0,
      totalValue: 0,
      categoryBreakdown: {}
    };

    products.forEach(product => {
      // Skip products with zero quantity
      if (product.quantity <= 0) return;

      // Add to total counts
      summary.totalItems += product.quantity;
      summary.totalValue += product.price * product.quantity;

      // Initialize category if needed
      if (!summary.categoryBreakdown[product.categoryId]) {
        summary.categoryBreakdown[product.categoryId] = {
          count: 0,
          value: 0,
          subCategories: {}
        };
      }

      // Update category counts
      summary.categoryBreakdown[product.categoryId].count += product.quantity;
      summary.categoryBreakdown[product.categoryId].value += product.price * product.quantity;

      // Initialize subcategory if needed
      if (!summary.categoryBreakdown[product.categoryId].subCategories[product.subCategoryId]) {
        summary.categoryBreakdown[product.categoryId].subCategories[product.subCategoryId] = {
          count: 0,
          value: 0
        };
      }

      // Update subcategory counts
      summary.categoryBreakdown[product.categoryId].subCategories[product.subCategoryId].count += product.quantity;
      summary.categoryBreakdown[product.categoryId].subCategories[product.subCategoryId].value += product.price * product.quantity;
    });

    setInventorySummary(summary);
  }, [products]);

  // Calculate revenue summary whenever sales change
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const summary: RevenueSummary = {
      totalSales: sales.reduce((sum, sale) => sum + sale.quantity, 0),
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      todaySales: sales
        .filter(sale => sale.date >= todayTimestamp)
        .reduce((sum, sale) => sum + sale.quantity, 0),
      todayRevenue: sales
        .filter(sale => sale.date >= todayTimestamp)
        .reduce((sum, sale) => sum + sale.totalAmount, 0)
    };

    setRevenueSummary(summary);
  }, [sales]);

  // Add a new category
  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      subCategories: []
    };

    setCategories(prev => [...prev, newCategory]);
    toast.success(`Category "${name}" added`);
  };

  // Add a new subcategory
  const addSubCategory = (categoryId: string, name: string) => {
    const newSubCategory: SubCategory = {
      id: Date.now().toString(),
      name,
      categoryId
    };

    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, subCategories: [...category.subCategories, newSubCategory] }
          : category
      )
    );
    toast.success(`Subcategory "${name}" added`);
  };

  // Add a new product
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: Date.now()
    };

    setProducts(prev => [...prev, newProduct]);
    toast.success(`Product "${productData.name}" added`);
  };

  // Add a new sale
  const addSale = (saleData: Omit<Sale, 'id' | 'date' | 'totalAmount'>) => {
    const totalAmount = saleData.quantity * saleData.pricePerUnit;
    
    const newSale: Sale = {
      ...saleData,
      totalAmount,
      id: Date.now().toString(),
      date: Date.now()
    };

    // Update product quantity
    setProducts(prev => 
      prev.map(product => 
        product.id === saleData.productId 
          ? { ...product, quantity: product.quantity - saleData.quantity }
          : product
      )
    );

    setSales(prev => [...prev, newSale]);
    toast.success(`Sale recorded for ₹${totalAmount.toFixed(2)}`);
  };

  // Get a product by ID
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Get a category by ID
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  // Get a subcategory by ID
  const getSubCategoryById = (id: string) => {
    for (const category of categories) {
      const subCategory = category.subCategories.find(sub => sub.id === id);
      if (subCategory) return subCategory;
    }
    return undefined;
  };

  // Update a product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id 
          ? { ...product, ...updates }
          : product
      )
    );
    toast.success('Product updated');
  };

  // Delete a product
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    toast.success('Product deleted');
  };

  // Get subcategories for a category
  const getSubCategoriesByCategoryId = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.subCategories : [];
  };

  return (
    <DataContext.Provider 
      value={{ 
        categories, 
        products, 
        sales, 
        inventorySummary,
        revenueSummary,
        addCategory, 
        addSubCategory,
        addProduct,
        addSale,
        getProductById,
        getCategoryById,
        getSubCategoryById,
        updateProduct,
        deleteProduct,
        getSubCategoriesByCategoryId
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};