/**
 * 猫咪记账 - 统计图表模块
 * 使用 Canvas 绘制饼图和趋势图
 */

const Statistics = {
    // 图表颜色
    CHART_COLORS: [
        '#FF69B4', '#FF4757', '#FFA502', '#2ED573', '#1E90FF',
        '#9C27B0', '#FF5722', '#795548', '#607D8B', '#E91E63',
        '#3F51B5', '#00BCD4', '#8BC34A', '#FFC107', '#FF9800'
    ],

    /**
     * 绘制饼图
     * @param {string} canvasId Canvas元素ID
     * @param {Array} data 数据数组 [{name, value, percentage}]
     */
    drawPieChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !data || data.length === 0) {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#999';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('暂无数据', canvas.width / 2, canvas.height / 2);
            }
            return;
        }

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 30;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 计算总量
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;

        // 绘制饼图
        let startAngle = -Math.PI / 2;

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            // 绘制扇形
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();

            // 设置颜色
            ctx.fillStyle = this.CHART_COLORS[index % this.CHART_COLORS.length];
            ctx.fill();

            // 绘制边框
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制标签（如果扇形足够大）
            if (sliceAngle > 0.3) {
                const labelAngle = startAngle + sliceAngle / 2;
                const labelRadius = radius * 0.7;
                const labelX = centerX + Math.cos(labelAngle) * labelRadius;
                const labelY = centerY + Math.sin(labelAngle) * labelRadius;

                // 绘制百分比
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${item.percentage}%`, labelX, labelY);
            }

            startAngle = endAngle;
        });

        // 绘制中心圆（甜甜圈效果）
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // 绘制中心文字
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('支出', centerX, centerY - 10);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(`¥${total.toFixed(2)}`, centerX, centerY + 15);
    },

    /**
     * 绘制趋势图
     * @param {string} canvasId Canvas元素ID
     * @param {Array} data 数据数组 [{date, income, expense}]
     * @param {string} period 时间段：'week', 'month', 'year'
     */
    drawTrendChart(canvasId, data, period = 'week') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 30, right: 30, bottom: 50, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        if (!data || data.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无数据', width / 2, height / 2);
            return;
        }

        // 找出最大值
        const maxValue = Math.max(
            ...data.map(d => Math.max(d.income, d.expense)),
            100
        );

        // 计算刻度
        const yScale = chartHeight / maxValue;
        const xScale = chartWidth / (data.length - 1 || 1);

        // 绘制背景网格
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // 绘制Y轴标签
        ctx.fillStyle = '#666';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            const value = maxValue - (maxValue / 5) * i;
            ctx.fillText(value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0), padding.left - 10, y);
        }

        // 绘制X轴标签
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        data.forEach((item, index) => {
            const x = padding.left + index * xScale;
            let label = item.date;
            if (period === 'month') {
                label = item.date.split('-')[2] + '日';
            } else if (period === 'year') {
                label = item.date.split('-')[1] + '月';
            }
            ctx.fillText(label, x, height - padding.bottom + 10);
        });

        // 绘制收入折线
        this.drawLine(ctx, data, 'income', padding, xScale, yScale, '#FF69B4');

        // 绘制支出折线
        this.drawLine(ctx, data, 'expense', padding, xScale, yScale, '#FF4757');

        // 绘制图例
        this.drawLegend(ctx, width - padding.right - 100, padding.top - 20);
    },

    /**
     * 绘制折线
     * @param {CanvasRenderingContext2D} ctx Canvas上下文
     * @param {Array} data 数据
     * @param {string} key 数据键名
     * @param {Object} padding 边距
     * @param {number} xScale X轴缩放
     * @param {number} yScale Y轴缩放
     * @param {string} color 颜色
     */
    drawLine(ctx, data, key, padding, xScale, yScale, color) {
        if (data.length === 0) return;

        // 绘制线条
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        data.forEach((item, index) => {
            const x = padding.left + index * xScale;
            const y = padding.top + (1 - item[key] * yScale / (ctx.canvas.height - padding.top - padding.bottom)) * (ctx.canvas.height - padding.top - padding.bottom);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // 绘制数据点
        data.forEach((item, index) => {
            const x = padding.left + index * xScale;
            const y = padding.top + (1 - item[key] * yScale / (ctx.canvas.height - padding.top - padding.bottom)) * (ctx.canvas.height - padding.top - padding.bottom);

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    },

    /**
     * 绘制图例
     * @param {CanvasRenderingContext2D} ctx Canvas上下文
     * @param {number} x X坐标
     * @param {number} y Y坐标
     */
    drawLegend(ctx, x, y) {
        // 收入图例
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(x, y, 12, 12);
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('收入', x + 18, y + 6);

        // 支出图例
        ctx.fillStyle = '#FF4757';
        ctx.fillRect(x + 70, y, 12, 12);
        ctx.fillStyle = '#333';
        ctx.fillText('支出', x + 88, y + 6);
    },

    /**
     * 生成分类图例HTML
     * @param {Array} data 数据数组
     * @returns {string} HTML字符串
     */
    generateLegendHTML(data) {
        if (!data || data.length === 0) {
            return '<div style="text-align: center; color: #999;">暂无数据</div>';
        }

        return data.map((item, index) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${this.CHART_COLORS[index % this.CHART_COLORS.length]}"></div>
                <span>${item.icon} ${item.name}</span>
                <span style="color: #666; margin-left: 5px;">¥${item.amount.toFixed(2)}</span>
            </div>
        `).join('');
    },

    /**
     * 获取趋势数据
     * @param {string} period 时间段：'week', 'month', 'year'
     * @returns {Array} 趋势数据数组
     */
    getTrendData(period = 'week') {
        const now = new Date();
        let startDate, endDate, dateFormat;

        switch (period) {
            case 'week':
                // 本周数据
                const dayOfWeek = now.getDay() || 7;
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek + 1);
                endDate = new Date(now);
                endDate.setDate(now.getDate() + (7 - dayOfWeek));
                dateFormat = 'day';
                break;

            case 'month':
                // 本月数据
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                dateFormat = 'day';
                break;

            case 'year':
                // 本年数据
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                dateFormat = 'month';
                break;

            default:
                return [];
        }

        // 获取记录
        const records = Storage.getRecordsByDateRange(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );

        // 按日期分组
        const groupedData = {};

        if (dateFormat === 'day') {
            // 按天分组
            const currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                groupedData[dateStr] = { date: dateStr, income: 0, expense: 0 };
                currentDate.setDate(currentDate.getDate() + 1);
            }
        } else {
            // 按月分组
            for (let month = 0; month < 12; month++) {
                const dateStr = `${now.getFullYear()}-${String(month + 1).padStart(2, '0')}`;
                groupedData[dateStr] = { date: dateStr, income: 0, expense: 0 };
            }
        }

        // 填充数据
        records.forEach(record => {
            let dateKey;
            if (dateFormat === 'day') {
                dateKey = record.date;
            } else {
                dateKey = record.date.substring(0, 7); // YYYY-MM
            }

            if (groupedData[dateKey]) {
                if (record.type === 'income') {
                    groupedData[dateKey].income += record.amount;
                } else {
                    groupedData[dateKey].expense += record.amount;
                }
            }
        });

        return Object.values(groupedData);
    },

    /**
     * 获取分类统计数据
     * @param {string} period 时间段：'week', 'month', 'year'
     * @param {string} type 类型：'income' 或 'expense'
     * @returns {Array} 分类统计数据
     */
    getCategoryStats(period = 'month', type = 'expense') {
        let records;

        switch (period) {
            case 'week':
                records = Storage.getWeekRecords();
                break;
            case 'month':
                records = Storage.getMonthRecords();
                break;
            case 'year':
                records = Storage.getYearRecords();
                break;
            default:
                records = Storage.getMonthRecords();
        }

        return Storage.calculateCategoryStats(records, type);
    },

    /**
     * 获取收支汇总
     * @param {string} period 时间段：'week', 'month', 'year'
     * @returns {Object} 汇总信息
     */
    getSummary(period = 'month') {
        let records;

        switch (period) {
            case 'week':
                records = Storage.getWeekRecords();
                break;
            case 'month':
                records = Storage.getMonthRecords();
                break;
            case 'year':
                records = Storage.getYearRecords();
                break;
            default:
                records = Storage.getMonthRecords();
        }

        return Storage.calculateSummary(records);
    }
};
