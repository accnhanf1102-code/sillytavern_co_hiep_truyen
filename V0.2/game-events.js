/**
 * game-events.js - 事件处理函数
 * 
 * 文件概述：
 * 处理游戏中的各种事件，包括随机事件、战斗事件、LLM响应解析等。
 * 管理事件的显示、选择和结果处理，以及iframe游戏的消息通信。
 * 
 * 主要功能：
 * 1. 随机事件系统（选项事件的显示和处理）
 * 2. 战斗事件系统（战斗准备和结果处理）
 * 3. LLM响应解析（处理AI返回的游戏数据）
 * 4. iframe消息监听（处理21点/战斗/农场/炼丹/世界地图结果）
 * 5. 特殊事件触发（与special-event.js联动）
 * 
 * 对外暴露的主要函数：
 * - displayRandomEvent(event): 显示随机事件界面
 * - hideRandomEvent(): 隐藏随机事件界面
 * - displayBattleEvent(event): 显示战斗事件界面
 * - hideBattleEvent(): 隐藏战斗事件界面
 * - parseLLMResponse(response, mainTextContent): 解析LLM返回的JSON响应
 * - setupMessageListeners(): 设置iframe消息监听器（21点/战斗/农场/炼丹/世界地图）
 * - applyBattleReward(reward): 应用战斗胜利奖励
 * 
 * 内部函数：
 * - handleEventOption(optionIndex, option): 处理事件选项选择（支持特殊剧情触发）
 * - applyEventReward(reward): 应用事件奖励（天赋/数值属性）
 * 
 * 依赖关系：
 * - 依赖 game-state.js 中的状态变量和更新
 * - 依赖 game-config.js 中的NPC配置
 * - 依赖 game-utils.js 中的数值检查函数
 * - 依赖 game-ui.js 中的显示更新函数
 * - 依赖 game-helpers.js 中的消息处理和游戏显示函数
 * - 依赖 special-event.js 中的特殊事件检查和触发函数
 * 
 * 特殊说明：
 * - parseLLMResponse 是与AI系统对接的核心函数；在SLG模式下联动 updateStoryText 渲染页与图层
 * - 支持处理NPC好感度变化（含魅力判定和难度调整）
 * - 支持处理NPC位置变动
 * - 支持两种类型的随机事件：选项事件和战斗事件
 * - handleEventOption 支持"特殊剧情:"前缀选项，自动触发特殊事件
 */

// 显示随机事件
function displayRandomEvent(event) {
    const container = document.getElementById('random-event-container');
    const options = document.getElementById('event-options');

    // 不再在事件框中显示事件描述，描述已作为最后一页附加到正文
    options.innerHTML = '';

    const optionKeys = ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3'];
    optionKeys.forEach((key, index) => {
        if (event[key]) {
            const option = event[key];
            const btn = document.createElement('button');
            btn.className = 'event-option-btn';
            btn.innerHTML = `
                <div class="option-desc">${option['Mô tả']}</div>
                <div class="option-reward">Phần thưởng: ${option['Phần thưởng']}</div>
                <div class="option-success-rate">Tỷ lệ thành công: ${option['Tỷ lệ thành công']}</div>
            `;
            btn.onclick = () => handleEventOption(index + 1, option);
            options.appendChild(btn);
        }
    });

    container.classList.add('show');
}

function hideRandomEvent() {
    const container = document.getElementById('random-event-container');
    container.classList.remove('show');
    currentRandomEvent = null;
}

