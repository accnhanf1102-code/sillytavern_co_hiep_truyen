/**
 * game-config.js - 游戏配置文件
 * 
 * 文件概述：
 * 包含游戏的所有静态配置数据，如数值范围、NPC信息、地点名称、概率配置等。
 * 这是一个纯配置文件，不包含任何逻辑函数，其他模块会引用这些配置。
 * 
 * 主要内容：
 * - valueRanges: 各项数值的最小值和最大值范围定义
 * - locationNames: 地点ID到中文名称的映射
 * - seasonNameMap: 季节英文到中文的映射
 * - npcs: NPC基本信息（名字、描述、头像ID）
 * - npcNameToId: NPC名字到ID的映射表
 * - npcPortraits: NPC立绘图片URL映射
 * - locationBackgrounds: 地点背景图URL映射
 * - actionConfigs: 各种行动的配置（天赋加成、影响属性）
 * - npcLocationProbability: NPC在各地点出现的概率配置
 * - npcSparRewards: NPC切磋奖励配置
 * - item_list: 道具列表配置（武器、防具、饰品、食物、材料等）
 * - defaultGameData: 游戏初始数据
 * - slgEmotionOptions: SLG模式表情选项列表
 * - slgCGOptions: SLG模式CG选项列表
 * - emotionSynonyms/sceneSynonyms/npcSynonyms/cgSynonyms: 模糊匹配同义词映射
 * 
 * 对外暴露的主要变量：
 * - valueRanges: 用于数值范围检查
 * - locationNames/seasonNameMap: 用于显示地点和季节中文名
 * - npcs/npcNameToId/npcPortraits: 用于NPC相关功能
 * - actionConfigs: 用于计算行动结果
 * - item_list: 用于道具系统
 * - defaultGameData: 用于初始化游戏数据
 * - slgEmotionOptions/slgCGOptions: 用于SLG模式文本解析
 * 
 * 依赖关系：
 * 无依赖，是最底层的配置文件
 */

// 数值范围定义
const valueRanges = {
    playerTalents: {
        根骨: { min: 0, max: 100 },
        悟性: { min: 0, max: 100 },
        心性: { min: 0, max: 100 },
        魅力: { min: 0, max: 100 }
    },
    playerStats: {
        武学: { min: 0, max: 300 },
        学识: { min: 0, max: 300 },
        声望: { min: 0, max: 300 },
        金钱: { min: 0, max: 999999 }
    },
    combatStats: {
        攻击力: { min: 10, max: 300 },
        生命值: { min: 25, max: 600 }
    },
    playerMood: { min: 0, max: 120 },
    npcFavorability: { min: 0, max: 100 },
    actionPoints: { min: 0, max: 3 },
    currentWeek: { min: 1, max: 9999 }
};

// 地点名称映射
const locationNames = {
    yanwuchang: 'Diễn Võ Trường',
    cangjingge: 'Tàng Kinh Các',
    huofang: 'Nhà Bếp',
    houshan: 'Hậu Sơn',
    yishiting: 'Nghị Sự Sảnh',
    tiejiangpu: 'Tiệm Rèn',
    nandizi: 'Phòng Nam Đệ Tử',
    nvdizi: 'Phòng Nữ Đệ Tử',
    shanmen: 'Sơn Môn',
    gongtian: 'Ruộng Công',
    danfang: 'Đan Phòng',
    tianshanpai: 'Thiên Sơn Phái',
    none: 'none'
};

const seasonNameMap = {
    'spring': 'Mùa Xuân',
    'summer': 'Mùa Hạ',
    'autumn': 'Mùa Thu',
    'winter': 'Mùa Đông'
};

// NPC定义
const npcs = {
    A: {
        name: "Phá Trận Tử",
        description: "34 tuổi, nam giới tộc Hồi Hốt, Ngoại Vụ trưởng lão Thiên Sơn Phái, thủ lĩnh nghĩa quân Tây Vực, sư phụ của Hô Diên Hiển và Vũ Chúc.",
        avatar: "A"
    },
    B: {
        name: "Động Đình Quân",
        description: "27 tuổi (bề ngoài 14 tuổi), nữ giới tộc Hán, Hình Phạt trưởng lão Thiên Sơn Phái, tỷ tỷ của Tiền Đường Quân.",
        avatar: "B"
    },
    C: {
        name: "Tiền Đường Quân",
        description: "19 tuổi, nữ giới lai Đảng Hạng và Hán, đệ tử nội môn Thiên Sơn Phái, muội muội của Động Đình Quân, đệ tử của cố chưởng môn Trương Thiên Nghĩa.",
        avatar: "C"
    },
    D: {
        name: "Tiêu Bạch Hô",
        description: "14 tuổi, nữ giới tộc Hán, đệ tử ngoại môn Thiên Sơn Phái, đệ tử nhỏ tuổi nhất đời thứ tám.",
        avatar: "D"
    },
    E: {
        name: "Cơ Tự",
        description: "Bề ngoài 28 tuổi, nữ giới tộc Hán, đệ tử nội môn Thiên Sơn Phái, bối phận bí ẩn, từ chưởng môn đến đệ tử đời thứ tám đều gọi là sư tỷ.",
        avatar: "E"
    },
    F: {
        name: "Thi Diên Niên",
        description: "16 tuổi, nữ giới tộc Hán, đệ tử ngoại môn Thiên Sơn Phái, quản lý Tàng Kinh Các.",
        avatar: "F"
    },
    G: {
        name: "Hô Diên Hiển",
        description: "24 tuổi, nam giới tộc Hung Nô, đệ tử nội môn Thiên Sơn Phái, đại sư huynh đời thứ tám, đệ tử của Phá Trận Tử, tăng nhân đới phát tu hành.",
        avatar: "G"
    },
    H: {
        name: "Vũ Chúc",
        description: "15 tuổi, nữ giới tộc Phạn Diễn Na, đệ tử nội môn Thiên Sơn Phái, đệ tử của Phá Trận Tử.",
        avatar: "H"
    },
    I: {
        name: "An Mộ",
        description: "18 tuổi, nữ giới tộc Hán, đệ tử ngoại môn Thiên Sơn Phái, đầu bếp chính của nhà bếp.",
        avatar: "I"
    },
    J: {
        name: "Đường Mộc Lê",
        description: "20 tuổi, nữ giới tộc Hán, đại tiểu thư Đường Môn đất Thục, đệ tử khách mời của Thiên Sơn Phái.",
        avatar: "J"
    },
    K: {
        name: "Lạc Tiềm U",
        description: "17 tuổi, nữ giới tộc Hán, đệ tử ngoại môn Thiên Sơn Phái, phụ trách nữ công thêu thùa và tiếp đãi khách quý.",
        avatar: "K"
    },
    L: {
        name: "Tạp Dịch Bí Ẩn",
        description: "Tạp dịch Thiên Sơn Phái, cao lớn béo tốt, chưa bao giờ lộ mặt thật, nhân vật bí ẩn không rõ tên tuổi lai lịch.",
        avatar: "L"
    },
    // Z: {
    //     name: "Nhân vật mới Z",
    //     description: "Mô tả giữ chỗ: Điền bối cảnh và tính cách nhân vật vào đây.",
    //     avatar: "Z"
    // },
    M: {
        name: "Huyền Thiên Thanh",
        description: "31 tuổi, nam giới tộc Hán, Kỳ Hoàng trưởng lão Thiên Sơn Phái, quản lý Đan Dược Phòng.",
        avatar: "M"
    },
    N: {
        name: "Lộc Xuân Nhược",
        description: "17 tuổi, nữ giới tộc Hán, đệ tử Côn Luân Phái, đệ tử khách mời Thiên Sơn Phái, đệ tử ký danh của Huyền Thiên Thanh.",
        avatar: "N"
    },
    O: {
        name: "Linh Tuyết Phi",
        description: "26 tuổi, nữ giới tộc Hán, Thị Kiếm trưởng lão Thiên Sơn Phái, đệ nhất cao thủ trong phái.",
        avatar: "O"
    }
};

