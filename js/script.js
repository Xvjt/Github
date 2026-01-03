// 获取DOM元素
const coreArea = document.getElementById('coreArea');
const toolScroll = document.getElementById('toolScroll');
const leftArrow = document.getElementById('leftArrow');
const rightArrow = document.getElementById('rightArrow');
const statusInfo = document.getElementById('statusInfo');
const toolItems = document.querySelectorAll('.tool-item');
const toolContainer = document.querySelector('.tool-container');
const textPopup = document.getElementById('textPopup');
const popupImage = document.getElementById('popupImage');

// 状态变量 - 添加步骤状态管理
let currentToolIndex = 0;
let visibleItems = window.innerWidth >= 768 ? 6 : 4;
// 修复：将itemWidth初始化为0，在DOM加载完成后再计算实际值
let itemWidth = 0;
let currentStep = 'ZhiCha';
let currentIndex = 0;
let isPopupVisible = false;
let canChangeTool = true;
let stepStates = {}; // 步骤状态管理
// 添加触摸滑动相关状态变量
let touchStartX = 0;
let touchEndX = 0;
let isDragging = false;
let startX = 0;
let scrollLeft = 0;

// 步骤图片配置 - 确保只有一个定义
const stepConfig = {
    'ZhiCha': { maxIndex: 2, has02: true, toolIndex: 1 },
    'SuiCha': { maxIndex: 2, has02: true, toolIndex: 2 },
    'NianCha': { maxIndex: 1, has02: false, toolIndex: 3 },
    'ZhiHe': { maxIndex: 2, has02: true, toolIndex: 4 },
    'MoCha': { maxIndex: 1, has02: false, toolIndex: 5 },
    'TangZhan': { maxIndex: 2, has02: true, toolIndex: 6 },
    'QuFen': { maxIndex: 2, has02: true, toolIndex: 7 },
    'ZhuTang': { maxIndex: 1, has02: false, toolIndex: 8 },
    'JiFu': { maxIndex: 1, has02: false, toolIndex: 9 }
};

// 初始化步骤状态
function initStepStates() {
    Object.keys(stepConfig).forEach(step => {
        stepStates[step] = {
            unlocked: false,
            currentIndex: 0,
            toolEnabled: false
        };
    });
    // 默认解锁第一个步骤
    stepStates['ZhiCha'].unlocked = true;
}

// 显示文字弹窗
function showTextPopup(step, index) {
    const textImagePath = `Text/${step}_Text${index.toString().padStart(2, '0')}.png`;
    popupImage.src = textImagePath;
    textPopup.classList.remove('hidden');
    textPopup.classList.add('visible');
    isPopupVisible = true;
    canChangeTool = false;
    
    // 添加弹窗震动效果
    textPopup.style.animation = 'popupShake 0.3s ease-out';
    setTimeout(() => {
        textPopup.style.animation = '';
    }, 300);
    
    // 如果是击拂步骤的Text01，添加点击跳转功能
    if (step === 'JiFu' && index === 1) {
        // 移除之前的自动跳转逻辑
        // 添加点击事件监听器
        const clickHandler = function(event) {
            // 阻止事件冒泡，避免触发coreArea的点击事件
            event.stopPropagation();
            // 立即跳转到完成页面
            window.location.href = 'https://hayden0226.github.io/newtea/';
        };
        
        // 为弹窗容器和图片都添加点击事件
        textPopup.addEventListener('click', clickHandler);
        popupImage.addEventListener('click', clickHandler);
        
        // 存储点击处理器以便后续移除
        textPopup._jumpHandler = clickHandler;
        popupImage._jumpHandler = clickHandler;
    }
}