// 处理事件选项
async function handleEventOption(optionIndex, option) {
    if (!currentRandomEvent) return;

    const successRate = parseInt(option['Tỷ lệ thành công']) / 100;
    const isSuccess = Math.random() < successRate;

    if (isSuccess && option['Phần thưởng']) {
        applyEventReward(option['Phần thưởng']);
    }

    const resultMessage = `Mô tả sự kiện: ${currentRandomEvent['Mô tả sự kiện']}<br>` +
        `{{user}} lựa chọn hành động: ${option['Mô tả']}<br>` +
        `Kết quả: ${isSuccess ? 'Thành công' : 'Thất bại'}`;

    hideRandomEvent();

    // 检查是否是"特殊剧情:"选项 (Config vẫn dùng tiếng Việt "Cốt truyện đặc biệt:" hoặc giữ nguyên logic cũ nếu config chưa đổi)
    // Tạm thời support cả 2 prefix để an toàn
    if (option['Mô tả'] && (option['Mô tả'].startsWith('特殊剧情:') || option['Mô tả'].startsWith('Cốt truyện đặc biệt:'))) {
        // 检查是否有满足条件的特殊事件
        const specialEvent = typeof checkSpecialEvents === 'function' ? checkSpecialEvents() : null;

        if (specialEvent) {
            console.log(`[handleEventOption] 触发特殊事件: ${specialEvent.name}`);
            // 先inject随机事件的选择信息（去掉前缀）
            const actionDesc = option['Mô tả'].replace(/^(特殊剧情:|Cốt truyện đặc biệt:)\s*/, '');
            const injectMessage = `{{user}}行动选择: ${actionDesc}`;
            const renderFunc = typeof getRenderFunction === 'function' ? getRenderFunction() : null;
            if (renderFunc) {
                await renderFunc(`/inject id=10 position=chat depth=0 scan=true role=user ${injectMessage}`);
            }
            // 触发特殊事件（会应用效果、标记已触发、发送预设文本）
            await triggerSpecialEvent(specialEvent);
            return;
        }
    }

    await handleMessageOutput(resultMessage);
}

// 属性映射表 (Vietnamese -> Chinese Keys)
const attributeMap = {
    'Căn Cốt': '根骨',
    'Võ Học': '武学',
    'Tấn Công': '攻击力',
    'Máu': '生命值',
    'Sinh Lực': '生命值', // Fallback
    'Mị Lực': '魅力',
    'Ngộ Tính': '悟性',
    'Tâm Tính': '心性',
    'Học Thức': '学识',
    'Danh Vọng': '声望',
    'Tiền': '金钱',
    'Ngân Lượng': '金钱', // Fallback
    'Thể Lực': 'playerMood'
};

// 应用事件奖励
function applyEventReward(reward) {
    const rewardMatch = reward.match(/(.+?)([+-])(\d+)/);
    if (rewardMatch) {
        let attribute = rewardMatch[1].trim();
        const operation = rewardMatch[2];
        const value = parseInt(rewardMatch[3]);

        // 尝试映射回内部Key
        if (attributeMap[attribute]) {
            attribute = attributeMap[attribute];
        }

        if (playerTalents.hasOwnProperty(attribute)) {
            if (operation === '+') {
                playerTalents[attribute] = Math.min(100, playerTalents[attribute] + value);
            } else {
                playerTalents[attribute] = Math.max(0, playerTalents[attribute] - value);
            }
            checkAllValueRanges();
            updateStatsDisplay();
        }
        else if (playerStats.hasOwnProperty(attribute)) {
            if (operation === '+') {
                playerStats[attribute] = playerStats[attribute] + value;
            } else {
                playerStats[attribute] = Math.max(0, playerStats[attribute] - value);
            }
            checkAllValueRanges();
            updateStatsDisplay();
        }
    }
}

// 显示战斗事件
function displayBattleEvent(event) {
    const container = document.getElementById('battle-event-container');
    const description = document.getElementById('battle-event-description');
    const enemyName = document.getElementById('enemy-name-display');
    const enemyAttack = document.getElementById('enemy-attack-display');
    const enemyHealth = document.getElementById('enemy-health-display');
    const rewardText = document.getElementById('battle-reward-text');

    currentBattleEvent = event;

    // 不在事件框中显示事件描述，正文最后一页已显示
    if (description) description.textContent = '';

    if (event['Thông tin kẻ địch']) {
        const enemyInfo = event['Thông tin kẻ địch'];
        enemyName.textContent = enemyInfo['Tên'] || 'Kẻ địch ẩn danh';
        enemyAttack.textContent = enemyInfo['Thuộc tính']?.['Tấn Công'] || 'Trung bình';
        enemyHealth.textContent = enemyInfo['Thuộc tính']?.['Máu'] || 'Trung bình';

        if (enemyInfo['Phần thưởng chiến đấu']) {
            const reward = enemyInfo['Phần thưởng chiến đấu'];
            rewardText.textContent = `Phần thưởng chiến thắng: ${reward['Loại']}+${reward['Giá trị']}`;
            currentBattleReward = reward;
        }
    }

    container.classList.add('show');
}

