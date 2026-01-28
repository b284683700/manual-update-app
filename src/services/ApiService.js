import axios from 'axios';
import CONFIG from '../config/config';

class ApiService {
  constructor() {
    this.baseURL = CONFIG.API_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // 测试连接
  async testConnection() {
    try {
      const response = await this.client.get('/');
      return response.status === 200;
    } catch (error) {
      console.error('测试连接失败:', error);
      return false;
    }
  }

  // 手动上报
  async manualReport(data) {
    try {
      const response = await this.client.post('/api/manual_report', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('手动上报失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 批量上报
  async batchReport(reports) {
    try {
      const promises = reports.map(report => this.manualReport(report));
      const results = await Promise.all(promises);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      return {
        success: failCount === 0,
        successCount,
        failCount,
        results,
      };
    } catch (error) {
      console.error('批量上报失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 更新服务器地址
  updateServerUrl(url) {
    this.baseURL = url;
    this.client = axios.create({
      baseURL: url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default new ApiService();
