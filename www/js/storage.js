/**
 * 猫咪记账 - 数据存储模块
 * 使用 localStorage 进行本地数据持久化
 */

const Storage = {
    // 存储键名
    KEYS: {
        RECORDS: 'cat_accounting_records',
        CATEGORIES: 'cat_accounting_categories',
        SETTINGS: 'cat_accounting_settings'
    },

    // 默认分类
    DEFAULT_CATEGORIES: {
        expense: [
            { id: 'food', name: '餐饮', icon: '🍜' },
            { id: 'transport', name: '交通', icon: '🚗' },
            { id: 'entertainment', name: '娱乐', icon: '🎮' },
            { id: 'study', name: '学习', icon: '📚' },
            { id: 'shopping', name: '购物', icon: '🛍️' },
            { id: 'medical', name: '医疗', icon: '🏥' },
            { id: 'housing', name: '住房', icon: '🏠' },
            { id: 'daily', name: '日用', icon: '🧴' },
            { id: 'social', name: '社交', icon: '👥' },
            { id: 'other_expense', name: '其他', icon: '📦' }
        ],
        income: [
            { id: 'salary', name: '工资', icon: '💰' },
            { id: 'bonus', name: '奖金', icon: '🎁' },
            { id: 'pocket', name: '零花钱', icon: '🧸' },
            { id: 'investment', name: '投资', icon: '📈' },
            { id: 'parttime', name: '兼职', icon: '💼' },
            { id: 'gift', name: '红包', icon: '🧧' },
            { id: 'refund', name: '退款', icon: '💳' },
            { id: 'other_income', name: '其他', icon: '💎' }
        ]
    },

    /**
     * 初始化存储
     */
    init() {
        // 如果分类不存在，初始化默认分类
        if (!localStorage.getItem(this.KEYS.CATEGORIES)) {
            localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(this.DEFAULT_CATEGORIES));
        }
        // 如果记录不存在，初始化空数组
        if (!localStorage.getItem(this.KEYS.RECORDS)) {
            localStorage.setItem(this.KEYS.RECORDS, JSON.stringify([]));
        }
    },

    /**
     * 获取所有记录
     * @returns {Array} 记录数组
     */
    getRecords() {
        try {
            const records = localStorage.getItem(this.KEYS.RECORDS);
            return records ? JSON.parse(records) : [];
        } catch (e) {
            console.error('获取记录失败:', e);
            return [];
        }
    },

    /**
     * 保存记录
     * @param {Array} records 记录数组
     */
    saveRecords(records) {
        try {
            localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
        } catch (e) {
            console.error('保存记录失败:', e);
        }
    },

    /**
     * 添加新记录
     * @param {Object} record 记录对象
     * @returns {Object} 添加的记录
     */
    addRecord(record) {
        const records = this.getRecords();
        const newRecord = {
            id: this.generateId(),
            type: record.type, // 'income' 或 'expense'
            amount: parseFloat(record.amount),
            category: record.category,
            note: record.note || '',
            date: record.date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        records.unshift(newRecord); // 添加到开头
        this.saveRecords(records);
        return newRecord;
    },

    /**
     * 删除记录
     * @param {string} id 记录ID
     * @returns {boolean} 是否成功
     */
    deleteRecord(id) {
        const records = this.getRecords();
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records.splice(index, 1);
            this.saveRecords(records);
            return true;
        }
        return false;
    },

    /**
     * 更新记录
     * @param {string} id 记录ID
     * @param {Object} updates 更新内容
     * @returns {Object|null} 更新后的记录
     */
    updateRecord(id, updates) {
        const records = this.getRecords();
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = { ...records[index], ...updates };
            this.saveRecords(records);
            return records[index];
        }
        return null;
    },

    /**
     * 获取分类列表
     * @param {string} type 类型：'income' 或 'expense'
     * @returns {Array} 分类数组
     */
    getCategories(type) {
        try {
            const categories = localStorage.getItem(this.KEYS.CATEGORIES);
            if (categories) {
                const parsed = JSON.parse(categories);
                return type ? (parsed[type] || []) : parsed;
            }
            return type ? this.DEFAULT_CATEGORIES[type] : this.DEFAULT_CATEGORIES;
        } catch (e) {
            console.error('获取分类失败:', e);
            return type ? this.DEFAULT_CATEGORIES[type] : this.DEFAULT_CATEGORIES;
        }
    },

    /**
     * 获取分类信息
     * @param {string} categoryId 分类ID
     * @returns {Object|null} 分类信息
     */
    getCategoryById(categoryId) {
        const allCategories = [
            ...this.DEFAULT_CATEGORIES.expense,
            ...this.DEFAULT_CATEGORIES.income
        ];
        return allCategories.find(c => c.id === categoryId) || null;
    },

    /**
     * 按日期范围获取记录
     * @param {string} startDate 开始日期
     * @param {string} endDate 结束日期
     * @returns {Array} 记录数组
     */
    getRecordsByDateRange(startDate, endDate) {
        const records = this.getRecords();
        return records.filter(record => {
            return record.date >= startDate && record.date <= endDate;
        });
    },

    /**
     * 按类型获取记录
     * @param {string} type 类型：'income' 或 'expense'
     * @returns {Array} 记录数组
     */
    getRecordsByType(type) {
        const records = this.getRecords();
        return records.filter(record => record.type === type);
    },

    /**
     * 获取今日记录
     * @returns {Array} 记录数组
     */
    getTodayRecords() {
        const today = new Date().toISOString().split('T')[0];
        return this.getRecordsByDateRange(today, today);
    },

    /**
     * 获取本月记录
     * @returns {Array} 记录数组
     */
    getMonthRecords() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        return this.getRecordsByDateRange(startDate, endDate);
    },

    /**
     * 获取本周记录
     * @returns {Array} 记录数组
     */
    getWeekRecords() {
        const now = new Date();
        const dayOfWeek = now.getDay() || 7; // 周日为7
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek + 1);
        const endDate = new Date(now);
        endDate.setDate(now.getDate() + (7 - dayOfWeek));

        return this.getRecordsByDateRange(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );
    },

    /**
     * 获取本年记录
     * @returns {Array} 记录数组
     */
    getYearRecords() {
        const now = new Date();
        const startDate = `${now.getFullYear()}-01-01`;
        const endDate = `${now.getFullYear()}-12-31`;
        return this.getRecordsByDateRange(startDate, endDate);
    },

    /**
     * 计算收支汇总
     * @param {Array} records 记录数组
     * @returns {Object} 汇总信息
     */
    calculateSummary(records) {
        const summary = {
            income: 0,
            expense: 0,
            balance: 0
        };

        records.forEach(record => {
            if (record.type === 'income') {
                summary.income += record.amount;
            } else {
                summary.expense += record.amount;
            }
        });

        summary.balance = summary.income - summary.expense;
        return summary;
    },

    /**
     * 计算分类统计
     * @param {Array} records 记录数组
     * @param {string} type 类型：'income' 或 'expense'
     * @returns {Array} 分类统计数组
     */
    calculateCategoryStats(records, type) {
        const filteredRecords = records.filter(r => r.type === type);
        const categoryMap = {};

        filteredRecords.forEach(record => {
            if (!categoryMap[record.category]) {
                categoryMap[record.category] = 0;
            }
            categoryMap[record.category] += record.amount;
        });

        const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);

        return Object.entries(categoryMap)
            .map(([categoryId, amount]) => {
                const category = this.getCategoryById(categoryId);
                return {
                    id: categoryId,
                    name: category ? category.name : categoryId,
                    icon: category ? category.icon : '📦',
                    amount: amount,
                    percentage: total > 0 ? (amount / total * 100).toFixed(1) : 0
                };
            })
            .sort((a, b) => b.amount - a.amount);
    },

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * 清除所有数据
     */
    clearAll() {
        localStorage.removeItem(this.KEYS.RECORDS);
        localStorage.removeItem(this.KEYS.CATEGORIES);
        localStorage.removeItem(this.KEYS.SETTINGS);
        this.init();
    },

    /**
     * 导出数据
     * @returns {string} JSON字符串
     */
    exportData() {
        return JSON.stringify({
            records: this.getRecords(),
            categories: this.getCategories(),
            exportDate: new Date().toISOString()
        }, null, 2);
    },

    /**
     * 导入数据
     * @param {string} jsonData JSON字符串
     * @returns {boolean} 是否成功
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.records) {
                this.saveRecords(data.records);
            }
            if (data.categories) {
                localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(data.categories));
            }
            return true;
        } catch (e) {
            console.error('导入数据失败:', e);
            return false;
        }
    },

    /**
     * 获取最近N条记录
     * @param {number} n 数量
     * @returns {Array} 记录数组
     */
    getRecentRecords(n = 10) {
        const records = this.getRecords();
        return records.slice(0, n);
    },

    /**
     * 搜索记录
     * @param {string} keyword 关键词
     * @returns {Array} 记录数组
     */
    searchRecords(keyword) {
        const records = this.getRecords();
        const lowerKeyword = keyword.toLowerCase();
        return records.filter(record => {
            const category = this.getCategoryById(record.category);
            const categoryName = category ? category.name.toLowerCase() : '';
            const note = record.note ? record.note.toLowerCase() : '';
            return categoryName.includes(lowerKeyword) || note.includes(lowerKeyword);
        });
    }
};

// 初始化存储
Storage.init();