// NPC名字到ID的映射
const npcNameToId = {
    "破阵子": "A",
    "洞庭君": "B",
    "钱塘君": "C",
    "萧白瑚": "D",
    "姬姒": "E",
    "施延年": "F",
    "呼延显": "G",
    "雨烛": "H",
    "安慕": "I",
    "唐沐梨": "J",
    "洛潜幽": "K",
    "神秘杂役": "L",
    // "新角色Z": "Z",
    "玄天青": "M",
    "鹿椿若": "N",
    "苓雪妃": "O"
};

// NPC立绘URL映射
const npcPortraits = {
    A: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/破阵子.webp',
    B: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/洞庭君.webp',
    C: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/钱塘君.webp',
    D: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/萧白瑚.webp',
    E: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/姬姒.webp',
    F: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/施延年.webp',
    G: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/呼延显.webp',
    H: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/雨烛.webp',
    I: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/安慕.webp',
    J: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/唐沐梨.webp',
    K: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/洛潜幽.webp',
    L: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/神秘杂役.webp',
    // Z: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/杂鱼1.webp',
    M: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/玄天青.webp',
    N: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/鹿椿若.webp',
    O: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/NPC/苓雪妃.webp'
};

// 地点背景图映射
const locationBackgrounds = {
    yanwuchang: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/演武场.webp',
    cangjingge: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/藏经阁.webp',
    huofang: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/伙房.webp',
    houshan: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/后山.webp',
    yishiting: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/议事厅.webp',
    tiejiangpu: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/铁匠铺.webp',
    nandizi: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/男弟子房.webp',
    nvdizi: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/女弟子房.webp',
    shanmen: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/山门.webp',
    tianshanpai: 'https://cdn.jsdelivr.net/gh/Ji-Haitang/char_card_1@main/img/location/天山派.webp'
};

// 互动配置
const actionConfigs = {
    练武: { talentBonus: '根骨', affects: '武学' },
    学习: { talentBonus: '悟性', affects: '学识' },
    打杂: { talentBonus: '根骨', affects: '金钱' },
    秘密赌场: { talentBonus: '魅力', affects: '金钱' },
    探索: { talentBonus: '悟性', affects: '金钱' },
    汇报: { talentBonus: '悟性', affects: '声望' },
    打铁: { talentBonus: '心性', affects: '金钱' },
    休息: { talentBonus: '心性', affects: '体力' },
    拜访: { talentBonus: '魅力', affects: '声望' },
    下山: { talentBonus: '心性', affects: '声望' },
    炼丹: { talentBonus: '悟性', affects: '学识' }
};

const npcSparRewards = {
    A: { type: '武学', value: 5 },      // 破阵子 - 武学+3
    B: { type: '声望', value: 5 },      // 洞庭君 - 声望+2
    C: { type: '金钱', value: 500 },    // 钱塘君 - 金钱+300
    D: { type: '武学', value: 1 },      // 萧白瑚 - 根骨+1
    E: { type: '武学', value: 3 },      // 姬姒 - 武学+5
    F: { type: '学识', value: 3 },      // 施延年 - 学识+3
    G: { type: '学识', value: 4 },      // 呼延显 - 悟性+1
    H: { type: '声望', value: 1 },      // 雨烛 - 心性+1
    I: { type: '金钱', value: 300 },    // 安慕 - 金钱+500
    J: { type: '金钱', value: 1000 },      // 唐沐梨 - 魅力+1
    K: { type: '学识', value: 2 },      // 洛潜幽 - 学识+2
    L: { type: '金钱', value: 3000 },   // 神秘杂役 - 金钱+1000
    // Z: { type: '声望', value: 1 },
    M: { type: '学识', value: 5 },      // 玄天青 - 岐黄长老，医术知识渊博
    N: { type: '学识', value: 1 },      // 鹿椿若 - 武功平平，略懂医理
    O: { type: '武学', value: 6 }       // 苓雪妃 - 第一高手，武学巅峰
};