// 隐藏文字弹窗
function hideTextPopup() {
    // 如果是击拂步骤的Text01，移除点击事件
    if (textPopup._jumpHandler) {
        textPopup.removeEventListener('click', textPopup._jumpHandler);
        popupImage.removeEventListener('click', popupImage._jumpHandler);
        delete textPopup._jumpHandler;
        delete popupImage._jumpHandler;
    }
    
    textPopup.classList.remove('visible');
    textPopup.classList.add('hidden');
    isPopupVisible = false;
    canChangeTool = true;
}

// 解锁对应工具按钮
function unlockToolForStep(step) {
    const config = stepConfig[step];
    if (config && config.toolIndex !== undefined) {
        // 解锁对应工具
        const toolIndex = config.toolIndex;
        stepStates[step].toolEnabled = true;
        
        // 添加解锁动画
        if (toolItems[toolIndex - 1]) {
            toolItems[toolIndex - 1].classList.add('unlocking');
            setTimeout(() => {
                toolItems[toolIndex - 1].classList.remove('unlocking');
            }, 1000);
        }
        
        // 更新工具状态
        updateToolStates();
    }
}

// 更新工具状态
function updateToolStates() {
    toolItems.forEach((item, index) => {
        const toolNumber = index + 1;
        const stepOrder = ['ZhiCha', 'SuiCha', 'NianCha', 'ZhiHe', 'MoCha', 'TangZhan', 'QuFen', 'ZhuTang', 'JiFu'];
        const step = stepOrder[index];
        const state = stepStates[step];
        
        if (state && state.toolEnabled) {
            item.style.opacity = '1';
            item.style.cursor = 'pointer';
            item.style.pointerEvents = 'auto';
        } else {
            item.style.opacity = '0.5';
            item.style.cursor = 'not-allowed';
            item.style.pointerEvents = 'none';
        }
    });
}

// 处理工具点击后的步骤进展
function handleToolAction(step) {
    const state = stepStates[step];
    const config = stepConfig[step];
    
    if (!state.toolEnabled) return;
    
    if (state.currentIndex === 0) {
        // 从00状态，点击工具后显示01
        state.currentIndex = 1;
        showStepImages(step, 1);
        
        if (config.has02) {
            // 有02的情况，显示02和Text01
            setTimeout(() => {
                state.currentIndex = 2;
                showStepImages(step, 2);
                showTextPopup(step, 1);
            }, 1000);
        } else {
            // 没有02的情况，直接显示Text01
            setTimeout(() => {
                showTextPopup(step, 1);
            }, 500);
        }
    }
}

// 点击继续功能 - 重新设计
function initContinueClick() {
    coreArea.addEventListener('click', () => {
        if (isPopupVisible) {
            // 点击弹窗后隐藏弹窗
            hideTextPopup();
            
            // 如果是Text00弹窗，解锁对应工具
            const visibleImg = document.querySelector('.core-area img.visible');
            if (!visibleImg) return;
            
            const step = visibleImg.dataset.step;
            const index = parseInt(visibleImg.dataset.index);
            
            if (index === 0) {
                unlockToolForStep(step);
            } else if (index >= 1) {
                // 当前步骤已完成（index 1 或 2），解锁并自动切换到下一步骤的 00
                const stepOrder = ['ZhiCha', 'SuiCha', 'NianCha', 'ZhiHe', 'MoCha', 'TangZhan', 'QuFen', 'ZhuTang', 'JiFu'];
                const currentIndex = stepOrder.indexOf(step);
                
                if (currentIndex < stepOrder.length - 1) {
                    const nextStep = stepOrder[currentIndex + 1];
                    stepStates[nextStep].unlocked = true;
                    // 自动切换到下一步的 00 并显示其 Text00
                    switchToStep(nextStep);
                }
            }
        }
    });
}

// 切换到指定步骤
function switchToStep(step) {
    if (!stepStates[step].unlocked) return;
    
    currentStep = step;
    currentIndex = 0;
    stepStates[step].currentIndex = 0;
    showStepImages(step, 0);
    
    // 显示Text00弹窗
    setTimeout(() => {
        showTextPopup(step, 0);
    }, 500);
}

