import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS, { gradients } from '../theme/colors';
import CONFIG from '../config/config';
import StorageService from '../services/StorageService';
import ApiService from '../services/ApiService';

export default function UpdateScreen() {
  const [computers, setComputers] = useState({});
  const [selectedComputer, setSelectedComputer] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [presetTimes, setPresetTimes] = useState({});
  const [statusMessage, setStatusMessage] = useState('等待更新...');
  const [statusColor, setStatusColor] = useState(COLORS.textLight);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [hafuBalance, setHafuBalance] = useState('0');
  const [warehouseNum, setWarehouseNum] = useState('0');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const computersData = await StorageService.getComputers();
    const lastComputer = await StorageService.getLastComputer();
    const preset = await StorageService.getPresetTimes();

    setComputers(computersData);
    setPresetTimes(preset);

    const computerNames = Object.keys(computersData);
    if (computerNames.length > 0) {
      const initialComputer = lastComputer && computersData[lastComputer] 
        ? lastComputer 
        : computerNames[0];
      setSelectedComputer(initialComputer);
      setAccounts(computersData[initialComputer] || []);
    }
  };

  const handleComputerChange = (computerName) => {
    setSelectedComputer(computerName);
    setAccounts(computers[computerName] || []);
    StorageService.saveLastComputer(computerName);
  };

  const openUpdateModal = (accountName) => {
    setSelectedAccount(accountName);
    setHafuBalance('0');
    setWarehouseNum('0');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    setModalVisible(false);
    setStatusMessage('正在更新...');
    setStatusColor(COLORS.warning);

    const hafu = parseInt(hafuBalance || '0') * 1000;
    const warehouse = `主仓库${warehouseNum}/333`;

    const reportData = {
      computer_name: selectedComputer,
      account_name: selectedAccount,
      hafu_balance: hafu,
      warehouse_capacity: warehouse,
      workbenches: presetTimes,
    };

    const result = await ApiService.manualReport(reportData);

    if (result.success) {
      setStatusMessage(`✅ 成功 ${selectedAccount} (${new Date().toLocaleTimeString()})`);
      setStatusColor(COLORS.success);
    } else {
      setStatusMessage(`❌ 失败: ${result.error}`);
      setStatusColor(COLORS.error);
    }
  };

  const handleBatchUpdate = async () => {
    Alert.alert(
      '批量更新',
      `确认更新 ${selectedComputer} 的所有 ${accounts.length} 个账号？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确认', onPress: doBatchUpdate },
      ]
    );
  };

  const doBatchUpdate = async () => {
    setStatusMessage('正在批量更新...');
    setStatusColor(COLORS.warning);

    const reports = accounts.map(account => ({
      computer_name: selectedComputer,
      account_name: account,
      hafu_balance: 0,
      warehouse_capacity: '主仓库0/333',
      workbenches: presetTimes,
    }));

    const result = await ApiService.batchReport(reports);

    if (result.success) {
      setStatusMessage(`✅ 全部成功 ${result.successCount}个`);
      setStatusColor(COLORS.success);
    } else {
      setStatusMessage(`成功${result.successCount}个 失败${result.failCount}个`);
      setStatusColor(COLORS.warning);
    }
  };

  const formatPresetText = () => {
    return CONFIG.WORKBENCHES.map(wb => 
      `${wb.slice(0, 2)}${Math.floor(presetTimes[wb] / 3600)}h`
    ).join(' ');
  };

  return (
    <View style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>📱 手动上报</Text>
      </View>

      {/* 电脑选择 */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>电脑:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedComputer}
            onValueChange={handleComputerChange}
            style={styles.picker}
          >
            {Object.keys(computers).map(name => (
              <Picker.Item key={name} label={name} value={name} />
            ))}
          </Picker>
        </View>
      </View>

      {/* 账号列表 */}
      <ScrollView style={styles.scrollView}>
        {accounts.map((account, index) => (
          <View key={index} style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>👤 {account}</Text>
              <Text style={styles.presetText}>预设: {formatPresetText()}</Text>
            </View>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => openUpdateModal(account)}
            >
              <LinearGradient
                colors={gradients.success}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>🚀 更新</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 状态显示 */}
      <Text style={[styles.statusText, { color: statusColor }]}>
        {statusMessage}
      </Text>

      {/* 全部更新按钮 */}
      <TouchableOpacity style={styles.batchButton} onPress={handleBatchUpdate}>
        <LinearGradient
          colors={gradients.primary}
          style={styles.batchButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.batchButtonText}>🚀 全部更新</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 更新对话框 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>更新 {selectedAccount}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>哈夫币(千):</Text>
              <TextInput
                style={styles.input}
                value={hafuBalance}
                onChangeText={setHafuBalance}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>仓库/333:</Text>
              <TextInput
                style={styles.input}
                value={warehouseNum}
                onChangeText={setWarehouseNum}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.modalButtonText}>确认更新</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.card,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
    width: 60,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  accountCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  presetText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  updateButton: {
    width: 100,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
  },
  batchButton: {
    margin: 15,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  batchButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.textLight,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