function hideBattleEvent() {
    const container = document.getElementById('battle-event-container');
    container.classList.remove('show');
    currentBattleEvent = null;
}

// 应用战斗奖励
function applyBattleReward(reward) {
    if (!reward) return;

    // 映射奖励类型
    let type = reward['Loại'];
    if (attributeMap[type]) {
        type = attributeMap[type];
    }
    const val = reward['Giá trị'];

    switch (type) {
        case '金钱':
            playerStats.金钱 += val;
            break;
        case '声望':
            playerStats.声望 += val;
            break;
        case '武学':
            playerStats.武学 += val;
            break;
        case '学识':
            playerStats.学识 += val;
            break;
    }
    checkAllValueRanges();
    updateStatsDisplay();
}

// 解析LLM响应
function parseLLMResponse(response, mainTextContent) {
    // 在函数开头添加时间解析
    randomEvent = 0;
    battleEvent = 0;
    if (response && response['Thời gian']) {
        const timeStr = response['Thời gian'];
        console.log(`当前时间：${timeStr}`);

        // 解析时间格式 "HH:MM"
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
            const hour = parseInt(timeMatch[1]);
            const minute = parseInt(timeMatch[2]);

            // 判断昼夜
            if (hour >= 6 && hour < 18) {
                dayNightStatus = 'daytime';
            } else {
                dayNightStatus = 'night';
            }

            console.log(`昼夜状态更新为：${dayNightStatus}`);

            // 更新场景背景
            updateSceneBackgrounds();
        } else {
            console.warn(`无法解析时间格式：${timeStr}`);
        }
    }

    // 解析用户位置变动
    if (GameMode === 0 && response && response['Người chơi'] && response['Người chơi']['Thay đổi vị trí'] && response['Người chơi']['Thay đổi vị trí'] !== 'none') {
        const userNewLocation = response['Người chơi']['Thay đổi vị trí'];
        console.log(`用户位置变动：${userNewLocation}`);

        // 查找对应的地点ID
        let userLocationId = null;
        for (const [locId, locName] of Object.entries(locationNames)) {
            if (locName === userNewLocation.trim()) {
                userLocationId = locId;
                break;
            }
        }

        if (userLocationId) {
            // 更新用户位置
            userLocation = userLocationId;
            userLocation_old = userLocation;
            // gameData.userLocation = userLocationId;

            console.log(`用户移动到：${userNewLocation} (${userLocationId})`);

            // 切换到新场景（如果不在特殊界面）
            const activeScene = document.querySelector('.scene.active');
            if (activeScene &&
                activeScene.id !== 'player-stats-scene' &&
                activeScene.id !== 'relationships-scene') {

                // 如果用户位置改变，切换场景
                const currentSceneId = activeScene.id.replace('-scene', '');
                if (currentSceneId !== userLocationId) {
                    switchScene(userLocationId);
                    // 在新场景显示NPC
                    displayNpcs(userLocationId);
                }
            }
        } else {
            console.warn(`未找到位置 "${userNewLocation}" 的ID映射`);
        }
    }

    // ====== SLG模式：把 MAIN_TEXT 交给 UI 侧的解析（支持流式增量）======
    if (GameMode === 1 && mainTextContent) {
        currentStoryText = mainTextContent;
        updateStoryText(mainTextContent);   // 内部会调用 parseSlgMainText 并即时渲染3层图
        // 下面保留：处理 response 中的NPC好感等数值变动（如有）
        if (response && response['NPC hiện tại'] && typeof response['NPC hiện tại'] === 'object') {
            for (const npcName in response['NPC hiện tại']) {
                const npcData = response['NPC hiện tại'][npcName];
                let npcId = npcNameToId[npcName];
                if (!npcId) {
                    console.warn(`未找到NPC "${npcName}" 的ID映射`);
                    continue;
                }
                // 好感变化
                if (npcData['Thay đổi hảo cảm'] && npcFavorability.hasOwnProperty(npcId)) {
                    let changeValue = 0;
                    const currentDifficulty = difficulty || 'normal';
                    switch (npcData['Thay đổi hảo cảm']) {
                        case 'Giảm mạnh': changeValue = (currentDifficulty === 'hard') ? -4 : -2; break;
                        case 'Giảm': changeValue = (currentDifficulty === 'hard') ? -2 : -1; break;
                        case 'Không đổi': changeValue = 0; break;
                        case 'Tăng': changeValue = (currentDifficulty === 'easy') ? 2 : 1; break;
                        case 'Tăng mạnh': changeValue = (currentDifficulty === 'easy') ? 4 : 2; break;
                    }
                    let finalChangeValue = changeValue;
                    let charmMessageShown = false;
                    if (changeValue > 0) {
                        const charmChance = playerTalents.魅力 / 2;
                        if (Math.random() * 100 < charmChance) {
                            finalChangeValue = changeValue * 2;
                            charmMessageShown = true;
                        }
                        // 应用周好感度上限限制
                        finalChangeValue = clampFavorabilityGain(npcId, finalChangeValue);
                    }
                    npcFavorability[npcId] = npcFavorability[npcId] + finalChangeValue;
                    checkAllValueRanges();
                    if (charmMessageShown && finalChangeValue > 0) {
                        setTimeout(() => {
                            showModal(`Đối với ${npcName} sức hút phán định thành công, hảo cảm độ biến hóa gấp bội`);
                        }, 100);
                    }
                }
            }
        }
    } else {
        // 原有的解析逻辑（普通模式）
        slgModeData = [];  // 清空SLG模式数据

        if (mainTextContent) {
            currentStoryText = mainTextContent;
            updateStoryText(currentStoryText);
        }

        // 处理当前NPC
        if (response['NPC hiện tại'] && typeof response['NPC hiện tại'] === 'object') {
            for (const npcName in response['NPC hiện tại']) {
                const npcData = response['NPC hiện tại'][npcName];

                let npcId = npcNameToId[npcName];

                if (!npcId) {
                    console.warn(`未找到NPC "${npcName}" 的ID映射`);
                    continue;
                }

                if (npcData['Thay đổi hảo cảm'] && npcFavorability.hasOwnProperty(npcId)) {
                    let changeValue = 0;

                    // 根据难度调整好感度变化值
                    const currentDifficulty = difficulty || 'normal';

                    switch (npcData['Thay đổi hảo cảm']) {
                        case 'Giảm mạnh':
                            if (currentDifficulty === 'easy') {
                                changeValue = -2;  // 简单：保持原状
                            } else if (currentDifficulty === 'normal') {
                                changeValue = -2;  // 普通：大幅下降变为-2
                            } else if (currentDifficulty === 'hard') {
                                changeValue = -4;  // 困难：大幅下降-4
                            }
                            break;

                        case 'Giảm':
                            if (currentDifficulty === 'easy') {
                                changeValue = -1;  // 简单：保持原状
                            } else if (currentDifficulty === 'normal') {
                                changeValue = -1;  // 普通：下降变为-1
                            } else if (currentDifficulty === 'hard') {
                                changeValue = -2;  // 困难：下降-2
                            }
                            break;

                        case 'Không đổi':
                            changeValue = 0;  // 所有难度都是0
                            break;

                        case 'Tăng':
                            if (currentDifficulty === 'easy') {
                                changeValue = 2;   // 简单：保持原状
                            } else if (currentDifficulty === 'normal') {
                                changeValue = 1;   // 普通：上升变为+1
                            } else if (currentDifficulty === 'hard') {
                                changeValue = 1;   // 困难：上升+1
                            }
                            break;

                        case 'Tăng mạnh':
                            if (currentDifficulty === 'easy') {
                                changeValue = 4;   // 简单：保持原状
                            } else if (currentDifficulty === 'normal') {
                                changeValue = 2;   // 普通：大幅上升变为+2
                            } else if (currentDifficulty === 'hard') {
                                changeValue = 2;   // 困难：大幅上升+2
                            }
                            break;
                    }

                    let finalChangeValue = changeValue;
                    let charmMessageShown = false;
                    if (changeValue > 0) {
                        const charmChance = playerTalents.魅力 / 2;
                        if (Math.random() * 100 < charmChance) {
                            finalChangeValue = changeValue * 2;
                            charmMessageShown = true;
                        }
                        // 应用周好感度上限限制
                        finalChangeValue = clampFavorabilityGain(npcId, finalChangeValue);
                    }

                    npcFavorability[npcId] = npcFavorability[npcId] + finalChangeValue;
                    checkAllValueRanges();

                    if (charmMessageShown && finalChangeValue > 0) {
                        setTimeout(() => {
                            showModal(`Đối với ${npcName} sức hút phán định thành công, hảo cảm độ biến hóa gấp bội`);
                        }, 100);
                    }
                }

                if (npcData['Thay đổi vị trí']) {
                    // 支持多种格式："演武场|议事厅|后山" 或 "伙房"
                    const locations = npcData['Thay đổi vị trí'].split('|').map(loc => loc.trim());
                    const toLocation = locations[locations.length - 1]; // 取最后一个位置

                    let toLocationId = null;
                    for (const [locId, locName] of Object.entries(locationNames)) {
                        if (locName === toLocation.trim()) {
                            toLocationId = locId;
                            break;
                        }
                    }

                    if (toLocationId) {
                        currentNpcLocations[npcId] = toLocationId;

                        switch (npcId) {
                            case 'A': npcLocationA = toLocationId; break;
                            case 'B': npcLocationB = toLocationId; break;
                            case 'C': npcLocationC = toLocationId; break;
                            case 'D': npcLocationD = toLocationId; break;
                            case 'E': npcLocationE = toLocationId; break;
                            case 'F': npcLocationF = toLocationId; break;
                            case 'G': npcLocationG = toLocationId; break;
                            case 'H': npcLocationH = toLocationId; break;
                            case 'I': npcLocationI = toLocationId; break;
                            case 'J': npcLocationJ = toLocationId; break;
                            case 'K': npcLocationK = toLocationId; break;
                            case 'L': npcLocationL = toLocationId; break;
                            // case 'Z': npcLocationZ = toLocationId; break;  // 占位角色Z - 已注释
                            case 'M': npcLocationM = toLocationId; break;
                            case 'N': npcLocationN = toLocationId; break;
                            case 'O': npcLocationO = toLocationId; break;
                        }

                        console.log(`${npcName} 移动到 ${toLocation}`);
                    } else {
                        console.warn(`未找到位置 "${toLocation}" 的ID映射`);
                    }
                }
            }
        }
    }

    // 处理随机事件
    if (response['Sự kiện ngẫu nhiên']) {
        currentRandomEvent = response['Sự kiện ngẫu nhiên'];

        // 有随机事件时禁用输入
        inputEnable = 0;
        if (typeof updateFreeActionInputState === 'function') {
            updateFreeActionInputState();
        }

        if (currentRandomEvent['Loại sự kiện'] === 'Sự kiện chiến đấu') {
            displayBattleEvent(currentRandomEvent);
            hideRandomEvent();
        } else {
            displayRandomEvent(currentRandomEvent);
            hideBattleEvent();
        }

        // 确保事件描述作为最后一页追加到正文后
        try {
            if (typeof updateStoryText === 'function' && typeof currentStoryText === 'string') {
                updateStoryText(currentStoryText);
            }
        } catch (e) { }
    } else {
        // 无随机事件时启用输入
        inputEnable = 1;
        if (typeof updateFreeActionInputState === 'function') {
            updateFreeActionInputState();
        }

        hideRandomEvent();
        hideBattleEvent();
    }
    console.log(`NPC好感度 ${npcFavorability}`);
    // 更新关系显示（如果在关系界面）
    const activeScene = document.querySelector('.scene.active');
    if (activeScene && activeScene.id === 'relationships-scene') {
        updateRelationshipsDisplay();
    }
    console.log(`currentNpcLocations ${currentNpcLocations}`);
    console.log(`npcLocationA ${npcLocationA}`);
    console.log(`npcLocationB ${npcLocationB}`);
    console.log(`npcLocationC ${npcLocationC}`);
    console.log(`npcLocationD ${npcLocationD}`);
    console.log(`npcLocationE ${npcLocationE}`);
    console.log(`npcLocationF ${npcLocationF}`);
    console.log(`npcLocationG ${npcLocationG}`);
    console.log(`npcLocationH ${npcLocationH}`);
    console.log(`npcLocationI ${npcLocationI}`);
    console.log(`npcLocationJ ${npcLocationJ}`);
    console.log(`npcLocationK ${npcLocationK}`);
    console.log(`npcLocationL ${npcLocationL}`);
    // console.log(`npcLocationZ ${npcLocationZ}`);  // 占位角色Z - 已注释
    console.log(`npcLocationM ${npcLocationM}`);
    console.log(`npcLocationN ${npcLocationN}`);
    console.log(`npcLocationO ${npcLocationO}`);
    // 更新当前场景的NPC显示
    if (activeScene && activeScene.id !== 'map-scene' &&
        activeScene.id !== 'player-stats-scene' &&
        activeScene.id !== 'relationships-scene') {
        const locationName = activeScene.id.replace('-scene', '');
        displayNpcs(locationName);
    }

    // 同步更新地图地点标签人数显示
    try {
        if (typeof updateLocationHeadcountLabels === 'function') {
            updateLocationHeadcountLabels();
        }
    } catch (e) { }

    checkAllValueRanges();
    updateAllDisplays();
}