// 工具点击事件 - 重新设计
toolItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (!canChangeTool) return;
        
        const stepOrder = ['ZhiCha', 'SuiCha', 'NianCha', 'ZhiHe', 'MoCha', 'TangZhan', 'QuFen', 'ZhuTang', 'JiFu'];
        const step = stepOrder[index];
        
        if (stepStates[step] && stepStates[step].toolEnabled) {
            // 更新工具聚焦状态
            currentToolIndex = index;
            updateToolFocus();
            // 滚动到点击的工具
            scrollToTool(index);
            
            // 处理工具点击后的步骤进展
            handleToolAction(step);
        }
    });
});

// 初始化工具项背景图片
function initToolBackgrounds() {
    toolItems.forEach((item, index) => {
        const toolNumber = index + 1;
        item.style.backgroundImage = `url('pic/GonJu${toolNumber}.png')`;
        item.style.backgroundPosition = 'center';
        item.style.backgroundSize = 'contain';
    });
}

// 滚动到指定工具索引 - 优化后的原生滚动实现
function scrollToTool(index) {
    // 计算工具容器的宽度
    const containerWidth = toolContainer.offsetWidth;
    // 计算所有工具项的总宽度
    const totalToolsWidth = toolItems.length * itemWidth;
    // 计算最大允许的滚动距离
    const maxScrollLeft = Math.max(0, totalToolsWidth - containerWidth);
    
    // 根据索引计算目标滚动位置，确保工具居中显示
    let targetScrollLeft = index * itemWidth - (containerWidth - itemWidth) / 2;
    // 确保不会滚动过度
    targetScrollLeft = Math.min(targetScrollLeft, maxScrollLeft);
    targetScrollLeft = Math.max(targetScrollLeft, 0);
    
    // 使用原生scrollTo方法实现平滑滚动
    toolScroll.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
    });
    
    // 更新当前索引
    currentToolIndex = index;
    updateToolFocus();
    updateArrowStatus();
}

// 更新工具聚焦状态
function updateToolFocus() {
    toolItems.forEach((item, index) => {
        if (index === currentToolIndex) {
            item.classList.add('focused');
        } else {
            item.classList.remove('focused');
        }
    });
}

// 更新箭头状态 - 移除禁用逻辑，保持箭头始终可点击
function updateArrowStatus() {
    // 不再禁用箭头，保持可点击状态
    // 仅保留状态计算用于参考
    const scrollLeft = toolScroll.scrollLeft;
    const scrollWidth = toolScroll.scrollWidth;
    const clientWidth = toolScroll.clientWidth;
    const maxScrollLeft = scrollWidth - clientWidth;
}

// 添加鼠标滚轮滚动支持
toolScroll.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // 根据滚轮方向计算目标索引
    let targetIndex;
    if (e.deltaY < 0) {
        // 向上滚动（向左）
        targetIndex = Math.max(0, currentToolIndex - 1);
    } else {
        // 向下滚动（向右）
        targetIndex = Math.min(toolItems.length - 1, currentToolIndex + 1);
    }
    
    // 滚动到目标工具
    scrollToTool(targetIndex);
});

// 鼠标拖动支持
toolScroll.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - toolScroll.offsetLeft;
    scrollLeft = toolScroll.scrollLeft;
    toolScroll.classList.add('dragging');
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    toolScroll.classList.remove('dragging');
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - toolScroll.offsetLeft;
    const walk = (x - startX) * 2; // 拖动速度
    toolScroll.scrollLeft = scrollLeft - walk;
});

// 触摸滑动支持
toolScroll.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.changedTouches[0].pageX - toolScroll.offsetLeft;
    scrollLeft = toolScroll.scrollLeft;
});

toolScroll.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.changedTouches[0].pageX - toolScroll.offsetLeft;
    const walk = (x - startX) * 2; // 滑动速度
    toolScroll.scrollLeft = scrollLeft - walk;
});