// NPC在各地点的出现概率
const npcLocationProbability = {
    A: {  // 破阵子 - 外务长老，需要视察公田
        yanwuchang: 0.15,
        cangjingge: 0.05,
        huofang: 0.05,
        houshan: 0.15,
        yishiting: 0.20,
        tiejiangpu: 0.05,
        nandizi: 0.05,
        nvdizi: 0.00,
        shanmen: 0.05,
        gongtian: 0.10,  // 视察农业生产
        danfang: 0.00,   // 很少去丹房
        none: 0.15
    },
    B: {  // 洞庭君 - 刑罚长老，偶尔视察
        yanwuchang: 0.15,
        cangjingge: 0.10,
        huofang: 0.05,
        houshan: 0.05,
        yishiting: 0.25,
        tiejiangpu: 0.05,
        nandizi: 0.00,
        nvdizi: 0.15,
        shanmen: 0.05,
        gongtian: 0.05,  // 偶尔视察
        danfang: 0.05,   // 偶尔去丹房检查
        none: 0.05
    },
    C: {  // 钱塘君 - 活泼好动，会去公田玩
        yanwuchang: 0.15,
        cangjingge: 0.05,
        huofang: 0.05,
        houshan: 0.20,
        yishiting: 0.05,
        tiejiangpu: 0.10,
        nandizi: 0.00,
        nvdizi: 0.15,
        shanmen: 0.05,
        gongtian: 0.10,  // 去捣乱或帮忙
        danfang: 0.05,   // 好奇去看看
        none: 0.05
    },
    D: {  // 萧白瑚 - 外门弟子，需要参与劳作
        yanwuchang: 0.20,
        cangjingge: 0.05,
        huofang: 0.15,
        houshan: 0.10,
        yishiting: 0.00,
        tiejiangpu: 0.05,
        nandizi: 0.00,
        nvdizi: 0.20,
        shanmen: 0.05,
        gongtian: 0.10,  // 外门弟子劳作
        danfang: 0.05,   // 帮忙打杂
        none: 0.05
    },
    E: {  // 姬姒 - 贪吃，会去看有什么能吃的
        yanwuchang: 0.10,
        cangjingge: 0.10,
        huofang: 0.20,
        houshan: 0.15,
        yishiting: 0.05,
        tiejiangpu: 0.05,
        nandizi: 0.00,
        nvdizi: 0.15,
        shanmen: 0.05,
        gongtian: 0.05,  // 看看有什么能吃的
        danfang: 0.05,   // 对丹药有兴趣
        none: 0.05
    },
    F: {  // 施延年 - 书呆子，对丹药典籍感兴趣
        yanwuchang: 0.05,
        cangjingge: 0.40,
        huofang: 0.05,
        houshan: 0.05,
        yishiting: 0.05,
        tiejiangpu: 0.05,
        nandizi: 0.00,
        nvdizi: 0.10,
        shanmen: 0.05,
        gongtian: 0.05,  // 偶尔去透透气
        danfang: 0.10,   // 研究丹药典籍
        none: 0.05
    },
    G: {  // 呼延显 - 大师兄，可能指导劳作
        yanwuchang: 0.20,
        cangjingge: 0.10,
        huofang: 0.05,
        houshan: 0.15,
        yishiting: 0.10,
        tiejiangpu: 0.05,
        nandizi: 0.10,
        nvdizi: 0.00,
        shanmen: 0.05,
        gongtian: 0.05,  // 偶尔指导
        danfang: 0.05,   // 偶尔来看看
        none: 0.10
    },
    H: {  // 雨烛 - 活泼小天使，会去玩耍
        yanwuchang: 0.15,
        cangjingge: 0.10,
        huofang: 0.15,
        houshan: 0.15,
        yishiting: 0.05,
        tiejiangpu: 0.05,
        nandizi: 0.00,
        nvdizi: 0.15,
        shanmen: 0.05,
        gongtian: 0.10,  // 去玩耍帮忙
        danfang: 0.05,   // 好奇来看看
        none: 0.00
    },
    I: {  // 安慕 - 伙房主厨，需要新鲜食材
        yanwuchang: 0.05,
        cangjingge: 0.00,
        huofang: 0.45,
        houshan: 0.15,
        yishiting: 0.00,
        tiejiangpu: 0.05,
        nandizi: 0.00,
        nvdizi: 0.10,
        shanmen: 0.05,
        gongtian: 0.10,  // 采集食材
        danfang: 0.05,   // 取药材调味
        none: 0.00
    },
    J: {  // 唐沐梨 - 商人，对丹药生意感兴趣
        yanwuchang: 0.10,
        cangjingge: 0.05,
        huofang: 0.10,
        houshan: 0.05,
        yishiting: 0.10,
        tiejiangpu: 0.10,
        nandizi: 0.00,
        nvdizi: 0.20,
        shanmen: 0.15,
        gongtian: 0.05,  // 查看农产品商机
        danfang: 0.05,   // 查看丹药商机
        none: 0.05
    },
    K: {  // 洛潜幽 - 可能去采花装饰
        yanwuchang: 0.05,
        cangjingge: 0.10,
        huofang: 0.10,
        houshan: 0.10,
        yishiting: 0.15,
        tiejiangpu: 0.00,
        nandizi: 0.00,
        nvdizi: 0.25,
        shanmen: 0.05,
        gongtian: 0.05,  // 不需要劳作
        danfang: 0.05,   // 采集药草
        none: 0.10
    },
    L: {  // 神秘杂役 - 神秘出没
        yanwuchang: 0.02,
        cangjingge: 0.01,
        huofang: 0.01,
        houshan: 0.01,
        yishiting: 0.01,
        tiejiangpu: 0.01,
        nandizi: 0.01,
        nvdizi: 0.00,
        shanmen: 0.01,
        gongtian: 0.01,  // 偶尔在公田出现
        danfang: 0.01,   // 神秘出没
        none: 0.89
    },
    // Z: { // 新角色Z - 占位：均衡分布
    //     yanwuchang: 0.10,
    //     cangjingge: 0.10,
    //     huofang: 0.10,
    //     houshan: 0.10,
    //     yishiting: 0.10,
    //     tiejiangpu: 0.10,
    //     nandizi: 0.05,
    //     nvdizi: 0.05,
    //     shanmen: 0.10,
    //     gongtian: 0.05,
    //     danfang: 0.05,   // 均衡分布
    //     none: 0.10
    // },
    M: {  // 玄天青 - 岐黄长老，常在丹房
        yanwuchang: 0.02,
        cangjingge: 0.20,
        huofang: 0.05,
        houshan: 0.15,
        yishiting: 0.10,
        tiejiangpu: 0.00,
        nandizi: 0.05,
        nvdizi: 0.00,
        shanmen: 0.03,
        gongtian: 0.05,
        danfang: 0.30,
        none: 0.05
    },
    N: {  // 鹿椿若 - 采药迷路
        yanwuchang: 0.02,
        cangjingge: 0.05,
        huofang: 0.05,
        houshan: 0.25,
        yishiting: 0.02,
        tiejiangpu: 0.02,
        nandizi: 0.00,
        nvdizi: 0.08,
        shanmen: 0.05,
        gongtian: 0.15,
        danfang: 0.20,
        none: 0.11
    },
    O: {  // 苓雪妃 - 在公田耕种
        yanwuchang: 0.00,
        cangjingge: 0.02,
        huofang: 0.02,
        houshan: 0.15,
        yishiting: 0.05,
        tiejiangpu: 0.00,
        nandizi: 0.00,
        nvdizi: 0.10,
        shanmen: 0.02,
        gongtian: 0.35,
        danfang: 0.02,
        none: 0.27
    }
};

