/**
 * 猫咪记账 - 主应用模块
 * 处理页面导航、用户交互和业务逻辑
 */

const App = {
    // 当前状态
    currentType: 'expense',
    currentPage: 'home',
    currentStatsPeriod: 'month',
    selectedCategory: null,
    confirmCallback: null,

    /**
     * 初始化应用
     */
    init() {
        // 初始化模块
        CatPopup.init();

        // 设置默认日期
        this.setDefaultDate();

        // 加载首页数据
        this.loadHomePage();

        // 更新顶部日期
        this.updateHeaderDate();

        // 加载分类
        this.loadCategories();

        // 隐藏启动画面
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.style.display = 'none';
                document.getElementById('app').classList.remove('hidden');
            }, 500);
        }, 1500);

        // 添加淡出动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * 设置默认日期
     */
    setDefaultDate() {
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    },

    /**
     * 更新顶部日期显示
     */
    updateHeaderDate() {
        const headerDate = document.getElementById('headerDate');
        if (headerDate) {
            const now = new Date();
            const options = { month: 'long', day: 'numeric', weekday: 'long' };
            headerDate.textContent = now.toLocaleDateString('zh-CN', options);
        }
    },

    /**
     * 切换页面
     * @param {string} pageName 页面名称
     */
    showPage(pageName) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // 更新导航栏状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        this.currentPage = pageName;

        // 加载页面数据
        switch (pageName) {
            case 'home':
                this.loadHomePage();
                break;
            case 'add':
                this.loadCategories();
                break;
            case 'stats':
                this.loadStatsPage();
                break;
            case 'records':
                this.loadRecordsPage();
                break;
        }
    },

    /**
     * 切换收支类型
     * @param {string} type 类型：'income' 或 'expense'
     */
    switchType(type) {
        this.currentType = type;
        this.selectedCategory = null;

        // 更新按钮状态
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });

        // 重新加载分类
        this.loadCategories();
    },

    /**
     * 加载分类网格
     */
    loadCategories() {
        const categoryGrid = document.getElementById('categoryGrid');
        if (!categoryGrid) return;

        const categories = Storage.getCategories(this.currentType);

        categoryGrid.innerHTML = categories.map(category => `
            <div class="category-item ${this.selectedCategory === category.id ? 'selected' : ''}"
                 onclick="App.selectCategory('${category.id}')">
                <span class="icon">${category.icon}</span>
                <span class="name">${category.name}</span>
            </div>
        `).join('');
    },

    /**
     * 选择分类
     * @param {string} categoryId 分类ID
     */
    selectCategory(categoryId) {
        this.selectedCategory = categoryId;

        // 更新分类选中状态
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
    },

    /**
     * 保存记录
     */
    saveRecord() {
        const amountInput = document.getElementById('amountInput');
        const noteInput = document.getElementById('noteInput');
        const dateInput = document.getElementById('dateInput');

        const amount = parseFloat(amountInput.value);
        const note = noteInput.value.trim();
        const date = dateInput.value;

        // 验证
        if (!amount || amount <= 0) {
            this.showToast('请输入有效金额');
            return;
        }

        if (!this.selectedCategory) {
            this.showToast('请选择分类');
            return;
        }

        if (!date) {
            this.showToast('请选择日期');
            return;
        }

        // 保存记录
        const record = Storage.addRecord({
            type: this.currentType,
            amount: amount,
            category: this.selectedCategory,
            note: note,
            date: date
        });

        // 显示猫咪弹窗
        CatPopup.show(this.currentType);

        // 清空表单
        amountInput.value = '';
        noteInput.value = '';
        this.setDefaultDate();
        this.selectedCategory = null;
        this.loadCategories();

        // 显示成功提示
        this.showToast('记录保存成功！');

        // 返回首页
        setTimeout(() => {
            this.showPage('home');
        }, 500);
    },

    /**
     * 加载首页
     */
    loadHomePage() {
        // 更新本月汇总
        const monthSummary = Storage.calculateSummary(Storage.getMonthRecords());
        document.getElementById('monthIncome').textContent = `¥${monthSummary.income.toFixed(2)}`;
        document.getElementById('monthExpense').textContent = `¥${monthSummary.expense.toFixed(2)}`;
        document.getElementById('monthBalance').textContent = `¥${monthSummary.balance.toFixed(2)}`;

        // 加载最近记录
        this.loadRecentRecords();
    },

    /**
     * 加载最近记录
     */
    loadRecentRecords() {
        const recentRecords = document.getElementById('recentRecords');
        const records = Storage.getRecentRecords(10);

        if (records.length === 0) {
            recentRecords.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>还没有记录哦，快来记一笔吧~</p>
                </div>
            `;
            return;
        }

        recentRecords.innerHTML = records.map(record => this.createRecordHTML(record)).join('');
    },

    /**
     * 创建记录HTML
     * @param {Object} record 记录对象
     * @returns {string} HTML字符串
     */
    createRecordHTML(record) {
        const category = Storage.getCategoryById(record.category);
        const categoryName = category ? category.name : record.category;
        const categoryIcon = category ? category.icon : '📦';
        const isIncome = record.type === 'income';
        const amountClass = isIncome ? 'income' : 'expense';
        const amountPrefix = isIncome ? '+' : '-';

        return `
            <div class="record-item" onclick="App.showRecordDetail('${record.id}')">
                <div class="record-icon ${amountClass}">
                    ${categoryIcon}
                </div>
                <div class="record-info">
                    <div class="record-category">${categoryName}</div>
                    <div class="record-note">${record.note || '无备注'}</div>
                </div>
                <div class="record-amount ${amountClass}">
                    ${amountPrefix}¥${record.amount.toFixed(2)}
                </div>
                <div class="record-date">${this.formatDate(record.date)}</div>
            </div>
        `;
    },

    /**
     * 格式化日期
     * @param {string} dateStr 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return '今天';
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return '昨天';
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    },

    /**
     * 加载统计页面
     */
    loadStatsPage() {
        // 更新汇总数据
        const summary = Statistics.getSummary(this.currentStatsPeriod);
        document.getElementById('statsIncome').textContent = `¥${summary.income.toFixed(2)}`;
        document.getElementById('statsExpense').textContent = `¥${summary.expense.toFixed(2)}`;
        document.getElementById('statsBalance').textContent = `¥${summary.balance.toFixed(2)}`;

        // 绘制饼图
        const categoryStats = Statistics.getCategoryStats(this.currentStatsPeriod, 'expense');
        Statistics.drawPieChart('pieChart', categoryStats.map(item => ({
            name: item.name,
            value: item.amount,
            percentage: item.percentage
        })));

        // 更新图例
        document.getElementById('categoryLegend').innerHTML = Statistics.generateLegendHTML(categoryStats);

        // 绘制趋势图
        const trendData = Statistics.getTrendData(this.currentStatsPeriod);
        Statistics.drawTrendChart('trendChart', trendData, this.currentStatsPeriod);
    },

    /**
     * 切换统计时间段
     * @param {string} period 时间段：'week', 'month', 'year'
     */
    switchStatsPeriod(period) {
        this.currentStatsPeriod = period;

        // 更新标签状态
        document.querySelectorAll('.stats-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.period === period) {
                tab.classList.add('active');
            }
        });

        // 重新加载统计页面
        this.loadStatsPage();
    },

    /**
     * 加载记录列表页面
     */
    loadRecordsPage() {
        // 更新筛选器分类选项
        this.updateFilterCategories();

        // 加载所有记录
        this.filterRecords();
    },

    /**
     * 更新筛选器分类选项
     */
    updateFilterCategories() {
        const filterCategory = document.getElementById('filterCategory');
        const expenseCategories = Storage.getCategories('expense');
        const incomeCategories = Storage.getCategories('income');
        const allCategories = [...expenseCategories, ...incomeCategories];

        // 去重
        const uniqueCategories = allCategories.filter((category, index, self) =>
            index === self.findIndex(c => c.id === category.id)
        );

        filterCategory.innerHTML = `
            <option value="all">全部分类</option>
            ${uniqueCategories.map(category => `
                <option value="${category.id}">${category.icon} ${category.name}</option>
            `).join('')}
        `;
    },

    /**
     * 筛选记录
     */
    filterRecords() {
        const filterType = document.getElementById('filterType').value;
        const filterCategory = document.getElementById('filterCategory').value;
        const allRecords = document.getElementById('allRecords');

        let records = Storage.getRecords();

        // 按类型筛选
        if (filterType !== 'all') {
            records = records.filter(record => record.type === filterType);
        }

        // 按分类筛选
        if (filterCategory !== 'all') {
            records = records.filter(record => record.category === filterCategory);
        }

        if (records.length === 0) {
            allRecords.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>没有找到匹配的记录</p>
                </div>
            `;
            return;
        }

        allRecords.innerHTML = records.map(record => this.createRecordHTML(record)).join('');
    },

    /**
     * 显示记录详情
     * @param {string} recordId 记录ID
     */
    showRecordDetail(recordId) {
        const records = Storage.getRecords();
        const record = records.find(r => r.id === recordId);

        if (!record) return;

        const category = Storage.getCategoryById(record.category);
        const categoryName = category ? category.name : record.category;
        const categoryIcon = category ? category.icon : '📦';
        const isIncome = record.type === 'income';

        // 显示确认对话框
        this.showConfirm(
            `${categoryIcon} ${categoryName}\n金额: ${isIncome ? '+' : '-'}¥${record.amount.toFixed(2)}\n备注: ${record.note || '无'}\n日期: ${record.date}\n\n确定要删除这条记录吗？`,
            () => {
                Storage.deleteRecord(recordId);
                this.showToast('记录已删除');
                this.loadRecordsPage();
                this.loadHomePage();
            }
        );
    },

    /**
     * 显示设置弹窗
     */
    showSettings() {
        document.getElementById('settingsModal').classList.remove('hidden');
    },

    /**
     * 隐藏设置弹窗
     */
    hideSettings() {
        document.getElementById('settingsModal').classList.add('hidden');
    },

    /**
     * 清除所有数据
     */
    clearAllData() {
        this.showConfirm('确定要清除所有数据吗？此操作不可恢复！', () => {
            Storage.clearAll();
            this.showToast('数据已清除');
            this.hideSettings();
            this.loadHomePage();
        });
    },

    /**
     * 导出数据
     */
    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cat_accounting_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('数据导出成功');
    },

    /**
     * 显示确认对话框
     * @param {string} message 消息
     * @param {Function} callback 回调函数
     */
    showConfirm(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        this.confirmCallback = callback;
        document.getElementById('confirmModal').classList.remove('hidden');
    },

    /**
     * 隐藏确认对话框
     */
    hideConfirm() {
        document.getElementById('confirmModal').classList.add('hidden');
        this.confirmCallback = null;
    },

    /**
     * 确认操作
     */
    confirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirm();
    },

    /**
     * 显示提示消息
     * @param {string} message 消息
     * @param {number} duration 显示时长（毫秒）
     */
    showToast(message, duration = 2000) {
        // 移除现有的toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // 自动移除
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
};

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
