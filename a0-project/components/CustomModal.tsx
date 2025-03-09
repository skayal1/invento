import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const { height } = Dimensions.get('window');

const CustomModal: React.FC<CustomModalProps> = ({ visible, onClose, title, children }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#555" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollContainer}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#7048e8',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  scrollContainer: {
    padding: 15,
  },
});

export default CustomModal;