// 地点危险度配置
const locationDangerLevels = {
    '伊州': '中',
    '千佛洞': '低',
    '博斯坦村': '低',
    '博格达峰': '高',
    '哈密绿洲': '较低',
    '大沙海': '高',
    '天山派外堡': '低',
    '崆峒派': '低',
    '拜火教总坛': '高',
    '昆仑派': '低',
    '月牙泉': '低',
    '沙州': '高',
    '瓜州': '高',
    '白驼山': '较高',
    '迪坎儿村': '较低',
    '高昌': '较低',
    '龟兹': '较低',
    '天山派': '低'  // 添加天山派的危险度
};

// SLG模式场景同义词映射（用于模糊匹配）
const slgSceneSynonyms = {
    // 沙漠类
    '戈壁': '沙漠', '沙地': '沙漠', '荒漠': '沙漠', '旷野': '沙漠', '黄沙': '沙漠',
    // 山道类
    '山路': '山道', '小径': '山道', '小道': '山道', '崎岖': '山道', '栈道': '山道',
    // 树林类
    '林间': '树林', '森林': '树林', '密林': '树林', '竹林': '树林', '丛林': '树林', '林中': '树林',
    // 水边类
    '河边': '水边', '湖边': '水边', '溪边': '水边', '池塘': '水边', '河畔': '水边', '湖畔': '水边', '溪流': '水边',
    // 村落类
    '小镇': '村落', '村庄': '村落', '聚落': '村落', '乡村': '村落', '镇子': '村落',
    // 山洞类
    '洞穴': '山洞', '岩洞': '山洞', '石洞': '山洞', '洞窟': '山洞', '暗洞': '山洞',
    // 雪山类
    '雪峰': '雪山', '雪岭': '雪山', '雪地': '雪山', '雪原': '雪山',
    // 冰川类
    '冰原': '冰川', '冰湖': '冰川', '冰窟': '冰川', '冰洞': '冰川',
    // 绿洲类
    '绿地': '绿洲', '草地': '绿洲', '草原': '绿洲',
    // 酒肆类
    '酒楼': '酒肆', '酒馆': '酒肆', '酒家': '酒肆', '茶馆': '酒肆', '饭馆': '酒肆',
    // 客房类
    '旅店': '客房', '客栈': '客房', '旅馆': '客房', '房间': '客房', '卧室': '客房', '寝室': '客房', '厢房': '客房',
    // 商铺类
    '店铺': '商铺', '铺子': '商铺', '商店': '商铺', '杂货': '商铺',
    // 市集类
    '集市': '市集', '闹市': '市集', '街市': '市集', '夜市': '市集', '早市': '市集',
    // 废墟类
    '遗迹': '废墟', '残垣': '废墟', '废址': '废墟', '荒废': '废墟', '断壁': '废墟',
    // 寺庙类
    '佛寺': '寺庙', '道观': '寺庙', '庙宇': '寺庙', '古刹': '寺庙', '禅寺': '寺庙', '神庙': '寺庙',
    // 邪教祭坛类
    '祭坛': '邪教祭坛', '邪坛': '邪教祭坛', '血祭': '邪教祭坛',
    // 武侠门派类
    '门派': '武侠门派', '宗门': '武侠门派', '山庄': '武侠门派', '帮派': '武侠门派',
    // 宫殿类
    '大殿': '宫殿', '殿堂': '宫殿', '皇宫': '宫殿', '王宫': '宫殿', '金殿': '宫殿',
    // 庭院类
    '庭园': '庭院', '花园': '庭院', '院子': '庭院', '天井': '庭院', '后院': '庭院', '前院': '庭院',
    // 府邸类
    '府宅': '府邸', '宅院': '府邸', '豪宅': '府邸', '大宅': '府邸', '宅子': '府邸',
    // 军营类
    '兵营': '军营', '营帐': '军营', '营地': '军营', '军帐': '军营',
    // 山谷类
    '峡谷': '山谷', '幽谷': '山谷', '深谷': '山谷', '溪谷': '山谷',
    // 街道类
    '大街': '街道', '小巷': '街道', '巷子': '街道', '长街': '街道', '胡同': '街道'
};

