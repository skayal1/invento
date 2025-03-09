import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData, Sale, Product } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Button from '../components/Button';
import CustomModal from '../components/CustomModal';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { toast } from 'sonner-native';

interface ProductSelectOption {
  label: string;
  value: string;
  stock: number;
  price: number;
}

const SalesScreen = () => {
  const { sales, products, addSale, getProductById, getCategoryById, getSubCategoryById } = useData();
  
  // State for sale modal
  const [isSaleModalVisible, setSaleModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [saleQuantity, setSaleQuantity] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleErrors, setSaleErrors] = useState<{[key: string]: string}>({});
  
  // State for product details
  const [productOptions, setProductOptions] = useState<ProductSelectOption[]>([]);
  const [currentProductStock, setCurrentProductStock] = useState(0);
  const [currentProductPrice, setCurrentProductPrice] = useState(0);
  
  // Update product options when products change
  useEffect(() => {
    const options = products
      .filter(product => product.quantity > 0) // Only include products with stock
      .map(product => ({
        label: product.name,
        value: product.id,
        stock: product.quantity,
        price: product.price
      }));
    
    setProductOptions(options);
  }, [products]);
  
  // Update product details when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        setCurrentProductStock(product.quantity);
        setCurrentProductPrice(product.price);
        setSalePrice(product.price.toString());
      }
    } else {
      setCurrentProductStock(0);
      setCurrentProductPrice(0);
      setSalePrice('');
    }
  }, [selectedProduct, products]);
  
  // Reset sale form
  const resetSaleForm = () => {
    setSelectedProduct('');
    setSaleQuantity('');
    setSalePrice('');
    setSaleErrors({});
  };
  
  // Validate sale form
  const validateSaleForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedProduct) errors.product = 'Product is required';
    
    if (!saleQuantity.trim()) {
      errors.quantity = 'Quantity is required';
    } else {
      const quantity = Number(saleQuantity);
      if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        errors.quantity = 'Quantity must be a positive integer';
      } else if (quantity > currentProductStock) {
        errors.quantity = `Insufficient stock. Only ${currentProductStock} available`;
      }
    }
    
    if (!salePrice.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(Number(salePrice)) || Number(salePrice) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    setSaleErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle sale submission
  const handleAddSale = () => {
    if (validateSaleForm()) {
      addSale({
        productId: selectedProduct,
        quantity: Number(saleQuantity),
        pricePerUnit: Number(salePrice)
      });
      
      setSaleModalVisible(false);
      resetSaleForm();
    }
  };
  
  // Get total amount for a sale
  const getTotalAmount = () => {
    const quantity = Number(saleQuantity) || 0;
    const price = Number(salePrice) || 0;
    return quantity * price;
  };
  
  // Render sale item
  const renderSaleItem = ({ item }: { item: Sale }) => {
    const product = getProductById(item.productId);
    
    if (!product) return null;
    
    const category = getCategoryById(product.categoryId);
    const subCategory = getSubCategoryById(product.subCategoryId);
    
    return (
      <View style={styles.saleCard}>
        <View style={styles.saleHeader}>
          <Text style={styles.saleTitle}>{product.name}</Text>
          <Text style={styles.saleDate}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.saleDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>
              {category?.name} {subCategory && `> ${subCategory.name}`}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{item.quantity} units</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price per unit:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.pricePerUnit)}</Text>
          </View>
          
          <View style={styles.detailRowHighlighted}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sales Registry</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <Button
          title="Record Sale"
          onPress={() => {
            if (productOptions.length === 0) {
              toast.error("No products with stock available");
            } else {
              setSaleModalVisible(true);
            }
          }}
          icon={<MaterialIcons name="add-shopping-cart" size={18} color="white" />}
        />
      </View>
      
      {sales.length > 0 ? (
        <FlatList
          data={sales.sort((a, b) => b.date - a.date)} // Sort by date, newest first
          renderItem={renderSaleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={60} color="#ddd" />
          <Text style={styles.emptyText}>No sales recorded</Text>
          <Text style={styles.emptySubtext}>
            Start recording sales to track your revenue
          </Text>
        </View>
      )}
      
      {/* Sale Modal */}
      <CustomModal
        visible={isSaleModalVisible}
        onClose={() => {
          setSaleModalVisible(false);
          resetSaleForm();
        }}
        title="Record New Sale"
      >
        <FormSelect
          label="Product"
          options={productOptions}
          selectedValue={selectedProduct}
          onValueChange={setSelectedProduct}
          error={saleErrors.product}
          required
        />
        
        {selectedProduct && (
          <View style={styles.stockInfo}>
            <Text style={styles.stockText}>
              Available Stock: <Text style={styles.stockValue}>{currentProductStock} units</Text>
            </Text>
            <Text style={styles.stockText}>
              Default Price: <Text style={styles.stockValue}>{formatCurrency(currentProductPrice)}</Text>
            </Text>
          </View>
        )}
        
        <FormInput
          label="Quantity"
          value={saleQuantity}
          onChangeText={setSaleQuantity}
          placeholder="Enter quantity"
          keyboardType="numeric"
          error={saleErrors.quantity}
          required
        />
        
        <FormInput
          label="Price per Unit (₹)"
          value={salePrice}
          onChangeText={setSalePrice}
          placeholder="Enter price per unit"
          keyboardType="decimal-pad"
          error={saleErrors.price}
          required
        />
        
        {saleQuantity && salePrice && !isNaN(Number(saleQuantity)) && !isNaN(Number(salePrice)) && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(getTotalAmount())}</Text>
          </View>
        )}
        
        <View style={styles.modalButtonContainer}>
          <Button
            title="Record Sale"
            onPress={handleAddSale}
            fullWidth
          />
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  saleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  saleDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  saleDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRowHighlighted: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7048e8',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  modalButtonContainer: {
    marginTop: 20,
  },
  stockInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  stockText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  stockValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0d6ff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7048e8',
  },
});

export default SalesScreen;