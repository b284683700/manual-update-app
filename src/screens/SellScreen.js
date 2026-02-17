import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/colors';
import { API_BASE_URL } from '../config/api';

export default function SellScreen() {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState([]);
  
  // 主仓库配置
  const [mainItems, setMainItems] = useState('');
  const [mainStartTime, setMainStartTime] = useState('20:00');
  const [mainEndTime, setMainEndTime] = useState('23:30');
  
  // 弹药箱配置
  const [ammoItems, setAmmoItems] = useState('');
  const [ammoStartTime, setAmmoStartTime] = useState('20:00');
  const [ammoEndTime, setAmmoEndTime] = useState('23:30');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sell/config`);
      const data = await response.json();
      
      if (data.status === 'ok' && data.data) {
        setConfigs(data.data);
        
        // 填充表单
        data.data.forEach(config => {
          if (config.warehouse_type === 'main') {
            setMainItems(config.item_names);
            setMainStartTime(config.start_time);
            setMainEndTime(config.end_time);
          } else if (config.warehouse_type === 'ammo') {
            setAmmoItems(config.item_names);
            setAmmoStartTime(config.start_time);
            setAmmoEndTime(config.end_time);
          }
        });
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  };

  const saveSellConfig = async (type) => {
    let warehouseType, itemNames, startTime, endTime;
    
    if (type === 'main') {
      warehouseType = 'main';
      itemNames = mainItems.trim();
      startTime = mainStartTime;
      endTime = mainEndTime;
    } else {
      warehouseType = 'ammo';
      itemNames = ammoItems.trim();
      startTime = ammoStartTime;
      endTime = ammoEndTime;
    }
    
    if (!itemNames) {
      Alert.alert('提示', '请输入要出售的物品名称');
      return;
    }
    
    if (!startTime || !endTime) {
      Alert.alert('提示', '请选择开始和结束时间');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/sell/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          warehouse_type: warehouseType,
          item_names: itemNames,
          start_time: startTime,
          end_time: endTime,
          enabled: 1,
        }),
      });
      
      const data = await response.json();
      
      if (data.status === 'ok') {
        Alert.alert('成功', '配置保存成功！');
        await loadConfigs();
      } else {
        Alert.alert('错误', data.error || '保存失败');
      }
    } catch (error) {
      Alert.alert('错误', '保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderConfigCard = (title, icon, items, setItems, startTime, setStartTime, endTime, setEndTime, type) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>出售物品（多个物品用逗号分隔）</Text>
        <TextInput
          style={styles.input}
          value={items}
          onChangeText={setItems}
          placeholder="例如: 重型突击背心,全景红点"
          placeholderTextColor={COLORS.textLight}
        />
      </View>
      
      <View style={styles.timeRow}>
        <View style={styles.timeGroup}>
          <Text style={styles.label}>开始时间</Text>
          <TextInput
            style={styles.timeInput}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="20:00"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        
        <View style={styles.timeGroup}>
          <Text style={styles.label}>结束时间</Text>
          <TextInput
            style={styles.timeInput}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="23:30"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => saveSellConfig(type)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>保存配置</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCurrentConfig = () => {
    if (configs.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyText}>暂无配置</Text>
        </View>
      );
    }
    
    const warehouseNames = {
      'main': '🏠 主仓库',
      'ammo': '📦 弹药箱'
    };
    
    return configs.map((config, index) => (
      <View key={index} style={styles.configItem}>
        <View style={styles.configHeader}>
          <Text style={styles.configTitle}>
            {warehouseNames[config.warehouse_type] || config.warehouse_type}
          </Text>
          <View style={[styles.statusBadge, config.enabled ? styles.statusEnabled : styles.statusDisabled]}>
            <Text style={styles.statusText}>
              {config.enabled ? '✅ 已启用' : '❌ 已禁用'}
            </Text>
          </View>
        </View>
        <Text style={styles.configDetail}>
          <Text style={styles.configLabel}>物品: </Text>
          {config.item_names}
        </Text>
        <Text style={styles.configDetail}>
          <Text style={styles.configLabel}>时间: </Text>
          {config.start_time} - {config.end_time}
        </Text>
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cart-outline" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>仓库出售物品配置</Text>
      </View>
      
      {renderConfigCard(
        '主仓库',
        'home-outline',
        mainItems,
        setMainItems,
        mainStartTime,
        setMainStartTime,
        mainEndTime,
        setMainEndTime,
        'main'
      )}
      
      {renderConfigCard(
        '弹药箱',
        'cube-outline',
        ammoItems,
        setAmmoItems,
        ammoStartTime,
        setAmmoStartTime,
        ammoEndTime,
        setAmmoEndTime,
        'ammo'
      )}
      
      <View style={styles.currentConfigSection}>
        <Text style={styles.sectionTitle}>📋 当前配置</Text>
        {renderCurrentConfig()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentConfigSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  configItem: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusEnabled: {
    backgroundColor: '#d4edda',
  },
  statusDisabled: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  configDetail: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  configLabel: {
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
  },
});