// SLG模式可选场景配置
const slgSceneOptions = [
    '沙漠',
    '山道',
    '雪山',
    '山谷',
    '冰川',
    '水边',
    '树林',
    '绿洲',
    '村落',
    '山洞',
    '客房',
    '酒肆',
    '商铺',
    '街道',
    '浴室',
    '市集',
    '废墟',
    '寺庙',
    '石窟',
    '熔岩洞',
    '地牢',
    '邪教祭坛',
    '武侠门派',
    '山门',
    '演武场',
    '宫殿',
    '庭院',
    '府邸',
    '军营'
];

// SLG模式可选CG配置
const slgCGOptions = [
    '露阴',
    '露胸',
    '接吻',
    '舔奶',
    '揉胸',
    '口交',
    '自慰',
    '足交',
    '手交',
    '乳交',
    '指交',
    '舔阴',
    '后入式',
    '正常位',
    '女上位',
    '69式',
    '火车便当式',
    'none'
];

// SLG模式表情同义词映射（用于模糊匹配）
const slgEmotionSynonyms = {
    // 大笑类
    '狂笑': '大笑', '开心': '大笑', '欢笑': '大笑', '高兴': '大笑', '喜悦': '大笑',
    // 微笑类
    '浅笑': '微笑', '含笑': '微笑', '笑容': '微笑', '轻笑': '微笑', '温柔': '微笑',
    // 平静类
    '冷静': '平静', '淡然': '平静', '从容': '平静', '无表情': '平静', '面无表情': '平静', '普通': '平静', '正常': '平静', '默然': '平静',
    // 生气类
    '愤怒': '生气', '恼怒': '生气', '发火': '生气', '怒气': '生气', '暴怒': '生气', '气愤': '生气',
    // 兴奋类
    '激动': '兴奋', '亢奋': '兴奋', '期待': '兴奋', '热情': '兴奋',
    // 不满类
    '嫌弃': '不满', '厌恶': '不满', '反感': '不满', '嫌恶': '不满', '不悦': '不满', '皱眉': '不满',
    // 严肃类
    '认真': '严肃', '肃穆': '严肃', '凝重': '严肃', '郑重': '严肃', '正经': '严肃',
    // 害羞类
    '羞涩': '害羞', '脸红': '害羞', '羞红': '害羞', '娇羞': '害羞', '含羞': '害羞', '羞怯': '害羞',
    // 尴尬类
    '窘迫': '尴尬', '困窘': '尴尬', '难堪': '尴尬', '局促': '尴尬',
    // 为难类
    '犹豫': '为难', '迟疑': '为难', '踌躇': '为难', '左右为难': '为难', '纠结': '为难',
    // 惊讶类
    '震惊': '惊讶', '吃惊': '惊讶', '诧异': '惊讶', '惊愕': '惊讶', '惊奇': '惊讶', '错愕': '惊讶',
    // 紧张类
    '不安': '紧张', '焦虑': '紧张', '慌乱': '紧张', '局促不安': '紧张',
    // 害怕类
    '恐惧': '害怕', '惊恐': '害怕', '畏惧': '害怕', '惧怕': '害怕', '惊吓': '害怕', '胆怯': '害怕',
    // 悲伤类
    '难过': '悲伤', '伤心': '悲伤', '哀伤': '悲伤', '忧伤': '悲伤', '痛苦': '悲伤', '悲痛': '悲伤',
    // 哭泣类
    '流泪': '哭泣', '落泪': '哭泣', '泪目': '哭泣', '眼泪': '哭泣', '泣不成声': '哭泣',
    // 得意类
    '自豪': '得意', '骄傲': '得意', '自得': '得意', '洋洋得意': '得意', '嘚瑟': '得意', '傲娇': '得意',
    // 发情类
    '情动': '发情', '动情': '发情', '渴望': '发情', '欲望': '发情', '媚眼': '发情', '迷离': '发情', '春情': '发情'
};

// SLG模式可选表情配置
// 注意：除以下固定选项外，还支持"特殊CGx"格式（x为任意数字，如：特殊CG1、特殊CG999）
const slgEmotionOptions = [
    '大笑',
    '平静',
    '生气',
    '兴奋',
    '微笑',
    '不满',
    '严肃',
    '害羞',
    '尴尬',
    '为难',
    '惊讶',
    '紧张',
    '害怕',
    '悲伤',
    '哭泣',
    '得意',
    '发情',
    'none'
];

