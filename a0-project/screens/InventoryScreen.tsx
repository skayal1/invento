import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';

const InventoryScreen = () => {
  const { categories, inventorySummary, getCategoryById, getSubCategoryById } = useData();
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderCategoryItem = ({ item: categoryId }: { item: string }) => {
    const category = getCategoryById(categoryId);
    const categoryData = inventorySummary.categoryBreakdown[categoryId];
    
    if (!category || !categoryData) return null;

    const isExpanded = expandedCategories[categoryId];
    const subCategoryIds = Object.keys(categoryData.subCategories);

    return (
      <View style={styles.categoryCard}>
        <TouchableOpacity 
          style={styles.categoryHeader} 
          onPress={() => toggleCategory(categoryId)}
        >
          <View style={styles.categoryTitleContainer}>
            <MaterialIcons 
              name="category" 
              size={22} 
              color="#7048e8" 
              style={styles.categoryIcon} 
            />
            <Text style={styles.categoryTitle}>{category.name}</Text>
          </View>
          
          <View style={styles.categoryStats}>
            <Text style={styles.categoryCount}>{categoryData.count} items</Text>
            <Text style={styles.categoryValue}>{formatCurrency(categoryData.value)}</Text>
            <MaterialIcons 
              name={isExpanded ? "expand-less" : "expand-more"} 
              size={24} 
              color="#555" 
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.subcategoriesContainer}>
            {subCategoryIds.length > 0 ? (
              subCategoryIds.map(subCategoryId => {
                const subCategory = getSubCategoryById(subCategoryId);
                const subCategoryData = categoryData.subCategories[subCategoryId];
                
                if (!subCategory || !subCategoryData) return null;
                
                return (
                  <View key={subCategoryId} style={styles.subcategoryItem}>
                    <Text style={styles.subcategoryName}>{subCategory.name}</Text>
                    <View style={styles.subcategoryStats}>
                      <Text style={styles.subcategoryCount}>{subCategoryData.count} items</Text>
                      <Text style={styles.subcategoryValue}>{formatCurrency(subCategoryData.value)}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noDataText}>No subcategories found</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Items</Text>
            <Text style={styles.summaryValue}>{inventorySummary.totalItems}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Value</Text>
            <Text style={styles.summaryValue}>
              <FontAwesome5 name="rupee-sign" size={16} color="#333" />
              {' ' + inventorySummary.totalValue.toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Inventory by Category</Text>
        
        {Object.keys(inventorySummary.categoryBreakdown).length > 0 ? (
          <FlatList
            data={Object.keys(inventorySummary.categoryBreakdown)}
            renderItem={renderCategoryItem}
            keyExtractor={item => item}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inventory" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No inventory items found</Text>
            <Text style={styles.emptySubtext}>
              Add products from the Products tab to see your inventory
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7048e8',
    marginRight: 8,
  },
  subcategoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginLeft: 30,
  },
  subcategoryName: {
    fontSize: 14,
    color: '#555',
  },
  subcategoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryCount: {
    fontSize: 14,
    color: '#777',
    marginRight: 8,
  },
  subcategoryValue: {
    fontSize: 14,
    color: '#7048e8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 20,
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
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 12,
    fontStyle: 'italic',
  },
});

export default InventoryScreen;