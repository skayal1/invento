import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  error,
  placeholder = 'Select an option',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === selectedValue);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <TouchableOpacity
        style={[styles.selectContainer, error && styles.selectError]}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.selectText, 
          !selectedOption && styles.placeholderText
        ]}>
          {displayText}
        </Text>
        <MaterialIcons 
          name={isOpen ? "arrow-drop-up" : "arrow-drop-down"} 
          size={24} 
          color="#555" 
        />
      </TouchableOpacity>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {isOpen && (
        <View style={styles.optionsContainer}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedValue === item.value && styles.selectedOption
                ]}
                onPress={() => {
                  onValueChange(item.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === item.value && styles.selectedOptionText
                ]}>
                  {item.label}
                </Text>
                {selectedValue === item.value && (
                  <MaterialIcons name="check" size={18} color="#7048e8" />
                )}
              </TouchableOpacity>
            )}
            style={styles.flatList}
            maxHeight={200}
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    zIndex: 1000,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
    fontWeight: '500',
  },
  required: {
    color: 'red',
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1001,
  },
  selectError: {
    borderColor: 'red',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  optionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: Math.min(200, height * 0.3),
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  flatList: {
    flexGrow: 0,
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  selectedOption: {
    backgroundColor: '#f0ebff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#7048e8',
    fontWeight: 'bold',
  },
});

export default FormSelect;