// 场景语义关键词兜底映射（用于处理LLM幻觉输出）
// 当所有匹配方式都失败时，检查输入是否包含这些关键字
// 注意：按优先级排列，多字关键词在前，遍历时先匹配到的生效
const sceneSemanticKeywords = {
    // ===== 多字关键词（优先匹配）=====
    '悬崖': '山道',
    '峭壁': '山道',
    '山顶': '雪山',
    '山巅': '雪山',
    '峰顶': '雪山',
    '冰雪': '冰川',
    '监狱': '地牢',
    '牢房': '地牢',
    '火山': '熔岩洞',
    '岩浆': '熔岩洞',
    '佛洞': '石窟',
    '练武': '演武场',
    '比武': '演武场',
    '擂台': '演武场',
    '皇城': '宫殿',
    '王城': '宫殿',

    // ===== 单字关键词 =====
    // 山岳类
    '峰': '雪山',
    '巅': '雪山',
    '岭': '雪山',
    '崖': '山道',
    '坡': '山道',
    '径': '山道',
    '山': '山道',
    // 水域类
    '河': '水边',
    '湖': '水边',
    '溪': '水边',
    '泉': '水边',
    '潭': '水边',
    '瀑': '水边',
    '江': '水边',
    // 植被类
    '林': '树林',
    '森': '树林',
    // 洞穴类
    '洞': '山洞',
    '穴': '山洞',
    '窟': '石窟',
    '窖': '地牢',
    // 建筑-门派类
    '派': '武侠门派',
    '宗': '武侠门派',
    '帮': '武侠门派',
    // 建筑-居住类
    '庄': '府邸',
    '府': '府邸',
    '宅': '府邸',
    '院': '庭院',
    '园': '庭院',
    '殿': '宫殿',
    '宫': '宫殿',
    '房': '客房',
    '室': '客房',
    // 建筑-商业类
    '店': '商铺',
    '铺': '商铺',
    '市': '市集',
    '坊': '市集',
    // 建筑-宗教类
    '寺': '寺庙',
    '庙': '寺庙',
    '观': '寺庙',
    '祠': '寺庙',
    '坛': '邪教祭坛',
    // 聚落类
    '城': '街道',
    '镇': '村落',
    '村': '村落',
    '寨': '村落',
    '营': '军营',
    '帐': '军营',
    '门': '街道',
    // 地形类
    '谷': '山谷',
    '峡': '山谷',
    '漠': '沙漠',
    '沙': '沙漠',
    '荒': '沙漠',
    '冰': '冰川',
    '雪': '雪山',
    '草': '绿洲',
    '牢': '地牢',
    '狱': '地牢'
};

// 表情语义关键词兜底映射（用于处理LLM幻觉输出）
const emotionSemanticKeywords = {
    // 正面情绪
    '笑': '微笑',
    '乐': '大笑',
    '喜': '大笑',
    // 负面情绪
    '怒': '生气',
    '愤': '生气',
    '气': '生气',
    '哭': '哭泣',
    '泪': '哭泣',
    '泣': '哭泣',
    '悲': '悲伤',
    '伤': '悲伤',
    '哀': '悲伤',
    '忧': '悲伤',
    // 恐惧紧张类
    '怕': '害怕',
    '惧': '害怕',
    '恐': '害怕',
    '慌': '紧张',
    '急': '紧张',
    '焦': '紧张',
    // 羞涩类
    '羞': '害羞',
    '臊': '害羞',
    '红': '害羞',
    // 惊讶类
    '惊': '惊讶',
    '讶': '惊讶',
    '愕': '惊讶',
    // 其他
    '傲': '得意',
    '骄': '得意',
    '媚': '发情',
    '欲': '发情',
    '情': '发情',
    '静': '平静',
    '淡': '平静',
    '肃': '严肃',
    '正': '严肃'
};

// 危险度对应的事件概率
const dangerEventChance = {
    '低': { battle: 0, random: 10 },      // 战斗5%，随机事件10%
    '较低': { battle: 5, random: 10 },    // 战斗8%，随机事件10%
    '中': { battle: 10, random: 10 },     // 战斗12%，随机事件10%
    '较高': { battle: 15, random: 10 },   // 战斗16%，随机事件10%
    '高': { battle: 25, random: 10 }      // 战斗25%，随机事件10%
};