toolScroll.addEventListener('touchend', (e) => {
    isDragging = false;
    // 基于滑动距离进行额外的惯性滚动
    const endX = e.changedTouches[0].pageX;
    const diffX = startX - endX;
    
    // 如果滑动距离超过阈值，添加惯性滚动效果
    if (Math.abs(diffX) > 10) {
        const inertia = diffX * 0.3; // 惯性系数
        toolScroll.scrollLeft += inertia;
    }
});

// 窗口大小改变时重新计算参数
window.addEventListener('resize', function() {
    // 重新计算可见工具项数量
    visibleItems = window.innerWidth >= 768 ? 6 : 4;
    // 重新计算工具项宽度
    itemWidth = toolItems[0].offsetWidth + 15;
    // 重新调整滚动位置
    scrollToTool(currentToolIndex);
    updateArrowStatus();
});

// 左箭头点击事件 - 保持可点击，在边界时不执行无效滚动
leftArrow.addEventListener('click', () => {
    if (!canChangeTool) return;
    
    // 计算当前滚动位置和边界
    const scrollLeft = toolScroll.scrollLeft;
    const scrollWidth = toolScroll.scrollWidth;
    const clientWidth = toolScroll.clientWidth;
    const maxScrollLeft = scrollWidth - clientWidth;
    
    // 如果已经滚动到最左边，不执行滚动
    if (scrollLeft <= 5) return;
    
    // 计算每次滚动的距离
    const scrollDistance = Math.min(visibleItems, Math.ceil(currentToolIndex)) * itemWidth;
    
    // 计算目标索引
    const targetIndex = Math.max(0, currentToolIndex - visibleItems);
    
    // 滚动到目标索引
    scrollToTool(targetIndex);
    updateArrowStatus();
});

// 右箭头点击事件 - 保持可点击，在边界时不执行无效滚动
rightArrow.addEventListener('click', () => {
    if (!canChangeTool) return;
    
    // 计算当前滚动位置和边界
    const scrollLeft = toolScroll.scrollLeft;
    const scrollWidth = toolScroll.scrollWidth;
    const clientWidth = toolScroll.clientWidth;
    const maxScrollLeft = scrollWidth - clientWidth;
    
    // 如果已经滚动到最右边，不执行滚动
    if (scrollLeft >= maxScrollLeft - 5) return;
    
    // 计算每次滚动的距离
    const scrollDistance = Math.min(visibleItems, Math.floor(toolItems.length - currentToolIndex - 1)) * itemWidth;
    
    // 计算目标索引
    const targetIndex = Math.min(toolItems.length - 1, currentToolIndex + visibleItems);
    
    // 滚动到目标索引
    scrollToTool(targetIndex);
    updateArrowStatus();
});

// 添加滚动事件监听器，实时更新工具聚焦状态
toolScroll.addEventListener('scroll', () => {
    updateArrowStatus();
    
    // 计算当前可见区域中心的工具索引
    const scrollLeft = toolScroll.scrollLeft;
    const containerWidth = toolScroll.clientWidth;
    const centerX = scrollLeft + containerWidth / 2;
    
    // 找到中心位置对应的工具项
    let closestIndex = 0;
    let minDistance = Infinity;
    
    toolItems.forEach((item, index) => {
        const itemLeft = item.offsetLeft;
        const itemRight = itemLeft + item.offsetWidth;
        const itemCenter = (itemLeft + itemRight) / 2;
        const distance = Math.abs(itemCenter - centerX);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });
    
    // 更新当前工具索引和聚焦状态
    if (currentToolIndex !== closestIndex) {
        currentToolIndex = closestIndex;
        updateToolFocus();
    }
});

// 初始化弹窗点击事件
function initPopupClick() {
    textPopup.addEventListener('click', () => {
        hideTextPopup();
        handlePopupClosed();
    });
}

