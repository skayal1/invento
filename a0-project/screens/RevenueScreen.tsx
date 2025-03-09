import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData, Sale } from '../context/DataContext';
import { formatCurrency, formatDate } from '../utils/formatters';

// Mock chart component - in a real app, you'd use a library like react-native-chart-kit
const RevenueChart = () => {
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBar} />
      <View style={[styles.chartBar, { height: 100 }]} />
      <View style={[styles.chartBar, { height: 60 }]} />
      <View style={[styles.chartBar, { height: 120 }]} />
      <View style={[styles.chartBar, { height: 80 }]} />
      <View style={[styles.chartBar, { height: 150 }]} />
      <View style={[styles.chartBar, { height: 90 }]} />
    </View>
  );
};

const RevenueScreen = () => {
  const { sales, revenueSummary, inventorySummary } = useData();
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  
  // Filter sales based on selected time period
  const getFilteredSales = (): Sale[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
    
    switch (timeFilter) {
      case 'today':
        return sales.filter(sale => sale.date >= today);
      case 'week':
        return sales.filter(sale => sale.date >= weekAgo);
      case 'month':
        return sales.filter(sale => sale.date >= monthAgo);
      default:
        return sales;
    }
  };
  
  // Calculate revenue summary for filtered sales
  const getFilteredRevenue = () => {
    const filteredSales = getFilteredSales();
    return {
      totalSales: filteredSales.reduce((sum, sale) => sum + sale.quantity, 0),
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    };
  };
  
  const filteredRevenue = getFilteredRevenue();
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={[styles.statsIconContainer, { backgroundColor: '#e0d6ff' }]}>
              <FontAwesome5 name="rupee-sign" size={22} color="#7048e8" />
            </View>
            <Text style={styles.statsLabel}>Total Revenue</Text>
            <Text style={styles.statsValue}>{formatCurrency(revenueSummary.totalRevenue)}</Text>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIconContainer, { backgroundColor: '#d6f5e3' }]}>
              <MaterialIcons name="shopping-cart" size={24} color="#10b981" />
            </View>
            <Text style={styles.statsLabel}>Total Sales</Text>
            <Text style={styles.statsValue}>{revenueSummary.totalSales} units</Text>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIconContainer, { backgroundColor: '#fff2cc' }]}>
              <MaterialIcons name="today" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statsLabel}>Today's Revenue</Text>
            <Text style={styles.statsValue}>{formatCurrency(revenueSummary.todayRevenue)}</Text>
          </View>
          
          <View style={styles.statsCard}>
            <View style={[styles.statsIconContainer, { backgroundColor: '#fde2e2' }]}>
              <MaterialIcons name="inventory" size={24} color="#ef4444" />
            </View>
            <Text style={styles.statsLabel}>Inventory Value</Text>
            <Text style={styles.statsValue}>{formatCurrency(inventorySummary.totalValue)}</Text>
          </View>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Overview</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === 'all' && styles.activeFilter]}
              onPress={() => setTimeFilter('all')}
            >
              <Text style={[styles.filterText, timeFilter === 'all' && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === 'today' && styles.activeFilter]}
              onPress={() => setTimeFilter('today')}
            >
              <Text style={[styles.filterText, timeFilter === 'today' && styles.activeFilterText]}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === 'week' && styles.activeFilter]}
              onPress={() => setTimeFilter('week')}
            >
              <Text style={[styles.filterText, timeFilter === 'week' && styles.activeFilterText]}>Week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, timeFilter === 'month' && styles.activeFilter]}
              onPress={() => setTimeFilter('month')}
            >
              <Text style={[styles.filterText, timeFilter === 'month' && styles.activeFilterText]}>Month</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Sales</Text>
              <Text style={styles.summaryValue}>{filteredRevenue.totalSales} units</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={styles.summaryValue}>{formatCurrency(filteredRevenue.totalRevenue)}</Text>
            </View>
          </View>
          
          {getFilteredSales().length > 0 ? (
            <RevenueChart />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No sales data for selected period</Text>
            </View>
          )}
        </View>
        
        <View style={styles.recentSalesCard}>
          <Text style={styles.recentSalesTitle}>Recent Sales</Text>
          
          {getFilteredSales().length > 0 ? (
            getFilteredSales()
              .sort((a, b) => b.date - a.date)
              .slice(0, 5)
              .map(sale => (
                <View key={sale.id} style={styles.recentSaleItem}>
                  <View style={styles.recentSaleInfo}>
                    <Text style={styles.recentSaleDate}>{formatDate(sale.date)}</Text>
                    <Text style={styles.recentSaleQuantity}>{sale.quantity} units</Text>
                  </View>
                  <Text style={styles.recentSaleAmount}>{formatCurrency(sale.totalAmount)}</Text>
                </View>
              ))
          ) : (
            <Text style={styles.noRecentSales}>No recent sales to display</Text>
          )}
        </View>
        
        <View style={styles.inventorySummaryCard}>
          <Text style={styles.inventorySummaryTitle}>Inventory Summary</Text>
          
          <View style={styles.inventorySummaryRow}>
            <View style={styles.inventorySummaryItem}>
              <MaterialIcons name="inventory" size={20} color="#7048e8" />
              <Text style={styles.inventorySummaryLabel}>Total Items</Text>
              <Text style={styles.inventorySummaryValue}>{inventorySummary.totalItems}</Text>
            </View>
            
            <View style={styles.inventorySummaryItem}>
              <FontAwesome5 name="rupee-sign" size={18} color="#7048e8" />
              <Text style={styles.inventorySummaryLabel}>Total Value</Text>
              <Text style={styles.inventorySummaryValue}>{formatCurrency(inventorySummary.totalValue)}</Text>
            </View>
          </View>
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 4,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#7048e8',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 20,
  },
  chartBar: {
    width: '12%',
    height: 70,
    backgroundColor: '#7048e8',
    borderRadius: 4,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  recentSalesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  recentSalesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recentSaleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSaleInfo: {
    flex: 1,
  },
  recentSaleDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  recentSaleQuantity: {
    fontSize: 12,
    color: '#888',
  },
  recentSaleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7048e8',
  },
  noRecentSales: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  inventorySummaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    elevation: 2,
  },
  inventorySummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inventorySummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inventorySummaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  inventorySummaryLabel: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  inventorySummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default RevenueScreen;