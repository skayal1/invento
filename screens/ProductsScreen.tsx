import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData, Product } from '../context/DataContext';
import { formatCurrency, formatCategoryPath, formatDate } from '../utils/formatters';
import Button from '../components/Button';
import CustomModal from '../components/CustomModal';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const ProductsScreen = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    addCategory, 
    addSubCategory, 
    getCategoryById, 
    getSubCategoryById,
    getSubCategoriesByCategoryId,
    deleteProduct
  } = useData();
  
  // State for product modal
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');  const [productQuantity, setQuantity] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('pieces');
  const [productErrors, setProductErrors] = useState<{[key: string]: string}>({});
  
  // State for category modal
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryErrors, setCategoryErrors] = useState<{[key: string]: string}>({});
  
  // State for subcategory modal
  const [isSubcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [categoryForSubcategory, setCategoryForSubcategory] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryErrors, setSubcategoryErrors] = useState<{[key: string]: string}>({});

  // Reset product form
  const resetProductForm = () => {
    setProductName('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setProductPrice('');
    setQuantity('');
    setProductErrors({});
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCategoryName('');
    setCategoryErrors({});
  };

  // Reset subcategory form
  const resetSubcategoryForm = () => {
    setCategoryForSubcategory('');
    setSubcategoryName('');
    setSubcategoryErrors({});
  };

  // Validate product form
  const validateProductForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!productName.trim()) errors.name = 'Product name is required';
    if (!selectedCategory) errors.category = 'Category is required';
    if (!selectedSubCategory) errors.subcategory = 'Subcategory is required';
    
    if (!productPrice.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(Number(productPrice)) || Number(productPrice) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!productQuantity.trim()) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(Number(productQuantity)) || Number(productQuantity) < 0 || !Number.isInteger(Number(productQuantity))) {
      errors.quantity = 'Quantity must be a non-negative integer';
    }
    
    setProductErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate category form
  const validateCategoryForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!categoryName.trim()) errors.name = 'Category name is required';
    
    setCategoryErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate subcategory form
  const validateSubcategoryForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!categoryForSubcategory) errors.category = 'Parent category is required';
    if (!subcategoryName.trim()) errors.name = 'Subcategory name is required';
    
    setSubcategoryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle product submission
  const handleAddProduct = () => {
    if (validateProductForm()) {      addProduct({
        name: productName.trim(),
        categoryId: selectedCategory,
        subCategoryId: selectedSubCategory,
        price: Number(productPrice),
        quantity: Number(productQuantity),
        unit: selectedUnit as 'kg' | 'liter' | 'pieces'
      });
      
      setProductModalVisible(false);
      resetProductForm();
    }
  };
  
  // Handle category submission
  const handleAddCategory = () => {
    if (validateCategoryForm()) {
      addCategory(categoryName.trim());
      setCategoryModalVisible(false);
      resetCategoryForm();
    }
  };
  
  // Handle subcategory submission
  const handleAddSubcategory = () => {
    if (validateSubcategoryForm()) {
      addSubCategory(categoryForSubcategory, subcategoryName.trim());
      setSubcategoryModalVisible(false);
      resetSubcategoryForm();
    }
  };

  // Handle product deletion
  const confirmDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete "${productName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => deleteProduct(productId),
          style: "destructive"
        }
      ]
    );
  };

  // Render product item
  const renderProductItem = ({ item }: { item: Product }) => {
    const category = getCategoryById(item.categoryId);
    const subCategory = getSubCategoryById(item.subCategoryId);
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <TouchableOpacity 
            onPress={() => confirmDeleteProduct(item.id, item.name)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete-outline" size={20} color="#e53935" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.productDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>
              {category ? formatCategoryPath(category.name, subCategory?.name) : 'Unknown'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.price)}</Text>
          </View>
          
          <View style={styles.detailRow}>          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{item.quantity} {item.unit}</Text>
          
          <Text style={styles.detailLabel}>Added on:</Text>
          <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Value:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products Management</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <Button
          title="Add Product"
          onPress={() => setProductModalVisible(true)}
          icon={<MaterialIcons name="add-circle-outline" size={18} color="white" />}
        />
        
        <Button
          title="Manage Categories"
          type="secondary"
          onPress={() => setCategoryModalVisible(true)}
          icon={<MaterialIcons name="category" size={18} color="#7048e8" />}
        />
      </View>
      
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inventory" size={60} color="#ddd" />
          <Text style={styles.emptyText}>No products found</Text>
          <Text style={styles.emptySubtext}>
            Add products to start managing your inventory
          </Text>
        </View>
      )}
      
      {/* Product Modal */}
      <CustomModal
        visible={isProductModalVisible}
        onClose={() => {
          setProductModalVisible(false);
          resetProductForm();
        }}
        title="Add New Product"
      >
        <FormInput
          label="Product Name"
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
          error={productErrors.name}
          required
        />
        
        <FormSelect
          label="Category"
          options={categories.map(category => ({
            label: category.name,
            value: category.id
          }))}
          selectedValue={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value);
            setSelectedSubCategory(''); // Reset subcategory when category changes
          }}
          error={productErrors.category}
          required
        />
        
        <FormSelect
          label="Subcategory"
          options={getSubCategoriesByCategoryId(selectedCategory).map(subcategory => ({
            label: subcategory.name,
            value: subcategory.id
          }))}
          selectedValue={selectedSubCategory}
          onValueChange={setSelectedSubCategory}
          error={productErrors.subcategory}
          placeholder={selectedCategory ? "Select subcategory" : "Select category first"}
          required
        />
        
        <FormInput
          label="Price (₹)"
          value={productPrice}
          onChangeText={setProductPrice}
          placeholder="Enter price"
          keyboardType="decimal-pad"
          error={productErrors.price}
          required
        />        <View style={styles.quantityContainer}>
          <View style={styles.quantityInput}>
            <FormInput
              label="Quantity"
              value={productQuantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
              error={productErrors.quantity}
              required
            />
          </View>
          
          <View style={styles.unitSelect}>
            <FormSelect
              label="Unit"
              options={[
                { label: 'Pieces', value: 'pieces' },
                { label: 'Kilograms', value: 'kg' },
                { label: 'Liters', value: 'liter' }
              ]}
              selectedValue={selectedUnit}
              onValueChange={setSelectedUnit}
              required
            />
          </View>
        </View>
        
        <View style={styles.modalButtonContainer}>
          <Button
            title="Add Product"
            onPress={handleAddProduct}
            fullWidth
          />
        </View>
      </CustomModal>
      
      {/* Category Modal */}
      <CustomModal
        visible={isCategoryModalVisible}
        onClose={() => {
          setCategoryModalVisible(false);
          resetCategoryForm();
        }}
        title="Manage Categories"
      >
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Add New Category</Text>
          
          <FormInput
            label="Category Name"
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Enter category name"
            error={categoryErrors.name}
            required
          />
          
          <Button
            title="Add Category"
            onPress={handleAddCategory}
            fullWidth
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Add New Subcategory</Text>
          
          <Button
            title="Add Subcategory"
            type="secondary"
            onPress={() => {
              setCategoryModalVisible(false);
              setSubcategoryModalVisible(true);
            }}
            fullWidth
          />
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Existing Categories</Text>
        
        {categories.length > 0 ? (
          categories.map(category => (
            <View key={category.id} style={styles.existingCategoryItem}>
              <Text style={styles.existingCategoryName}>{category.name}</Text>
              
              {category.subCategories.length > 0 && (
                <View style={styles.subcategoriesList}>
                  {category.subCategories.map(subCategory => (
                    <View key={subCategory.id} style={styles.subcategoryTag}>
                      <Text style={styles.subcategoryTagText}>{subCategory.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No categories defined yet</Text>
        )}
      </CustomModal>
      
      {/* Subcategory Modal */}
      <CustomModal
        visible={isSubcategoryModalVisible}
        onClose={() => {
          setSubcategoryModalVisible(false);
          resetSubcategoryForm();
        }}
        title="Add New Subcategory"
      >
        <FormSelect
          label="Parent Category"
          options={categories.map(category => ({
            label: category.name,
            value: category.id
          }))}
          selectedValue={categoryForSubcategory}
          onValueChange={setCategoryForSubcategory}
          error={subcategoryErrors.category}
          required
        />
        
        <FormInput
          label="Subcategory Name"
          value={subcategoryName}
          onChangeText={setSubcategoryName}
          placeholder="Enter subcategory name"
          error={subcategoryErrors.name}
          required
        />
        
        <View style={styles.modalButtonContainer}>
          <Button
            title="Add Subcategory"
            onPress={handleAddSubcategory}
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
    gap: 8,
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  productDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  },  modalButtonContainer: {
    marginTop: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  quantityInput: {
    flex: 2,
  },
  unitSelect: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  existingCategoryItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  existingCategoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subcategoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subcategoryTag: {
    backgroundColor: '#e0d6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  subcategoryTagText: {
    fontSize: 12,
    color: '#7048e8',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
});

export default ProductsScreen;