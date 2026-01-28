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
import { LinearGradient } from 'expo-linear-gradient';
import COLORS, { gradients } from '../theme/colors';
import CONFIG from '../config/config';
import StorageService from '../services/StorageService';
import ApiService from '../services/ApiService';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState('');
  const [testStatus, setTestStatus] = useState('');
  const [testColor, setTestColor] = useState(COLORS.textLight);
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [presetTimes, setPresetTimes] = useState({});
  const [computers, setComputers] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const url = await StorageService.getServerUrl();
    const preset = await StorageService.getPresetTimes();
    const computersData = await StorageService.getComputers();
    
    setServerUrl(url);
    setPresetTimes(preset);
    setComputers(computersData);
  };

  const handleTestConnection = async () => {
    if (!serverUrl.trim()) {
      setTestStatus('请输入服务器地址');
      setTestColor(COLORS.error);
      return;
    }

    setTestStatus('正在测试...');
    setTestColor(COLORS.warning);

    ApiService.updateServerUrl(serverUrl);
    const success = await ApiService.testConnection();

    if (success) {
      setTestStatus('✅ 连接成功');
      setTestColor(COLORS.success);
    } else {
      setTestStatus('❌ 连接失败');
      setTestColor(COLORS.error);
    }
  };

  const handleSaveSettings = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('错误', '请输入服务器地址');
      return;
    }

    const success = await StorageService.saveServerUrl(serverUrl);
    if (success) {
      ApiService.updateServerUrl(serverUrl);
      Alert.alert('成功', '设置已保存');
    } else {
      Alert.alert('错误', '保存失败');
    }
  };

  const handleSavePreset = async () => {
    const success = await StorageService.savePresetTimes(presetTimes);
    if (success) {
      setPresetModalVisible(false);
      Alert.alert('成功', '预设时间已保存');
    } else {
      Alert.alert('错误', '保存失败');
    }
  };

  const updatePresetTime = (workbench, hours) => {
    setPresetTimes(prev => ({
      ...prev,
      [workbench]: parseInt(hours || '0') * 3600,
    }));
  };

  const handleAddComputer = () => {
    Alert.prompt(
      '添加电脑',
      '请输入电脑名称',
      async (computerName) => {
        if (!computerName.trim()) return;
        
        if (computers[computerName]) {
          Alert.alert('错误', '电脑名称已存在');
          return;
        }

        const newComputers = {
          ...computers,
          [computerName]: ['账号1', '账号2', '账号3', '账号4', '账号5'],
        };

        const success = await StorageService.saveComputers(newComputers);
        if (success) {
          setComputers(newComputers);
          Alert.alert('成功', `已添加电脑: ${computerName}`);
        }
      }
    );
  };

  const handleDeleteComputer = (computerName) => {
    Alert.alert(
      '确认删除',
      `确认删除电脑 "${computerName}"？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const newComputers = { ...computers };
            delete newComputers[computerName];
            
            const success = await StorageService.saveComputers(newComputers);
            if (success) {
              setComputers(newComputers);
              Alert.alert('成功', `已删除电脑: ${computerName}`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ 设置</Text>
        </View>

        {/* 服务器配置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 服务器配置</Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://159.75.159.89:5000"
            autoCapitalize="none"
          />
          
          <TouchableOpacity style={styles.button} onPress={handleTestConnection}>
            <LinearGradient
              colors={gradients.info}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>测试连接</Text>
            </LinearGradient>
          </TouchableOpacity>

          {testStatus ? (
            <Text style={[styles.statusText, { color: testColor }]}>
              {testStatus}
            </Text>
          ) : null}
        </View>

        {/* 预设时间配置 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setPresetModalVisible(true)}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>⏱️ 预设时间配置</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 电脑和账号管理 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setManageModalVisible(true)}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>💻 电脑和账号管理</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 保存按钮 */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={handleSaveSettings}>
            <LinearGradient
              colors={gradients.success}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>保存设置</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 应用信息 */}
        <View style={styles.section}>
          <Text style={styles.infoText}>应用版本: {CONFIG.APP_VERSION}</Text>
          <Text style={styles.infoText}>应用名称: {CONFIG.APP_NAME}</Text>
        </View>
      </ScrollView>

      {/* 预设时间配置对话框 */}
      <Modal
        visible={presetModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPresetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⏱️ 预设时间配置</Text>
            <Text style={styles.modalSubtitle}>设置4个工作台的默认倒计时</Text>

            {CONFIG.WORKBENCHES.map(wb => (
              <View key={wb} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{wb}:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={String(Math.floor(presetTimes[wb] / 3600))}
                  onChangeText={(text) => updatePresetTime(wb, text)}
                  keyboardType="numeric"
                  placeholder="8"
                />
                <Text style={styles.unitText}>小时</Text>
              </View>
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSavePreset}
              >
                <Text style={styles.modalButtonText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPresetModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 电脑管理对话框 */}
      <Modal
        visible={manageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setManageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💻 电脑和账号管理</Text>

            <ScrollView style={styles.computerList}>
              {Object.keys(computers).map(computerName => (
                <View key={computerName} style={styles.computerCard}>
                  <View style={styles.computerHeader}>
                    <Text style={styles.computerName}>🖥️ {computerName}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteComputer(computerName)}
                    >
                      <Text style={styles.deleteButtonText}>删除</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.accountsText}>
                    账号: {computers[computerName].join(', ')}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, styles.addButton]}
              onPress={handleAddComputer}
            >
              <Text style={styles.modalButtonText}>➕ 添加电脑</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setManageModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>关闭</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.card,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.card,
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
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
    marginTop: 10,
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    width: 100,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  unitText: {
    fontSize: 16,
    width: 40,
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
  addButton: {
    backgroundColor: COLORS.success,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  computerList: {
    maxHeight: 300,
    marginBottom: 15,
  },
  computerCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  computerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  computerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountsText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});