const item_list = {
    "小麦种子": {
        "描述": "Hạt giống lúa mì, có thể trồng trên ruộng",
        "可交易": true,
        "买入价格": 75,
        "卖出价格": 37,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "茄子种子": {
        "描述": "Hạt giống cà tím, có thể trồng trên ruộng",
        "可交易": true,
        "买入价格": 115,
        "卖出价格": 57,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "甜瓜种子": {
        "描述": "Hạt giống dưa gang, có thể trồng trên ruộng",
        "可交易": true,
        "买入价格": 165,
        "卖出价格": 82,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "甘蔗种子": {
        "描述": "Hạt giống mía, có thể trồng trên ruộng",
        "可交易": true,
        "买入价格": 240,
        "卖出价格": 120,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "胡饼": {
        "描述": "Bánh nướng phong cách Tây Vực, thơm giòn ngon miệng, tiện mang theo",
        "可交易": true,
        "买入价格": 500,
        "卖出价格": 250,
        "可使用": true,
        "影响属性": "playerMood",
        "影响数值": 20,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "桂花糕": {
        "描述": "Bánh ngọt tinh tế thoang thoảng hương hoa quế, thanh ngọt sảng khoái, là món yêu thích của nhiều nữ đệ tử",
        "可交易": true,
        "买入价格": 800,
        "卖出价格": 400,
        "可使用": true,
        "影响属性": "playerMood",
        "影响数值": 40,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "烤羊腿": {
        "描述": "Đùi cừu nướng đặc chế của An Mộ, hương thơm nức mũi, khiến người ta thèm nhỏ dãi",
        "可交易": true,
        "买入价格": 1500,
        "卖出价格": 750,
        "可使用": true,
        "影响属性": "playerMood",
        "影响数值": 100,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "制式铁剑": {
        "描述": "Kiếm sắt được cấp thống nhất khi đệ tử Thiên Sơn Phái nhập môn, tuy bình thường không có gì lạ, nhưng cũng là điểm khởi đầu kiếm đạo của bạn",
        "可交易": true,
        "买入价格": 1500,
        "卖出价格": 750,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "武器",
        "装备属性": "攻击力",
        "装备数值": 10
    },
    "精钢长剑": {
        "描述": "Trường kiếm được Tiệm Rèn Thiên Sơn chế tạo tỉ mỉ, sắc bén vô cùng, là vũ khí mơ ước của không ít đệ tử",
        "可交易": true,
        "买入价格": 5000,
        "卖出价格": 2500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "武器",
        "装备属性": "攻击力",
        "装备数值": 20
    },
    "归义军长剑": {
        "描述": "Rèn theo phương pháp cổ, ngoại hình y hệt trăm năm trước, hình dáng tuy đã cũ kỹ nhưng uy lực không giảm",
        "可交易": false,
        "买入价格": 9000,
        "卖出价格": 4500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "武器",
        "装备属性": "攻击力",
        "装备数值": 30
    },
    "普通弟子服": {
        "描述": "Y phục đệ tử được cấp thống nhất khi đệ tử Thiên Sơn Phái nhập môn",
        "可交易": true,
        "买入价格": 1500,
        "卖出价格": 750,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "防具",
        "装备属性": "生命值",
        "装备数值": 25
    },
    "铁环软锁甲": {
        "描述": "Giáp lưới cải tiến do Tiệm Rèn chế tạo, dùng công nghệ đặc biệt giúp vòng sắt khít và mềm mại hơn, ôm sát người mà không cản trở hoạt động",
        "可交易": true,
        "买入价格": 5000,
        "卖出价格": 2500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "防具",
        "装备属性": "生命值",
        "装备数值": 50
    },
    // 根骨类饰品
    "血玉护符": {
        "描述": "Bùa hộ thân chạm khắc từ huyết ngọc Tây Vực, đeo vào có thể cường kiện thể phách",
        "可交易": true,
        "买入价格": 8000,
        "卖出价格": 4000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "根骨",
        "装备数值": 2
    },
    "青铜力士环": {
        "描述": "Vòng tay bằng đồng thau phỏng cổ, bên trên khắc hình lực sĩ",
        "可交易": true,
        "买入价格": 12000,
        "卖出价格": 6000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "根骨",
        "装备数值": 3
    },
    "千年龟甲坠": {
        "描述": "Làm từ mai rùa già ngàn năm, chứa đựng khí trường thọ",
        "可交易": true,
        "买入价格": 18000,
        "卖出价格": 9000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "根骨",
        "装备数值": 4
    },
    "凤血石戒指": {
        "描述": "Viên đá quý trong truyền thuyết do máu phượng hoàng hóa thành, có thể cải tạo thể chất",
        "可交易": false,
        "买入价格": 25000,
        "卖出价格": 12500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "根骨",
        "装备数值": 5
    },
    // 悟性类饰品
    "静心玉扇坠": {
        "描述": "Mặt dây chuyền hình quạt ngọc nhỏ nhắn, giúp tĩnh tâm ngộ đạo",
        "可交易": true,
        "买入价格": 8000,
        "卖出价格": 4000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "悟性",
        "装备数值": 2
    },
    "菩提子手串": {
        "描述": "Chuỗi 108 hạt bồ đề, giúp người khai ngộ",
        "可交易": true,
        "买入价格": 12000,
        "卖出价格": 6000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "悟性",
        "装备数值": 3
    },
    "灵犀玉佩": {
        "描述": "Tâm hữu linh tê nhất điểm thông, ngọc này có thể thông hiểu tâm trí người",
        "可交易": true,
        "买入价格": 18000,
        "卖出价格": 9000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "悟性",
        "装备数值": 4
    },
    "星罗盘坠": {
        "描述": "Phiên bản thu nhỏ của bàn quan sát sao lưu truyền từ Tư Thiên Giám, chứa đựng huyền cơ thiên địa",
        "可交易": false,
        "买入价格": 25000,
        "卖出价格": 12500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "悟性",
        "装备数值": 5
    },
    // 心性类饰品
    "凝神香囊": {
        "描述": "Túi gấm chứa hương liệu an thần, khiến người ta tâm bình khí hòa",
        "可交易": true,
        "买入价格": 8000,
        "卖出价格": 4000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "心性",
        "装备数值": 2
    },
    "定心铜钟": {
        "描述": "Mặt dây chuyền hình chuông đồng nhỏ, tiếng trong trẻo có thể định tâm thần",
        "可交易": true,
        "买入价格": 12000,
        "卖出价格": 6000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "心性",
        "装备数值": 3
    },
    "净心琉璃珠": {
        "描述": "Chuỗi niệm châu làm bằng thất bảo lưu ly, thanh lọc tâm linh",
        "可交易": true,
        "买入价格": 18000,
        "卖出价格": 9000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "心性",
        "装备数值": 4
    },
    "归义军虎符": {
        "描述": "Tín vật trong quân từ cuối thời Đường lưu truyền đến nay, mang theo niềm tin bảo vệ bách tính",
        "可交易": false,
        "买入价格": 25000,
        "卖出价格": 12500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "心性",
        "装备数值": 5
    },

    // 魅力类饰品
    "碧玉发钗": {
        "描述": "Trâm cài tóc bích ngọc tinh xảo, tăng thêm vài phần phong thái",
        "可交易": true,
        "买入价格": 8000,
        "卖出价格": 4000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "魅力",
        "装备数值": 2
    },
    "流光腰坠": {
        "描述": "Viên đá thần kỳ có thể đổi màu theo ánh sáng",
        "可交易": true,
        "买入价格": 12000,
        "卖出价格": 6000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "魅力",
        "装备数值": 3
    },
    "凤翎耳坠": {
        "描述": "Bông tai làm từ lông chim quý, hào quang chói mắt",
        "可交易": true,
        "买入价格": 18000,
        "卖出价格": 9000,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "魅力",
        "装备数值": 4
    },
    "明月珠冠": {
        "描述": "Dạ minh châu khảm trên mũ phát xuất xứ từ ngoài vạn dặm, ngay cả ban ngày cũng tỏa ánh sáng dịu nhẹ",
        "可交易": false,
        "买入价格": 25000,
        "卖出价格": 12500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": true,
        "装备类型": "饰品",
        "装备属性": "魅力",
        "装备数值": 5
    },
    // 炼丹药材
    "丹参": {
        "描述": "Dược liệu quý, có thể dùng để luyện đan, giúp tăng cường căn cốt",
        "可交易": true,
        "买入价格": 500,
        "卖出价格": 250,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "当归": {
        "描述": "Dược liệu quý, có thể dùng để luyện đan, giúp tăng cường ngộ tính",
        "可交易": true,
        "买入价格": 500,
        "卖出价格": 250,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "没药": {
        "描述": "Dược liệu quý, có thể dùng để luyện đan, giúp tăng cường tâm tính",
        "可交易": true,
        "买入价格": 500,
        "卖出价格": 250,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "沉香": {
        "描述": "Dược liệu quý, có thể dùng để luyện đan, giúp tăng cường mị lực",
        "可交易": true,
        "买入价格": 500,
        "卖出价格": 250,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    // 炼丹丹药
    "大力丸": {
        "描述": "Đan dược bình thường luyện được, sau khi uống có thể tăng cường sức mạnh trong thời gian ngắn",
        "可交易": true,
        "买入价格": 1000,
        "卖出价格": 500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "筋骨贴": {
        "描述": "Đan dược bình thường luyện được, có thể trị liệu tổn thương gân cốt",
        "可交易": true,
        "买入价格": 1000,
        "卖出价格": 500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "金疮药": {
        "描述": "Đan dược bình thường luyện được, có thể trị liệu ngoại thương",
        "可交易": true,
        "买入价格": 1000,
        "卖出价格": 500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    },
    "霹雳丸": {
        "描述": "Đan dược bình thường luyện được, có thể dùng làm ám khí ném",
        "可交易": true,
        "买入价格": 1000,
        "卖出价格": 500,
        "可使用": false,
        "影响属性": null,
        "影响数值": null,
        "可装备": false,
        "装备类型": null,
        "装备属性": null,
        "装备数值": null
    }
};
// 默认游戏数据
const defaultGameData = {
    userLocation: "tianshanpai",
    userBackground: "A", // 新增：角色出身编码（A 农家子弟，B 府兵军户，C 经史传家，D 天潢贵胄）
    textFontLevel: 2, // 新增：正文字体档位（1~5），默认第二档
    uiStyle: 0, // 新增：UI风格（0=古风UI，1=扁平化UI）
    playerTalents: { "根骨": 25, "悟性": 25, "心性": 25, "魅力": 25 },
    playerStats: { "武学": 20, "学识": 20, "声望": 20, "金钱": 500 },
    combatStats: { "攻击力": 20, "生命值": 50 },
    playerMood: 100,
    martialArts: {
        "太白仙迹": 0, "岱宗如何": 0, "掠风窃尘": 0, "流云飞袖": 0,
        "惊鸿照影": 0, "踏雪无痕": 0, "醉卧沙场": 0, "万剑归宗": 0
    },
    npcFavorability: { "A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0, "H": 0, "I": 0, "J": 0, "K": 0, "L": 0, /* "Z": 0, */ "M": 0, "N": 0, "O": 0 },
    weekStartFavorability: { "A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0, "H": 0, "I": 0, "J": 0, "K": 0, "L": 0, /* "Z": 0, */ "M": 0, "N": 0, "O": 0 },  // 新增：记录本周开始时的好感度快照
    actionPoints: 3,
    currentWeek: 1,
    dayNightStatus: 'daytime',  // 新增：昼夜状况 'daytime' 或 'night'
    seasonStatus: 'winter',      // 新增：四季状况 'spring', 'summer', 'autumn', 'winter'
    npcLocations: { "A": "none", "B": "yishiting", "C": "yishiting", "D": "shanmen", "E": "nvdizi", "F": "cangjingge", "G": "yanwuchang", "H": "houshan", "I": "huofang", "J": "tiejiangpu", "K": "nvdizi", "L": "none",/* "Z":"none", */"M": "danfang", "N": "danfang", "O": "none" },
    GameMode: 0,  // 游戏模式，0=普通模式，1=SLG模式
    difficulty: 'normal', // 默认难度 
    npcVisibility: { "A": true, "B": true, "C": true, "D": true, "E": true, "F": true, "G": true, "H": true, "I": true, "J": true, "K": true, "L": true, /* "Z": true, */ "M": true, "N": true, "O": false }, // 新增：NPC是否显示
    npcGiftGiven: { "A": false, "B": false, "C": false, "D": false, "E": false, "F": false, "G": false, "H": false, "I": false, "J": false, "K": false, "L": false, /* "Z": false, */ "M": false, "N": false, "O": false }, // 新增：本周是否已送礼
    npcSparred: { "A": false, "B": false, "C": false, "D": false, "E": false, "F": false, "G": false, "H": false, "I": false, "J": false, "K": false, "L": false, /* "Z": false, */ "M": false, "N": false, "O": false }, // 新增：本周是否已切磋
    lastFarmWeek: 1,  // 新增：上次耕种的周数
    farmGrid: [],     // 新增：农场地块状态
    inventory: {
        "胡饼": 5,
        "小麦种子": 5
    },
    equipment: {
        "武器": null,
        "防具": null,
        "饰品1": null,
        "饰品2": null
    },
    lastUserMessage: "",     // 已存在：储存上轮用户输入
    summary_Small: "",
    summary_Week: "",
    summary_Backup: "",
    newWeek: 0,
    randomEvent: 0,       // 随机事件标记
    battleEvent: 0,       // 战斗事件标记
    companionNPC: [],     // 随行NPC数组
    mapLocation: '天山派', // 地图位置
    cgContentEnabled: false,  // 新增：CG内容开关（默认关）
    compressSummary: false,    // 新增：强力总结（默认关）
    enamor: 0,              // 新增：倾慕触发标记（默认0）
    alchemyDone: false,      // 新增：本周是否已炼丹（默认false）
    triggeredEvents: [],     // 新增：已触发的特殊事件ID列表
    currentSpecialEvent: "", // 新增：当前触发的特殊事件ID
    inputEnable: 1           // 新增：自由行动输入框可用状态（1=可用，0=不可用）
};