// 弹窗关闭后的统一处理逻辑：解锁工具或切换到下一步骤的 00 并显示其 Text00
function handlePopupClosed() {
    const visibleImg = document.querySelector('.core-area img.visible');
    if (!visibleImg) return;

    const step = visibleImg.dataset.step;
    const index = parseInt(visibleImg.dataset.index);

    if (index === 0) {
        unlockToolForStep(step);
    } else if (index >= 1) {
        const stepOrder = ['ZhiCha', 'SuiCha', 'NianCha', 'ZhiHe', 'MoCha', 'TangZhan', 'QuFen', 'ZhuTang', 'JiFu'];
        const currentIndex = stepOrder.indexOf(step);
        if (currentIndex < stepOrder.length - 1) {
            const nextStep = stepOrder[currentIndex + 1];
            stepStates[nextStep].unlocked = true;
            switchToStep(nextStep);
        }
    }
}

// 显示指定步骤和索引的图片
function showStepImages(step, index) {
    const images = document.querySelectorAll('.core-area img');
    images.forEach(img => {
        if (img.dataset.step === step && parseInt(img.dataset.index) === index) {
            img.classList.add('visible');
            img.classList.remove('hidden');
        } else {
            img.classList.add('hidden');
            img.classList.remove('visible');
        }
    });
    
    // 更新状态信息
    const config = stepConfig[step];
    if (statusInfo) {
        statusInfo.textContent = `当前步骤: ${getStepName(step)} ${index}/${config.maxIndex} | 当前工具: ${currentToolIndex + 1}/9`;
    }
}

// 获取步骤中文名称
function getStepName(step) {
    const stepNames = {
        'ZhiCha': '炙茶',
        'SuiCha': '碎茶',
        'NianCha': '碾茶',
        'ZhiHe': '置盒',
        'MoCha': '磨茶',
        'TangZhan': '烫盏',
        'QuFen': '取粉',
        'ZhuTang': '注汤',
        'JiFu': '击拂'
    };
    return stepNames[step] || step;
}

// 返回按钮功能
function initBackButton() {
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (!canChangeTool) return;
            
            const stepOrder = ['ZhiCha', 'SuiCha', 'NianCha', 'ZhiHe', 'MoCha', 'TangZhan', 'QuFen', 'ZhuTang', 'JiFu'];
            const currentStepIndex = stepOrder.indexOf(currentStep);
            
            if (currentStepIndex > 0) {
                const previousStep = stepOrder[currentStepIndex - 1];
                if (stepStates[previousStep].unlocked) {
                    switchToStep(previousStep);
                }
            } else {
                switchToStep('ZhiCha');
            }
        });
    }
}

// 音乐播放器功能
function initMusicPlayer() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.loop = true;
        
        document.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().catch(e => console.log('音乐播放失败:', e));
            }
        }, { once: true });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 创建加载指示器
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingOverlay);
    
    // 修复：在DOM加载完成后计算itemWidth的实际值
    if (toolItems.length > 0) {
        itemWidth = toolItems[0].offsetWidth + 15;
    }
    
    initToolBackgrounds();
    initStepStates();
    scrollToTool(currentToolIndex);
    initContinueClick();
    showStepImages('ZhiCha', 0); // 默认显示炙茶步骤
    initPopupClick();
    initBackButton();
    initMusicPlayer();
    
    // 默认显示炙茶步骤的Text00，不再自动隐藏，需要用户点击关闭
    setTimeout(() => {
        showTextPopup('ZhiCha', 0);
        // 直接解锁第一个步骤的工具，允许点击工具01立即生效
        unlockToolForStep('ZhiCha');
    }, 500);
});

// 添加弹窗震动动画关键帧
const style = document.createElement('style');
style.textContent = `
    @keyframes popupShake {
        0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        25% { transform: translate(-50%, -50%) scale(1.02) rotate(1deg); }
        50% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        75% { transform: translate(-50%, -50%) scale(1.02) rotate(-1deg); }
        100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
    }
`;