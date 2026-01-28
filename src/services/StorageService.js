import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/config';

class StorageService {
  // 键名常量
  static KEYS = {
    SERVER_URL: '@server_url',
    COMPUTERS: '@computers',
    LAST_COMPUTER: '@last_computer',
    PRESET_TIMES: '@preset_times',
  };

  // 获取服务器地址
  async getServerUrl() {
    try {
      const url = await AsyncStorage.getItem(StorageService.KEYS.SERVER_URL);
      return url || CONFIG.API_URL;
    } catch (error) {
      console.error('获取服务器地址失败:', error);
      return CONFIG.API_URL;
    }
  }

  // 保存服务器地址
  async saveServerUrl(url) {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.SERVER_URL, url);
      return true;
    } catch (error) {
      console.error('保存服务器地址失败:', error);
      return false;
    }
  }

  // 获取电脑配置
  async getComputers() {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.COMPUTERS);
      return data ? JSON.parse(data) : CONFIG.DEFAULT_COMPUTERS;
    } catch (error) {
      console.error('获取电脑配置失败:', error);
      return CONFIG.DEFAULT_COMPUTERS;
    }
  }

  // 保存电脑配置
  async saveComputers(computers) {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.COMPUTERS, JSON.stringify(computers));
      return true;
    } catch (error) {
      console.error('保存电脑配置失败:', error);
      return false;
    }
  }

  // 获取上次选择的电脑
  async getLastComputer() {
    try {
      return await AsyncStorage.getItem(StorageService.KEYS.LAST_COMPUTER);
    } catch (error) {
      console.error('获取上次电脑失败:', error);
      return null;
    }
  }

  // 保存上次选择的电脑
  async saveLastComputer(computerName) {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.LAST_COMPUTER, computerName);
      return true;
    } catch (error) {
      console.error('保存上次电脑失败:', error);
      return false;
    }
  }

  // 获取预设时间
  async getPresetTimes() {
    try {
      const data = await AsyncStorage.getItem(StorageService.KEYS.PRESET_TIMES);
      return data ? JSON.parse(data) : {
        '工作台1': 8 * 3600,
        '工作台2': 8 * 3600,
        '工作台3': 8 * 3600,
        '工作台4': 8 * 3600,
      };
    } catch (error) {
      console.error('获取预设时间失败:', error);
      return {
        '工作台1': 8 * 3600,
        '工作台2': 8 * 3600,
        '工作台3': 8 * 3600,
        '工作台4': 8 * 3600,
      };
    }
  }

  // 保存预设时间
  async savePresetTimes(times) {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.PRESET_TIMES, JSON.stringify(times));
      return true;
    } catch (error) {
      console.error('保存预设时间失败:', error);
      return false;
    }
  }

  // 清除所有数据
  async clearAll() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('清除数据失败:', error);
      return false;
    }
  }
}

export default new StorageService();