// 监听iframe消息
function setupMessageListeners() {
    window.addEventListener('message', async function (event) {
        if (event.data.type === 'blackjack-exit') {
            playerStats.金钱 = event.data.money;
            checkAllValueRanges();
            updateStatsDisplay();

            document.getElementById('blackjack-modal').style.display = 'none';
            document.getElementById('blackjack-iframe').src = '';

            let message = `Kết thúc ván bài<br>Số tiền hiện có: ${playerStats.金钱}`;

            if (window.pendingMindMessage) {
                message = '【心性属性判定成功，本次行动不消耗行动点】<br><br>' + message;
                window.pendingMindMessage = false;
            }

            showModal(message);
        }
        else if (event.data.type === 'battle-exit') {
            document.getElementById('battle-modal').style.display = 'none';
            document.getElementById('battle-iframe').src = '';

            const result = event.data.result;

            if (currentBattleType === 'npc') {
                // 无论胜利还是失败，都标记本周已经切磋过
                npcSparred[currentBattleNpcId] = true;

                // 先同步道具数量变化（在发送消息之前，避免saveGameData保存旧数据）
                if (event.data.remainingItems) {
                    const remaining = event.data.remainingItems;
                    inventory['大力丸'] = remaining.daliwan || 0;
                    inventory['筋骨贴'] = remaining.jingutie || 0;
                    inventory['金疮药'] = remaining.jinchuangyao || 0;
                    inventory['霹雳丸'] = remaining.piliwan || 0;

                    // 清理数量为0的道具
                    Object.keys(inventory).forEach(key => {
                        if (inventory[key] === 0) {
                            delete inventory[key];
                        }
                    });

                    console.log('[战斗-NPC切磋] 道具数量已同步:', remaining);
                }

                // 获取时间信息
                const year = Math.floor((currentWeek - 1) / 48) + 1;
                const remainingWeeks = (currentWeek - 1) % 48;
                const month = Math.floor(remainingWeeks / 4) + 1;
                const week = remainingWeeks % 4 + 1;

                // 获取当前地点
                const activeScene = document.querySelector('.scene.active');
                const locationId = activeScene.id.replace('-scene', '');
                const locationName = locationNames[locationId] || '未知地点';

                // 构建地点信息
                let locationInfo = '';
                if (userLocation === userLocation_old) {
                    locationInfo = `Địa điểm: ${locationName}<br>`;
                } else {
                    const oldLocationName = locationNames[userLocation_old] || userLocation_old;
                    locationInfo = `Địa điểm: Từ ${oldLocationName} đi đến ${locationName}<br>`;
                }

                // 基础信息
                let resultMessage = `Thời gian: Năm ${year} Tháng ${month} Tuần ${week}<br>` +
                    `Mùa: ${seasonNameMap[seasonStatus] || 'Mùa Đông'}<br>` +
                    locationInfo +  // 使用新的地点信息
                    `{{user}} lựa chọn hành động: Tỷ thí võ nghệ<br>` +
                    `Đối thủ tỷ thí: ${currentBattleNpcName}<br>`;

                if (result === 'victory') {
                    resultMessage += `Kết quả: Thắng<br><br>Thay đổi thuộc tính: `;

                    // 获取对应的奖励配置
                    const reward = npcSparRewards[currentBattleNpcId];

                    if (reward) {
                        // 应用奖励
                        if (playerTalents.hasOwnProperty(reward.type)) {
                            // 天赋属性
                            playerTalents[reward.type] = Math.min(100, playerTalents[reward.type] + reward.value);
                        } else if (playerStats.hasOwnProperty(reward.type)) {
                            // 人物数值
                            playerStats[reward.type] += reward.value;
                        }
                        resultMessage += `<br>${reward.type}: +${reward.value}`;
                        checkAllValueRanges();
                        updateStatsDisplay();
                    }

                } else if (result === 'defeat' || result === 'quit') {
                    resultMessage += `Kết quả: Thua<br><br>Thay đổi thuộc tính:<br>Không`;
                }

                await handleMessageOutput(resultMessage);

                currentBattleNpcName = null;
                currentBattleNpcId = null;

            } else if (currentBattleType === 'event') {
                // 先同步道具数量变化（在发送消息之前，避免saveGameData保存旧数据）
                if (event.data.remainingItems) {
                    const remaining = event.data.remainingItems;
                    inventory['大力丸'] = remaining.daliwan || 0;
                    inventory['筋骨贴'] = remaining.jingutie || 0;
                    inventory['金疮药'] = remaining.jinchuangyao || 0;
                    inventory['霹雳丸'] = remaining.piliwan || 0;

                    // 清理数量为0的道具
                    Object.keys(inventory).forEach(key => {
                        if (inventory[key] === 0) {
                            delete inventory[key];
                        }
                    });

                    console.log('[战斗-事件] 道具数量已同步:', remaining);
                }

                if (result === 'victory') {
                    let rewardMessage = '';
                    if (currentBattleReward) {
                        applyBattleReward(currentBattleReward);
                        rewardMessage = `<br>Nhận thưởng: ${currentBattleReward['Loại']}+${currentBattleReward['Giá trị']}`;
                    }
                    await handleMessageOutput(currentBattleEvent['Mô tả sự kiện'] +
                        `<br><br>Bạn đã chiến thắng khi đối đầu với ${currentBattleEvent['Thông tin kẻ địch']['Tên']}!` +
                        rewardMessage);
                } else if (result === 'defeat' || result === 'quit') {
                    await handleMessageOutput(currentBattleEvent['Mô tả sự kiện'] +
                        `<br><br>Bạn đã thất bại khi đối đầu với ${currentBattleEvent['Thông tin kẻ địch']['Tên']}.`);
                }

                hideBattleEvent();
            } else {
                // 非NPC切磋、非事件战斗的情况，也需要同步道具
                if (event.data.remainingItems) {
                    const remaining = event.data.remainingItems;
                    inventory['大力丸'] = remaining.daliwan || 0;
                    inventory['筋骨贴'] = remaining.jingutie || 0;
                    inventory['金疮药'] = remaining.jinchuangyao || 0;
                    inventory['霹雳丸'] = remaining.piliwan || 0;

                    // 清理数量为0的道具
                    Object.keys(inventory).forEach(key => {
                        if (inventory[key] === 0) {
                            delete inventory[key];
                        }
                    });

                    console.log('[战斗-其他] 道具数量已同步:', remaining);
                }
            }

            currentBattleType = null;
            currentBattleReward = null;
        }
        else if (event.data.type === 'farm-exit') {
            // 更新金钱
            playerStats.金钱 = event.data.money;

            // 更新种子数量
            if (event.data.seeds) {
                inventory['小麦种子'] = event.data.seeds.wheat || 0;
                inventory['茄子种子'] = event.data.seeds.eggplant || 0;
                inventory['甜瓜种子'] = event.data.seeds.melon || 0;
                inventory['甘蔗种子'] = event.data.seeds.sugarcane || 0;

                // 清理数量为0的种子
                Object.keys(inventory).forEach(key => {
                    if (inventory[key] === 0) {
                        delete inventory[key];
                    }
                });
            }

            // 保存农场状态
            lastFarmWeek = currentWeek;
            farmGrid = event.data.farmGrid || [];

            checkAllValueRanges();
            updateAllDisplays();
            // await saveGameData();  // 保存游戏数据

            document.getElementById('farm-modal').style.display = 'none';
            document.getElementById('farm-iframe').src = '';
        }
        else if (event.data.type === 'alchemy-exit') {
            // 更新金钱
            playerStats.金钱 = event.data.money;

            // 更新药材数量
            if (event.data.herbs) {
                inventory['丹参'] = event.data.herbs.danshen || 0;
                inventory['当归'] = event.data.herbs.danggui || 0;
                inventory['没药'] = event.data.herbs.moyao || 0;
                inventory['沉香'] = event.data.herbs.chenxiang || 0;
            }

            // 更新丹药数量
            if (event.data.pills) {
                inventory['大力丸'] = event.data.pills.daliwan || 0;
                inventory['筋骨贴'] = event.data.pills.jingutie || 0;
                inventory['金疮药'] = event.data.pills.jinchuangyao || 0;
                inventory['霹雳丸'] = event.data.pills.piliwan || 0;
            }

            // 更新天赋属性（直接赋值，因为alchemy返回的是完整值而非增量）
            if (event.data.playerStats) {
                playerTalents.根骨 = event.data.playerStats.rootBone ?? playerTalents.根骨;
                playerTalents.悟性 = event.data.playerStats.comprehension ?? playerTalents.悟性;
                playerTalents.心性 = event.data.playerStats.nature ?? playerTalents.心性;
                playerTalents.魅力 = event.data.playerStats.charm ?? playerTalents.魅力;
            }

            // 清理数量为0的物品
            Object.keys(inventory).forEach(key => {
                if (inventory[key] === 0) {
                    delete inventory[key];
                }
            });

            // 标记本周已炼丹
            alchemyDone = true;

            checkAllValueRanges();
            updateAllDisplays();
            // await saveGameData();  // 保存游戏数据

            document.getElementById('alchemy-modal').style.display = 'none';
            document.getElementById('alchemy-iframe').src = '';
        }
        else if (event.data.type === 'worldmap-close') {
            // 只关闭弹窗，不做任何其他操作
            document.getElementById('worldmap-modal').style.display = 'none';
            document.getElementById('worldmap-iframe').src = '';
            return;  // 直接返回，不执行任何其他操作
        }
        else if (event.data.type === 'worldmap-exit') {
            // 关闭世界地图弹窗
            document.getElementById('worldmap-modal').style.display = 'none';
            document.getElementById('worldmap-iframe').src = '';

            // 更新游戏状态
            if (event.data.mapLocation) {
                mapLocation = event.data.mapLocation;
            }
            if (event.data.companionNPC) {
                companionNPC = event.data.companionNPC;
            }
            if (event.data.randomEvent !== undefined) {
                randomEvent = event.data.randomEvent;
            }
            if (event.data.battleEvent !== undefined) {
                battleEvent = event.data.battleEvent;
            }

            // 构建返回消息
            const year = Math.floor((currentWeek - 1) / 48) + 1;
            const remainingWeeks = (currentWeek - 1) % 48;
            const month = Math.floor(remainingWeeks / 4) + 1;
            const week = remainingWeeks % 4 + 1;

            // 生成随行NPC名字列表
            let companionNames = 'Không';
            if (companionNPC && companionNPC.length > 0) {
                // 将NPC名字转换为ID
                const npcIds = companionNPC.map(name => {
                    // 如果传递的是名字，转换为ID
                    return npcNameToId[name] || name;
                });
                // 再从ID获取名字（确保格式正确）
                companionNames = npcIds.map(id => npcs[id]?.name || id).join('、');
            }

            // 构建事件信息
            let eventInfo = '';
            if (randomEvent === 1) {
                eventInfo += '<br>Sự kiện đặc biệt: Phát hiện sự kiện ngẫu nhiên';
            }
            if (battleEvent === 1) {
                eventInfo += '<br>Sự kiện đặc biệt: Gặp phải chiến đấu';
            }

            const resultMessage =
                `Thời gian: Năm ${year} Tháng ${month} Tuần ${week}<br>` +
                `Mùa: ${seasonNameMap[seasonStatus] || 'Mùa Đông'}<br>` +
                `{{user}} lựa chọn hành động: Xuống núi du lịch<br>` +
                `Đi đến đích: ${mapLocation}<br>` +
                `NPC đi cùng: ${companionNames}` +
                eventInfo;

            // 保存游戏数据
            checkAllValueRanges();
            updateAllDisplays();
            // await saveGameData();

            // 发送消息
            GameMode = 1;
            await handleMessageOutput(resultMessage);
        }
    });
}