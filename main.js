// API Key管理
document.getElementById('saveApiKey').addEventListener('click', function() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (apiKey) {
        localStorage.setItem('minimax_api_key', apiKey);
        this.innerHTML = '✅ 已保存';
        setTimeout(() => {
            this.innerHTML = '保存';
        }, 2000);
    } else {
        alert('请输入有效的API Key');
    }
});

// 页面加载时恢复API Key
window.addEventListener('load', function() {
    const savedApiKey = localStorage.getItem('minimax_api_key');
    if (savedApiKey) {
        document.getElementById('apiKeyInput').value = savedApiKey;
    }
});

// 表单提交处理
document.getElementById('storyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const puzzleType = document.getElementById('puzzleType').value;
    const era = document.getElementById('era').value;
    const difficulty = document.getElementById('difficulty').value;
    
    await generateTurtleSoupWithAI(puzzleType, era, difficulty);
});

// 生成海龟汤的主函数
async function generateTurtleSoupWithAI(puzzleType, era, difficulty) {
    const apiKey = localStorage.getItem('minimax_api_key');
    
    if (!apiKey) {
        alert('请先配置MiniMax API Key');
        return;
    }
    
    const generateBtn = document.getElementById('generateBtn');
    const storyOutput = document.getElementById('storyOutput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const storyContent = document.getElementById('storyContent');
    const storyText = document.getElementById('storyText');
    
    generateBtn.disabled = true;
    generateBtn.innerHTML = '🤖 MiniMax-M2 正在创作海龟汤...';
    
    storyOutput.classList.remove('hidden');
    loadingIndicator.classList.remove('hidden');
    storyContent.classList.add('hidden');
    
    try {
        const prompt = buildTurtleSoupPrompt(puzzleType, era, difficulty);
        const turtleSoup = await callMiniMaxAPI(prompt, apiKey);
        
        loadingIndicator.classList.add('hidden');
        storyText.textContent = turtleSoup;
        storyContent.classList.remove('hidden');
        
    } catch (error) {
        loadingIndicator.classList.add('hidden');
        storyText.textContent = `❌ 生成失败: ${error.message}\n\n🔄 正在使用备用生成模式...`;
        storyContent.classList.remove('hidden');
        
        // 如果API调用失败，回退到本地生成
        setTimeout(() => {
            const fallbackStory = createTurtleSoup(puzzleType, era, difficulty);
            storyText.textContent = fallbackStory;
        }, 2000);
    }
    
    generateBtn.disabled = false;
    generateBtn.innerHTML = '🐢 生成海龟汤谜题';
}

// 构建提示词
function buildTurtleSoupPrompt(puzzleType, era, difficulty) {
    const puzzleTypes = {
        death: "死亡之谜",
        identity: "身份之谜", 
        behavior: "行为之谜",
        mystery: "悬疑事件",
        logic: "逻辑悖论"
    };
    
    const eraContext = {
        ancient: "古代背景（可包含古代服饰、建筑、社会背景）",
        modern: "现代背景（可包含现代科技、城市生活、社会现象）"
    };
    
    const difficultyLevels = {
        easy: "简单（给3-4个明显线索，新手可解）",
        medium: "中等（给2-3个关键线索，需要逻辑推理）",
        hard: "困难（给1-2个隐藏线索，需要深度思考）"
    };
    
    return `请创作一个海龟汤逻辑推理谜题。

要求：
- 谜题类型：${puzzleTypes[puzzleType]}
- 背景设定：${eraContext[era]}
- 复杂度：${difficultyLevels[difficulty]}
- 语言：中文
- 格式：请用markdown格式，按以下结构：

## 🐢 海龟汤谜题

### 谜面（情境描述）
描述一个看似不可能或令人困惑的情境

### 关键线索（1-4个）
提供帮助推理的重要线索

### 推理过程
展示完整的逻辑推理步骤

### 最终答案
揭示事情真相和完整故事

请确保谜题有趣、逻辑严密、答案合理。海龟汤的魅力在于通过有限的线索推理出令人意想不到的真相。`;
}

// 调用MiniMax API
async function callMiniMaxAPI(prompt, apiKey) {
    const response = await fetch('https://api.minimaxi.com/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'abab6.5s-chat',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// 备用本地生成函数
function createTurtleSoup(puzzleType, era, difficulty) {
    const templates = getTurtleSoupTemplates();
    const key = `${era}_${puzzleType}_${difficulty}`;
    const template = templates[key];
    
    if (template) {
        return template;
    }
    
    // 如果没有对应模板，生成动态内容
    return generateDynamicTurtleSoup(puzzleType, era, difficulty);
}

// 获取海龟汤模板
function getTurtleSoupTemplates() {
    return {
        'ancient_death_easy': `## 🐢 海龟汤谜题

### 谜面（情境描述）
一位古代大臣清晨被发现死在自己的书房中，桌上放着一封未写完的遗书，房门紧锁，钥匙在死者身上。

### 关键线索
1. 遗书只写了一半就停了
2. 书房位于三楼，跳窗自杀不可能
3. 死者的茶杯里有苦味
4. 管家说昨晚听到奇怪的声音

### 推理过程
从线索1和2可以推断，这不是自杀。从线索4和死者茶杯的苦味可以推断是中毒。

### 最终答案
大臣是被毒杀的。凶手是他的妻子，在茶杯里下毒，然后利用管家听到的声音制造不在场证明。`,
        
        'modern_mystery_medium': `## 🐢 海龟汤谜题

### 谜面（情境描述）
程序员小李被发现死在家中电脑前，屏幕上显示着他正在编写的代码，警察发现门锁完好，窗户紧闭。

### 关键线索
1. 电脑屏幕上的代码最后几行是乱码
2. 小李的习惯是在睡前喝咖啡，但今天咖啡杯是满的
3. 地上有一滩水迹
4. 邻居说昨晚听到类似重物落地的声音

### 推理过程
从线索1的乱码和线索3的水迹可以推断是触电。线索2显示小李没有喝咖啡，说明在他预期要睡觉时发生了意外。

### 最终答案
小李是在修电脑时触电身亡的。他拔掉电源后，误以为安全，但静电仍然存在，触碰电路时触电死亡。水迹是他倒下时打翻的水杯造成的。`,
        
        'ancient_identity_hard': `## 🐢 海龟汤谜题

### 谜面（情境描述）
在古代京城一家客栈里，一个穿着华丽服饰的人被发现死在自己的房间里奇怪的是房间里还有另一个人，穿着同样的衣服，有着相同的面容。

### 关键线索
1. 两人的服饰完全相同，但材质新旧不同
2. 死者的钱包里有贵重物品，而活人的钱包很轻
3. 活人说话有些结巴，而死者生前口才很好
4. 客栈老板说昨晚只看到一个人进房间

### 推理过程
从线索1和2可以推断，这不是双胞胎案件。线索3和4说明房间内只有一个人。

### 最终答案
这是同一个人。死者在房间内换装，将新衣服穿在身上，旧的留在地上。钱包是道具，为了营造假象。最后用某种方法制造了自己的"死亡"，然后离开。`,
        
        'modern_behavior_easy': `## 🐢 海龟汤谜题

### 谜面（情境描述）
小明每天都会在凌晨3点准时从10楼跳下，但每次都能毫发无伤地回到房间，第二天继续。

### 关键线索
1. 小明没有任何超能力
2. 每次跳下后第二天精神很好
3. 楼下有个巨大的气垫床
4. 小明的房间在10楼

### 推理过程
从线索1和3可以推断，这不是超自然现象，而是有物理基础的。

### 最终答案
小明是在训练消防员的跳伞技能。每天凌晨3点跳下气垫床，第二天恢复。这是他作为消防员的日常训练。`,
        
        'ancient_logic_medium': `## 🐢 海龟汤谜题

### 谜面（情境描述）
一位古代将军下令处死所有说谎的人，但第二天早上，所有说真话的人都被处死了。

### 关键线索
1. 将军的话是真实的命令
2. 将军自己也被处死了
3. 处死方式是根据每个人的罪行
4. 将军没有违反自己的命令

### 推理过程
从线索1和2可以推断，将军说了真话。从线索3和4可以推断，每个人都按自己罪行被处死。

### 最终答案
将军宣布"说谎的人都要被处死"。这句话本身就是真话，但将军随后说了一个更大的谎：他自己没有说谎。结果，因为说谎，他被自己处死了。`
    };
}

// 动态生成海龟汤
function generateDynamicTurtleSoup(puzzleType, era, difficulty) {
    const scenarios = {
        death: {
            ancient: {
                easy: "一位古代官员被发现死在自己的书房中，桌上放着一封未完成的遗书...",
                medium: "在古代深宫中，一位妃子被发现死在自己的寝宫中，现场没有任何打斗痕迹...",
                hard: "古代战场上一位将军的尸体旁有遗言，但他明明说不会写字..."
            },
            modern: {
                easy: "程序员小李被发现死在家中的电脑前，屏幕上的代码似乎还在运行...",
                medium: "现代办公室中一位高管被发现死在会议室里，门窗都从内部反锁...",
                hard: "现代医院里一位医生死在自己的办公室中，死因不明..."
            }
        },
        identity: {
            ancient: {
                easy: "在古代集市上出现了两个完全相同的人，连家人都无法分辨...",
                medium: "古代客栈里住着一个人，但所有客人都说他有两个...",
                hard: "古代皇室中出现了两个太子，连皇帝都无法区分..."
            },
            modern: {
                easy: "现代城市中出现了两个完全相同的双胞胎，但DNA检测显示不是亲兄弟...",
                medium: "现代公司里员工发现他们老板有两个，但两个都很真实...",
                hard: "现代机场出现了两个身份证相同的人，但两人都说自己是真的..."
            }
        },
        behavior: {
            ancient: {
                easy: "古代僧人每天都会在特定时间敲钟，但奇怪的是钟声总是从不同方向传来...",
                medium: "古代商人每天都会在同一个时间同一个地点消失一个时辰...",
                hard: "古代书生每天都会在晚上读书，但奇怪的是书页总是自动翻页..."
            },
            modern: {
                easy: "现代程序员每天凌晨都会准时重启电脑，但重启后所有程序都正常...",
                medium: "现代司机每天都会在同一时间同一地点停车20分钟...",
                hard: "现代作家每天都会在同一时间写作，但奇怪的是文档总是自动保存..."
            }
        },
        mystery: {
            ancient: {
                easy: "古代村落中每到月圆之夜就会发生奇怪的事情...",
                medium: "古代宫殿中某间房间总是传来奇怪的声音...",
                hard: "古代书房中的书总是神秘地消失和出现..."
            },
            modern: {
                easy: "现代办公楼中某间办公室总是自动开灯关灯...",
                medium: "现代住宅中某间房间总是有奇怪的气味...",
                hard: "现代实验室中的设备总是神秘地重新启动..."
            }
        },
        logic: {
            ancient: {
                easy: "古代智者说：我明天要说谎，但这句话本身是真话...",
                medium: "古代裁判说：下一个说话的人将获得奖励，但他自己说话了...",
                hard: "古代预言家说：我的预言将是假的，但这句话本身是真预言..."
            },
            modern: {
                easy: "现代程序员说：我的代码明天会有bug，但这句话本身是正确的...",
                medium: "现代律师说：下一个发言的当事人将败诉，但他自己发言了...",
                hard: "现代科学家说：我的研究结论是错误的，但这个结论本身是正确的..."
            }
        }
    };

    const clues = {
        easy: [
            "线索1：有一些明显的事实线索",
            "线索2：环境信息提供了重要提示",
            "线索3：时间线显示异常情况",
            "线索4：物证显示关键信息"
        ],
        medium: [
            "线索1：环境信息暗示关键信息",
            "线索2：时间线显示重要异常",
            "线索3：物证需要逻辑推理"
        ],
        hard: [
            "线索1：需要深度思考的隐含信息",
            "线索2：需要逻辑推理的关键线索"
        ]
    };

    const reasoning = {
        easy: "通过逐步分析线索，我们可以得出合理解释。线索1和2告诉我们基本情况，线索3和4提供了关键突破点。",
        medium: "需要通过逻辑推理和排除法来解决这个谜题。每个线索都指向特定的可能性，需要综合分析。",
        hard: "这是一个需要深度思考和复杂逻辑推理的谜题。每个线索都包含多重含义，需要仔细分析。"
    };

    const solution = {
        death: "通过分析线索，我们可以推断出死亡的真正原因和过程。每个异常现象背后都有合理的解释。",
        identity: "通过仔细分析身份相关信息，我们可以发现看似不可能的谜题背后的真相。",
        behavior: "通过分析行为模式和异常现象，我们可以理解看似不合理的行为背后的逻辑。",
        mystery: "通过分析神秘现象和异常事件，我们可以找出超自然现象背后的理性解释。",
        logic: "通过仔细分析逻辑悖论和矛盾，我们可以理解看似不可能的逻辑问题的真正含义。"
    };

    const scenario = scenarios[puzzleType][era][difficulty];
    const clueList = clues[difficulty];
    const reason = reasoning[difficulty];
    const answer = solution[puzzleType];

    return `## 🐢 海龟汤谜题

### 谜面（情境描述）
${scenario}

### 关键线索（${clueList.length}个）
${clueList.map((clue, index) => `${index + 1}. ${clue}`).join('\n')}

### 推理过程
${reason}

### 最终答案
${answer}

🎮 玩法提示：这是动态生成的海龟汤谜题，你可以和朋友一起尝试推理，享受逻辑思维的乐趣！`;
}