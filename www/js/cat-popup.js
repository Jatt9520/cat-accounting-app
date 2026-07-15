/**
 * 猫咪记账 - 猫咪弹窗模块
 * 新增账单时弹出随机小猫，搭配淡入动画
 */

const CatPopup = {
    // 猫咪表情集合
    CAT_EMOJIS: [
        '🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
        '🐈', '🐈‍⬛', '🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀'
    ],

    // 猫咪消息集合
    MESSAGES: {
        expense: [
            '喵~ 又花钱啦！',
            '主人要省钱哦~',
            '喵呜，钱包瘦了~',
            '下次少花点喵~',
            '记账是好习惯喵！',
            '猫咪帮你记住了~',
            '花钱要三思喵~',
            '喵~ 消费要理性哦',
            '主人辛苦啦喵~',
            '攒钱买小鱼干喵~'
        ],
        income: [
            '喵~ 收到钱啦！',
            '主人好厉害~',
            '喵呜，钱包鼓了~',
            '继续努力喵~',
            '赚钱不易喵~',
            '猫咪为你开心~',
            '喵~ 财源滚滚来',
            '主人真棒喵~',
            '存起来喵~',
            '喵~ 日子更好了'
        ]
    },

    // 弹窗元素
    popupElement: null,
    catEmojiElement: null,
    catMessageElement: null,

    // 定时器
    hideTimer: null,

    /**
     * 初始化猫咪弹窗模块
     */
    init() {
        this.popupElement = document.getElementById('catPopup');
        this.catEmojiElement = document.getElementById('catEmoji');
        this.catMessageElement = document.getElementById('catMessage');

        // 点击弹窗关闭
        this.popupElement.addEventListener('click', () => {
            this.hide();
        });
    },

    /**
     * 显示猫咪弹窗
     * @param {string} type 类型：'income' 或 'expense'
     */
    show(type = 'expense') {
        // 清除之前的定时器
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }

        // 随机选择猫咪表情
        const randomCat = this.CAT_EMOJIS[Math.floor(Math.random() * this.CAT_EMOJIS.length)];

        // 随机选择消息
        const messages = this.MESSAGES[type] || this.MESSAGES.expense;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // 设置内容
        this.catEmojiElement.textContent = randomCat;
        this.catMessageElement.textContent = randomMessage;

        // 显示弹窗
        this.popupElement.classList.remove('hidden');

        // 添加动画效果
        this.animateCat();

        // 2秒后自动隐藏
        this.hideTimer = setTimeout(() => {
            this.hide();
        }, 2000);
    },

    /**
     * 隐藏猫咪弹窗
     */
    hide() {
        if (this.popupElement) {
            // 添加淡出动画
            this.popupElement.style.animation = 'fadeOut 0.3s ease forwards';

            setTimeout(() => {
                this.popupElement.classList.add('hidden');
                this.popupElement.style.animation = '';
            }, 300);
        }
    },

    /**
     * 猫咪动画效果
     */
    animateCat() {
        if (this.catEmojiElement) {
            // 重置动画
            this.catEmojiElement.style.animation = 'none';
            this.catEmojiElement.offsetHeight; // 触发重排
            this.catEmojiElement.style.animation = 'catBounce 0.5s ease';
        }
    },

    /**
     * 随机选择猫咪表情
     * @returns {string} 猫咪表情
     */
    getRandomCat() {
        return this.CAT_EMOJIS[Math.floor(Math.random() * this.CAT_EMOJIS.length)];
    },

    /**
     * 随机选择消息
     * @param {string} type 类型
     * @returns {string} 消息
     */
    getRandomMessage(type) {
        const messages = this.MESSAGES[type] || this.MESSAGES.expense;
        return messages[Math.floor(Math.random() * messages.length)];
    }
};

// 添加淡出动画到CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
