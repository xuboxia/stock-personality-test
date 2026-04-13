import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { ShareImageCard } from "./components/ShareImageCard";
import ShareImagePreviewModal from "./components/ShareImagePreviewModal";
import { SHARE_IMAGE_FILENAME, SHARE_TARGET_URL } from "./constants/share";

const STORAGE_KEY = "stock-persona-test-result-v1";
const COUNT_STORAGE_KEY = "stock-persona-test-completion-count-v1";
const LANGUAGE_STORAGE_KEY = "stock-persona-test-language-v1";

const DIMENSIONS = [
  { key: "rush", label: "上头速度", labelEn: "Impulse Speed", short: "上头", shortEn: "Impulse" },
  { key: "fomo", label: "踏空敏感", labelEn: "FOMO Sensitivity", short: "踏空", shortEn: "FOMO" },
  { key: "risk", label: "风险偏好", labelEn: "Risk Appetite", short: "风险", shortEn: "Risk" },
  { key: "discipline", label: "纪律程度", labelEn: "Discipline", short: "纪律", shortEn: "Rules" },
  { key: "patience", label: "耐心程度", labelEn: "Patience", short: "耐心", shortEn: "Patience" },
  { key: "contrarian", label: "逆向本能", labelEn: "Contrarian Instinct", short: "逆向", shortEn: "Contrarian" },
];

const CAMP_META = {
  冲锋派: {
    label: "冲锋派",
    labelEn: "Charge Camp",
    description: "你对热度、强度和节奏的感应更快，看到机会时更愿意先冲一步。",
    descriptionEn:
      "You react faster to heat, momentum and rhythm. Once the opportunity feels real, you would rather move first.",
    accent: "from-[#c6865e] to-[#9b5e43]",
  },
  防守派: {
    label: "防守派",
    labelEn: "Defense Camp",
    description: "你更在意节奏、验证和撤退路线，市场先证明自己，你才愿意给它机会。",
    descriptionEn:
      "You care more about timing, confirmation and exits. The market has to prove itself before you commit.",
    accent: "from-[#7d8d77] to-[#596453]",
  },
  观察派: {
    label: "观察派",
    labelEn: "Observer Camp",
    description: "你会先读情绪、看关系、看结构，市场在你眼里更像一个会说话的系统。",
    descriptionEn:
      "You read sentiment, relationships and structure first. To you, the market behaves like a system that speaks.",
    accent: "from-[#8a7d70] to-[#64584f]",
  },
  纠结派: {
    label: "纠结派",
    labelEn: "Inner Conflict Camp",
    description: "你不是没想法，而是想法太多。真到按键那一刻，常常是你和自己先打起来。",
    descriptionEn:
      "It is not that you have no view. You have too many. By the time you need to click, you are often debating yourself first.",
    accent: "from-[#b49364] to-[#8f6b3f]",
  },
};

const UI_TEXT = {
  zh: {
    langZh: "中文",
    langEn: "EN",
    appBadge: "测测你进 A 股像什么人",
    appTitle: "股市人格测试",
    appIntro:
      "有人一进市场就想冲，有人只想等确认，有人永远在复盘里最强。测测你在 A 股里，到底像什么人。",
    statQuestions: "16 道题",
    statPersonas: "16 种人格",
    statCamps: "4 个阵营",
    statShare: "支持分享截图",
    completionCount: (count) => `本机已完成测试 ${count} 次`,
    restoredIntro:
      "已恢复你上次的测试结果。你也可以直接重新测一遍，看今天的市场人格有没有变。",
    startTest: "开始测试",
    notAdviceTitle: "这不是投资建议工具",
    notAdviceBody:
      "它不是专业交易测评，也不负责告诉你该买什么。它只把你在市场里的情绪反应、风险偏好、节奏习惯和行为倾向，映射成一个更适合截图和传播的“市场人格”。",
    disclaimer: "本测试仅供娱乐，不构成任何投资建议。",
    questionProgress: (current, total) => `第 ${current} 题 / 共 ${total} 题`,
    questionHint: "市场里的下意识反应",
    previousQuestion: "回到上一题",
    campIs: "你的阵营：",
    mainResult: "主人格结果",
    campLabel: "所属阵营",
    summaryLabel: "一句总结",
    campDescriptionTitle: "阵营说明",
    restoredResult: "已从 localStorage 恢复上次结果。",
    dimensionSummaryTitle: "六维总结",
    whySectionTitle: "为什么会是这个人格",
    whyMatch: "为什么会是这个人格",
    behavior: "你的典型市场行为",
    weakness: "你的致命弱点",
    talent: "你的隐藏天赋",
    bestMarket: "你适合的市场状态",
    badMarket: "你不适合的市场状态",
    closeTypesTitle: "接近人格",
    closeTypesBody: "你不是单一型号，下面这两种人格也和你有明显重叠。",
    peopleTitle: "你像这些人身上的哪一面",
    peopleBody: "这只是行为气质的娱乐化类比，不是“你就是谁”。",
    peopleStory: "简短故事",
    peopleKeywords: "风格关键词",
    peopleHolding: "典型持有节奏",
    peopleRisk: "风险偏好",
    peopleLike: "你像他的哪一点",
    peopleUnlike: "你不像他的哪一点",
    peopleDisclaimer:
      "人物类比仅表示部分行为气质相似，不代表真实投资能力、历史业绩或完整风格一致。",
    shareTitle: "分享一下你的结果",
    shareBody: "这段文案就是给截图和转发用的。",
    generateShareImage: "生成分享图",
    generatingShareImage: "正在生成分享图…",
    sharePreviewTitle: "分享图预览",
    saveImage: "保存图片",
    close: "关闭",
    shareImageError: "分享图生成失败了，请稍后再试一次。",
    copyShare: "复制结果文案",
    copied: "已复制文案",
    restart: "重新测试",
    radarTitle: "六维股市人格图",
    radarBody: "你在关键市场倾向上的分布",
    toneVeryHigh: "很高",
    toneHigh: "偏高",
    toneMid: "中等",
    toneLow: "偏低",
    toneVeryLow: "很低",
  },
  en: {
    langZh: "中文",
    langEn: "EN",
    appBadge: "What Kind of Person Are You in the Stock Market?",
    appTitle: "Stock Market Persona Test",
    appIntro:
      "Some people want to charge in the second the market heats up. Some only move after confirmation. Some are unbeatable only in post-market review. Find out what kind of market character you are.",
    statQuestions: "16 questions",
    statPersonas: "16 personas",
    statCamps: "4 camps",
    statShare: "Made for screenshots",
    completionCount: (count) => `Completed on this device ${count} times`,
    restoredIntro:
      "Your last result has been restored. You can also retake the test and see whether today's market persona feels different.",
    startTest: "Start Test",
    notAdviceTitle: "Not an Investment Tool",
    notAdviceBody:
      "This is not a professional trading assessment and it does not tell you what to buy. It simply maps your emotional reactions, risk preference, timing habits and behavior patterns into a more shareable market persona.",
    disclaimer: "This test is for entertainment only and does not constitute investment advice.",
    questionProgress: (current, total) => `Question ${current} / ${total}`,
    questionHint: "Your market instinct",
    previousQuestion: "Back to previous question",
    campIs: "Your camp: ",
    mainResult: "Main persona",
    campLabel: "Camp",
    summaryLabel: "Quick read",
    campDescriptionTitle: "Camp summary",
    restoredResult: "Restored from localStorage.",
    dimensionSummaryTitle: "Six-Dimension Summary",
    whySectionTitle: "Why this persona fits you",
    whyMatch: "Why this fits",
    behavior: "Typical market behavior",
    weakness: "Fatal weakness",
    talent: "Hidden talent",
    bestMarket: "Best market state",
    badMarket: "Worst market state",
    closeTypesTitle: "Closest personas",
    closeTypesBody: "You are not a single model. These two personas also overlap with you a lot.",
    peopleTitle: "Which side of these real investors do you resemble?",
    peopleBody: "This is an entertainment-style temperament comparison, not a claim that you are actually that person.",
    peopleStory: "Short story",
    peopleKeywords: "Keywords",
    peopleHolding: "Typical holding rhythm",
    peopleRisk: "Risk appetite",
    peopleLike: "The part you resemble",
    peopleUnlike: "The part you do not resemble",
    peopleDisclaimer:
      "These comparisons only reflect partial behavioral similarities and do not imply similar real-world ability, track record or complete style.",
    shareTitle: "Share your result",
    shareBody: "This text is meant for screenshots and reposting.",
    generateShareImage: "Generate share image",
    generatingShareImage: "Generating share image...",
    sharePreviewTitle: "Share image preview",
    saveImage: "Save image",
    close: "Close",
    shareImageError: "Failed to generate the share image. Please try again.",
    copyShare: "Copy share text",
    copied: "Copied",
    restart: "Retake",
    radarTitle: "Six-Dimension Market Persona Chart",
    radarBody: "Your distribution across key market tendencies",
    toneVeryHigh: "Very high",
    toneHigh: "High",
    toneMid: "Medium",
    toneLow: "Low",
    toneVeryLow: "Very low",
  },
};

const PERSONAS = [
  {
    name: "天生韭菜",
    subtitle: "情绪一热，手就先替你表达态度",
    camp: "纠结派",
    oneLiner: "你不是不懂风险，你是每次都觉得这次可能真不一样。",
    description:
      "你对市场温度的感知很强，强到容易被它带着走。别人还在确认，你已经开始脑补下一段了。",
    whyMatch:
      "你更容易被热度和机会感推动，尤其在别人都在冲的时候，很难完全把自己按住。",
    typicalBehavior:
      "看到龙头加速会想跟，回撤时又想解释成洗盘；复盘总觉得问题出在执行，盘中又常常重演。",
    weakness:
      "最致命的不是看错，而是太容易在最热的时候把情绪当逻辑。",
    hiddenTalent:
      "你对市场活跃点的嗅觉其实不差，只要把情绪反应晚半拍，识别力会明显提升。",
    bestMarket: "主线明确、赚钱效应持续发酵的强趋势行情。",
    badMarket: "轮动混乱、假突破多、强弱切得很快的震荡市。",
    shareText:
      "测出来是天生韭菜。市场一热，我的判断会先变成参与冲动。不是没看过风险，是总觉得这次也许轮到我了。",
    scores: {
      rush: 8,
      fomo: 9,
      risk: 7,
      discipline: 2,
      patience: 2,
      contrarian: 3,
    },
    closeTypes: ["追涨冠军", "止盈困难户"],
    peopleMatches: ["92科比", "作手新一", "小鳄鱼"],
  },
  {
    name: "未来游资",
    subtitle: "还没成名，但出手时已经很像要去抢镜头的人",
    camp: "冲锋派",
    oneLiner: "你不是单纯冲动，你是对热度变化反应太快，而且真的愿意承担后果。",
    description:
      "你喜欢速度、确定性和位置共振的那一下。市场一旦把方向亮出来，你很难只做旁观者。",
    whyMatch:
      "你的上头速度和风险偏好都不低，但和纯情绪流不同的是，你多少还带着一点自己的执行框架。",
    typicalBehavior:
      "盯核心、等分歧、抢回流；要么不做，要做就尽量做最强的那一口。",
    weakness:
      "容易把速度当优势，也容易因为太相信自己的节奏，把回撤容忍度开得过大。",
    hiddenTalent:
      "你对市场选股逻辑的体感很强，只要继续补纪律，冲劲会慢慢变成风格。",
    bestMarket: "情绪共振、龙头明确、板块持续强化的进攻市。",
    badMarket: "一日游题材、核按钮频繁、强度持续断层的退潮市。",
    shareText:
      "测出来是未来游资。市场一热，手比脑子先准备好了。还没赚到大钱，但气质已经先到了。",
    scores: {
      rush: 9,
      fomo: 8,
      risk: 9,
      discipline: 6,
      patience: 3,
      contrarian: 4,
    },
    closeTypes: ["消息冲浪王", "追涨冠军"],
    peopleMatches: ["赵强（赵老哥）", "方新侠", "保罗·都铎·琼斯"],
  },
  {
    name: "基金经理",
    subtitle: "你更像在管净值，而不是在追段子",
    camp: "防守派",
    oneLiner: "你不是胆子小，你只是更在意确认和回撤管理。",
    description:
      "你天然会先想组合、节奏和确定性，不太容易为了某个短时热点就改掉自己的节奏。",
    whyMatch:
      "你的纪律和耐心比较稳定，对踏空不算特别敏感，更愿意在理解清楚以后出手。",
    typicalBehavior:
      "研究一阵子再下手，仓位分配比买卖点更重要；不爱用情绪解释一切。",
    weakness:
      "容易在极强情绪市场里显得慢半拍，等到全都看清楚了，赔率也被磨掉一截。",
    hiddenTalent:
      "你对风险收益比的平衡感不错，适合在噪音里守住节奏，不被市场牵着跑。",
    bestMarket: "慢牛、结构性行情、基本面和趋势能互相验证的环境。",
    badMarket: "纯情绪博弈、涨跌全看预期差和节奏抢跑的狂热阶段。",
    shareText:
      "测出来是基金经理。不是不想冲，是我天生更像先算回撤的人。市场可以热，我得先确定自己不失控。",
    scores: {
      rush: 2,
      fomo: 2,
      risk: 3,
      discipline: 8,
      patience: 8,
      contrarian: 5,
    },
    closeTypes: ["老股民", "纪律机器人"],
    peopleMatches: ["张磊", "李录", "雷·达里奥"],
  },
  {
    name: "老股民",
    subtitle: "你不是没见过大场面，你是见太多了",
    camp: "防守派",
    oneLiner: "你对市场的第一反应，往往不是激动，而是警惕。",
    description:
      "你看过的轮回够多，对热闹天然留有余地。别人看到机会，你先看到节奏会不会反噬。",
    whyMatch:
      "你的耐心、纪律和逆向本能都不低，典型特点不是猛，而是懂得什么时候少犯错。",
    typicalBehavior:
      "不轻易被新故事打动，会看量、看位置、看拥挤度；有时甚至宁愿错过也不愿乱上。",
    weakness:
      "容易因为太懂风险而显得保守，市场真走出来时，你的犹豫会让收益滞后。",
    hiddenTalent:
      "你对危险信号的识别很强，特别适合在别人上头的时候帮自己踩刹车。",
    bestMarket: "震荡结构市、分化市、从热到冷切换频繁的环境。",
    badMarket: "单边逼空、持续加速、强得不讲道理的情绪主升。",
    shareText:
      "测出来是老股民。别人看见的是机会，我先想的是这玩意儿会不会明天就翻脸。不是怂，是见得多了。",
    scores: {
      rush: 3,
      fomo: 3,
      risk: 4,
      discipline: 7,
      patience: 7,
      contrarian: 6,
    },
    closeTypes: ["基金经理", "空仓哲学家"],
    peopleMatches: ["炒股养家", "冯柳", "李嘉诚"],
  },
  {
    name: "追涨冠军",
    subtitle: "只相信已经被市场选出来的东西",
    camp: "冲锋派",
    oneLiner: "你不是喜欢追高，你是只相信已经赢过一轮的强者。",
    description:
      "你对强度和确认极度敏感。没有走出来的东西你懒得猜，已经走出来的东西你又很难不心动。",
    whyMatch:
      "你的踏空敏感度很高，宁愿买贵一点，也不愿错过一只真正被市场点名的票。",
    typicalBehavior:
      "喜欢跟最强，不爱提前埋伏；板块一旦加速，你会比平时更有行动力。",
    weakness:
      "最容易受伤的地方就是高潮接力，买点常常没问题，难的是情绪拐头时不恋战。",
    hiddenTalent:
      "你对强弱和趋势的体感很准，能快速识别谁是被市场选出来的对象。",
    bestMarket: "主线抱团、板块龙头不断超预期的强情绪期。",
    badMarket: "高标断板、情绪日内翻脸、强弱切换没有缓冲的阶段。",
    shareText:
      "测出来是追涨冠军。别人说高，我说这是市场盖章过的强。问题不在买得贵，问题在拐点来时我还想再信一次。",
    scores: {
      rush: 9,
      fomo: 10,
      risk: 8,
      discipline: 4,
      patience: 2,
      contrarian: 2,
    },
    closeTypes: ["未来游资", "消息冲浪王"],
    peopleMatches: ["小鳄鱼", "赵强（赵老哥）", "章建平"],
  },
  {
    name: "抄底艺术家",
    subtitle: "你对下跌的第一反应，是看看有没有人错杀了价值",
    camp: "观察派",
    oneLiner: "你不是单纯爱逆着来，你是总觉得最舒服的位置不该出现在最热的时候。",
    description:
      "你对拥挤和高潮天生警惕，更喜欢在别人不太想看时找性价比，追求舒服的位置和反身机会。",
    whyMatch:
      "你的逆向本能明显更强，愿意承受短期不被理解，去换一个你觉得更划算的起点。",
    typicalBehavior:
      "喜欢等分歧、等恐慌、等错杀；不太爱追已经跑出来的东西。",
    weakness:
      "最容易错在接太早，市场还没止跌，你已经先把勇气交出去了。",
    hiddenTalent:
      "你有捕捉预期差和情绪反转的天赋，一旦耐心够，常能拿到更优的赔率。",
    bestMarket: "杀跌过头后的修复段、分歧转一致、恐慌后回暖的行情。",
    badMarket: "持续阴跌、逻辑塌陷、越跌越便宜但一直更便宜的环境。",
    shareText:
      "测出来是抄底艺术家。我不太喜欢最热的地方，我更喜欢大家都不舒服时，看看有没有被错杀的机会。",
    scores: {
      rush: 4,
      fomo: 2,
      risk: 6,
      discipline: 5,
      patience: 6,
      contrarian: 10,
    },
    closeTypes: ["补仓艺术家", "情绪观察员"],
    peopleMatches: ["索罗斯", "冯柳", "约翰·保尔森"],
  },
  {
    name: "模拟盘股神",
    subtitle: "脑内收益曲线总比实盘更完整",
    camp: "观察派",
    oneLiner: "你不是没逻辑，你是实盘一按键，逻辑就开始和情绪打架。",
    description:
      "你很会推演、很会拆结构，复盘时经常思路清晰，可一旦带上真仓位，动作会比想法保守得多。",
    whyMatch:
      "你的纪律不算低，风险偏好也不算高，说明你并不盲冲，但会在实战里放大每个决定的心理重量。",
    typicalBehavior:
      "盘后复盘头头是道，盘中却容易想太多；看得见机会，按键时又怕节奏不对。",
    weakness:
      "最容易被自己卡住，想要完美确认，最后把最好的出手窗口让给了别人。",
    hiddenTalent:
      "你对结构、逻辑和节奏的复盘能力很强，适合把经验沉淀成可复用的框架。",
    bestMarket: "结构清晰、节奏有层次、复盘能持续提升胜率的环境。",
    badMarket: "节奏极快、靠下意识抢反应、不给你思考时间的行情。",
    shareText:
      "测出来是模拟盘股神。盘后我是市场顾问，盘中我是风险委员会。想得很完整，真到下单时就开始尊重波动了。",
    scores: {
      rush: 3,
      fomo: 5,
      risk: 4,
      discipline: 6,
      patience: 5,
      contrarian: 4,
    },
    closeTypes: ["键盘分析师", "基金经理"],
    peopleMatches: ["芒格", "爱德华·索普", "雷·达里奥"],
  },
  {
    name: "纪律机器人",
    subtitle: "情绪很吵，但你的流程更大声",
    camp: "防守派",
    oneLiner: "你不是冷血，你只是比大多数人更愿意服从规则。",
    description:
      "你不太依赖盘中灵感，更相信条件、计划和动作的一致性。市场热不热，会影响你，但不应该替你做决定。",
    whyMatch:
      "你的纪律程度非常高，同时上头和踏空都不算特别夸张，这是一种典型的流程派人格。",
    typicalBehavior:
      "设条件、看触发、按规则做；该止损时不拖泥带水，该空仓时也能接受无聊。",
    weakness:
      "容易在极度情绪化的行情里错过最暴力的一段，因为你不爱做没有历史样本支撑的事。",
    hiddenTalent:
      "你最大的优势不是某一次神来之笔，而是长期把错误率压下去的能力。",
    bestMarket: "有规律可循、节奏反复出现、系统能稳定执行的环境。",
    badMarket: "风格突变、题材一日三换、靠即兴反应抢速度的混沌市。",
    shareText:
      "测出来是纪律机器人。市场可以疯，但流程不能乱。别人追的是刺激，我追的是一致性。",
    scores: {
      rush: 2,
      fomo: 2,
      risk: 4,
      discipline: 10,
      patience: 7,
      contrarian: 5,
    },
    closeTypes: ["基金经理", "空仓哲学家"],
    peopleMatches: ["詹姆斯·西蒙斯", "爱德华·索普", "格雷厄姆"],
  },
  {
    name: "情绪观察员",
    subtitle: "你在看盘，也在看所有人怎么一起看盘",
    camp: "观察派",
    oneLiner: "你不是慢，你是在先判断市场现在有没有在说真话。",
    description:
      "你对市场情绪的细微变化很敏感，不一定第一时间下场，但总会先观察风往哪边吹、吹得真不真。",
    whyMatch:
      "你的纪律和逆向本能都偏高，说明你会把情绪当线索，而不是当命令。",
    typicalBehavior:
      "先读盘面情绪，再决定自己站哪一边；很擅长发现热度变化背后的群体心理。",
    weakness:
      "观察太久会失去最好的一击，容易变成看得明白、出手偏慢。",
    hiddenTalent:
      "你对市场语言的理解能力很强，能在别人只看涨跌时，看见资金在表达什么。",
    bestMarket: "节奏有层次、情绪可读、强弱和预期博弈明显的行情。",
    badMarket: "无主线、无信号、全靠随机消息打断结构的无序阶段。",
    shareText:
      "测出来是情绪观察员。我不急着成为市场的一部分，我更像先看看市场今天在演哪一出。",
    scores: {
      rush: 2,
      fomo: 3,
      risk: 3,
      discipline: 7,
      patience: 6,
      contrarian: 7,
    },
    closeTypes: ["抄底艺术家", "键盘分析师"],
    peopleMatches: ["炒股养家", "雷·达里奥", "吉姆·查诺斯"],
  },
  {
    name: "纸上巴菲特",
    subtitle: "能看三年，常常看不过三天波动",
    camp: "纠结派",
    oneLiner: "你不是不会格局，你是常常在现实波动面前被理想自己打脸。",
    description:
      "你相信长期、相信逻辑、也能说出耐心的重要，但真拿在手里时，市场的每次波动都像在考你。",
    whyMatch:
      "你的耐心愿望很高，踏空不敏感，说明你认同长期框架；但纪律和行动的一致性不总是跟得上。",
    typicalBehavior:
      "研究时像长期投资者，盘中又容易盯短线波动；嘴上说拿住，心里每天都在问还对不对。",
    weakness:
      "容易把长期当成情绪缓冲区，逻辑和借口之间的边界有时会被自己模糊掉。",
    hiddenTalent:
      "你对公司、逻辑和长周期故事的理解欲望很强，只要能减少自我拉扯，定力会成为优势。",
    bestMarket: "中长期逻辑顺畅、波动可承受、能给耐心回报的趋势行情。",
    badMarket: "大开大合、消息驱动、短线情绪凌驾一切的高波动市场。",
    shareText:
      "测出来是纸上巴菲特。理念上我已经长期主义了，实盘里还在练怎么别被三天波动打回短线人格。",
    scores: {
      rush: 1,
      fomo: 1,
      risk: 3,
      discipline: 6,
      patience: 10,
      contrarian: 6,
    },
    closeTypes: ["空仓哲学家", "基金经理"],
    peopleMatches: ["巴菲特", "李录", "芒格"],
  },
  {
    name: "消息冲浪王",
    subtitle: "风一吹你就知道哪边先热",
    camp: "冲锋派",
    oneLiner: "你不是只看消息，你是特别擅长在消息里闻到节奏变化。",
    description:
      "你对事件、预期差和风口极其敏感，市场一有异动，你会很快去判断它是不是下一波共识。",
    whyMatch:
      "你的上头速度和踏空敏感度都比较高，说明你很怕自己慢一步，错过市场刚点火的窗口。",
    typicalBehavior:
      "盯消息、盯异动、盯板块联动；动作往往快于大多数人，尤其在突发题材上。",
    weakness:
      "最容易在消息密集时过度交易，把短暂噪音误认成持续主线。",
    hiddenTalent:
      "你对新叙事的接收速度快，适合第一时间识别市场的集体注意力在哪里。",
    bestMarket: "事件催化密集、主题轮动快、预期差能迅速兑现的市场。",
    badMarket: "消息很多但持续性差、隔日即兑现、情绪无法接力的环境。",
    shareText:
      "测出来是消息冲浪王。风还没完全起来，我已经先去找板块了。问题不是不敏锐，是有时候太敏锐。",
    scores: {
      rush: 8,
      fomo: 8,
      risk: 7,
      discipline: 3,
      patience: 2,
      contrarian: 3,
    },
    closeTypes: ["未来游资", "追涨冠军"],
    peopleMatches: ["方新侠", "作手新一", "大卫·泰珀"],
  },
  {
    name: "格局大师",
    subtitle: "真看好了，就想给它多一点时间",
    camp: "冲锋派",
    oneLiner: "你不是拿得久，你是总想拿到最像样的那一段。",
    description:
      "你不是最容易激动的那类人，但一旦认可逻辑，就愿意给趋势更多空间，不轻易被日内波动吓掉。",
    whyMatch:
      "你的风险偏好不低，同时耐心也比典型冲锋派高，说明你不是只想抢第一口，还想吃更完整的一段。",
    typicalBehavior:
      "对看中的方向会更愿意给时间，喜欢拿逻辑、情绪和趋势一起验证，而不是一有浮盈就跑。",
    weakness:
      "格局感一旦过头，容易把该兑现的利润又交回去，把信念和执念混在一起。",
    hiddenTalent:
      "你对趋势延续性的判断不错，一旦方向做对，往往比别人更能拿住主升段。",
    bestMarket: "趋势清晰、主线延续、强者恒强的中段加速行情。",
    badMarket: "来回抽脸、反复轮动、主线一天一换的结构破碎市。",
    shareText:
      "测出来是格局大师。我不是非要多拿一天，我只是总觉得真正的主升，不该只赚到开头那点情绪。",
    scores: {
      rush: 6,
      fomo: 4,
      risk: 7,
      discipline: 5,
      patience: 8,
      contrarian: 4,
    },
    closeTypes: ["未来游资", "止盈困难户"],
    peopleMatches: ["章建平", "巴菲特", "比尔·阿克曼"],
  },
  {
    name: "键盘分析师",
    subtitle: "图、逻辑、结构都能拆，真正难的是出手那一下",
    camp: "观察派",
    oneLiner: "你不是看不懂，只是太容易在动手前把自己再分析一遍。",
    description:
      "你善于总结、表达和梳理，看盘时会自然生成逻辑框架，但实盘往往没有复盘时那么果断。",
    whyMatch:
      "你的风险偏好偏低，纪律和逆向中等偏上，说明你更擅长分析环境，而不是在最乱的时候抢反应。",
    typicalBehavior:
      "擅长画图、讲逻辑、拆节奏，常常能把一笔交易说得很明白，但动作不一定和表达一样锋利。",
    weakness:
      "最容易被分析本身困住，越想证明自己有道理，越可能错过最需要简单执行的时刻。",
    hiddenTalent:
      "你的框架整理能力很强，适合做自己的系统文档和复盘数据库。",
    bestMarket: "结构清晰、可归纳、能通过复盘不断修正认知的环境。",
    badMarket: "纯靠反应和胆量、不给时间解释的极端快节奏市场。",
    shareText:
      "测出来是键盘分析师。思路我有，图我也能画，难的是盘中别再给自己开第二场评审会。",
    scores: {
      rush: 2,
      fomo: 4,
      risk: 2,
      discipline: 6,
      patience: 5,
      contrarian: 5,
    },
    closeTypes: ["模拟盘股神", "情绪观察员"],
    peopleMatches: ["格雷厄姆", "雷·达里奥", "吉姆·查诺斯"],
  },
  {
    name: "空仓哲学家",
    subtitle: "你对不出手这件事，有自己的高级解释",
    camp: "防守派",
    oneLiner: "你不是不想赚钱，你只是觉得很多亏损都可以通过不动来避免。",
    description:
      "你把空仓也视作一种主动选择。别人觉得无聊，你会把它理解成等待赔率、等待节奏、等待真正值得的信号。",
    whyMatch:
      "你的纪律和耐心都很高，上头和踏空都低，说明你能接受不参与，而不是被迫错过。",
    typicalBehavior:
      "市场不清楚就不做，别人忙着找机会时，你更像在筛掉大部分不值得的波动。",
    weakness:
      "容易把谨慎一路升级成过度保守，最终错过本来属于你的出手机会。",
    hiddenTalent:
      "你对节奏的敬畏感很强，能在混乱阶段保住状态，为真正的机会留下手感和资金。",
    bestMarket: "震荡无序、亏钱效应扩散、需要大量放弃交易的环境。",
    badMarket: "强趋势主升、给了信号还一路犹豫的顺风阶段。",
    shareText:
      "测出来是空仓哲学家。不是没机会，是大多数机会在我这里还没通过答辩。空着不一定无聊，但确实容易错过烟花。",
    scores: {
      rush: 1,
      fomo: 1,
      risk: 2,
      discipline: 9,
      patience: 9,
      contrarian: 7,
    },
    closeTypes: ["纸上巴菲特", "纪律机器人"],
    peopleMatches: ["李嘉诚", "格雷厄姆", "吉姆·查诺斯"],
  },
  {
    name: "止盈困难户",
    subtitle: "会买，也会拿，就是卖点常常和自己商量太久",
    camp: "纠结派",
    oneLiner: "你不是不会卖，你是每次想卖的时候，脑子里都会冒出再等等看。",
    description:
      "你不一定冲动买，但一旦拿到盈利，就容易开始和市场、和自己讨价还价，想把更大的那段也留下。",
    whyMatch:
      "你的耐心中等偏高，但纪律不够稳，这种组合很容易在盈利管理上拖泥带水。",
    typicalBehavior:
      "浮盈时想锁，真卖又怕卖飞；回撤后又会给自己解释成洗盘，来回反复。",
    weakness:
      "最容易把正确变得不完整，本来该漂亮的一笔，最后可能因为不舍而打折。",
    hiddenTalent:
      "你并不缺持股能力，缺的是把规则放到卖点上。只要补上，收益曲线会顺很多。",
    bestMarket: "趋势延续、给人持有信心、回撤相对温和的上涨环境。",
    badMarket: "冲高回落快、分时反复诱导、利润回吐极快的震荡市。",
    shareText:
      "测出来是止盈困难户。赚钱的时候我不是不想走，我只是总觉得它也许还能再懂我一点。然后利润先走了。",
    scores: {
      rush: 5,
      fomo: 5,
      risk: 4,
      discipline: 3,
      patience: 6,
      contrarian: 3,
    },
    closeTypes: ["格局大师", "天生韭菜"],
    peopleMatches: ["比尔·阿克曼", "章建平", "巴菲特"],
  },
  {
    name: "补仓艺术家",
    subtitle: "下跌在你眼里，不只是风险，也像一次再谈判",
    camp: "纠结派",
    oneLiner: "你不是倔，你是很难承认自己第一次出手的节奏可能错了。",
    description:
      "你对价格的敏感高于对市场情绪的敏感，跌下来时你更容易想到优化成本，而不是先怀疑方向。",
    whyMatch:
      "你的逆向本能和耐心都不低，说明你愿意和市场反着来，但纪律不足时就容易变成和风险硬扛。",
    typicalBehavior:
      "跌了先找理由、再找位置、再找加仓依据；只要逻辑没彻底坏，就总想再给它一次机会。",
    weakness:
      "最容易把纠错做成加码，把承认判断偏差的机会拖成更大的仓位风险。",
    hiddenTalent:
      "你有在恐慌中保持冷静的能力，若能把补仓变成条件化动作，会很有战斗力。",
    bestMarket: "急跌后的修复、错杀反弹、波动大但逻辑还在的结构市。",
    badMarket: "趋势性下跌、基本面塌陷、越补越弱的单边退潮。",
    shareText:
      "测出来是补仓艺术家。跌下来我第一反应不是认输，是看看成本还能不能优化。艺术感很强，风险感也得跟上。",
    scores: {
      rush: 4,
      fomo: 3,
      risk: 6,
      discipline: 3,
      patience: 7,
      contrarian: 8,
    },
    closeTypes: ["抄底艺术家", "止盈困难户"],
    peopleMatches: ["冯柳", "约翰·保尔森", "卡尔·伊坎"],
  },
];

const PEOPLE = [
  {
    name: "许翔",
    shortLabel: "情绪短线代表人物",
    story:
      "他以极强的短线攻击性和对涨停板情绪的把握而出名，属于把节奏感和执行力都拉满的类型。",
    keywords: ["情绪强度", "短线攻击", "节奏极快"],
    holdingPeriod: "数日到数周",
    riskLevel: "极高",
    profileVector: {
      rush: 10,
      fomo: 8,
      risk: 10,
      discipline: 8,
      patience: 3,
      contrarian: 4,
    },
    likePoint: "你更像他那种看到机会就敢把动作做实的冲劲。",
    unlikePoint: "你不像他那种极致强硬的执行密度，也不代表真实能力接近。",
  },
  {
    name: "赵强（赵老哥）",
    shortLabel: "龙头接力感很强",
    story:
      "以围绕龙头和强势股展开交易而被熟知，典型特点是对市场强弱切换和主线辨识度很敏锐。",
    keywords: ["龙头接力", "强者恒强", "情绪识别"],
    holdingPeriod: "数日到数周",
    riskLevel: "高",
    profileVector: {
      rush: 9,
      fomo: 8,
      risk: 9,
      discipline: 7,
      patience: 4,
      contrarian: 4,
    },
    likePoint: "你更像他那种只愿意跟被市场选出来的强者站在一起的劲。",
    unlikePoint: "你不像他那种成熟的交易体系和实战经验，这里只是行为气质类比。",
  },
  {
    name: "章建平",
    shortLabel: "大开大合的趋势派气场",
    story:
      "市场讨论他时，往往会提到资金体量、趋势段的把握和持有阶段中的承受力。",
    keywords: ["趋势推进", "持有格局", "进攻性"],
    holdingPeriod: "数日到数月",
    riskLevel: "高",
    profileVector: {
      rush: 8,
      fomo: 7,
      risk: 9,
      discipline: 6,
      patience: 5,
      contrarian: 5,
    },
    likePoint: "你更像他身上那种做对方向后愿意把仓位和时间一起押上去的气质。",
    unlikePoint: "你不像他那种级别的承压能力和完整经验，别把娱乐测试当成业绩对照。",
  },
  {
    name: "方新侠",
    shortLabel: "热点转换时的快手型",
    story:
      "常被拿来代表对热点、题材和市场即时情绪变化有很强体感的一类选手。",
    keywords: ["热点切换", "快节奏", "题材敏感"],
    holdingPeriod: "数日到两周",
    riskLevel: "高",
    profileVector: {
      rush: 8,
      fomo: 7,
      risk: 8,
      discipline: 6,
      patience: 4,
      contrarian: 4,
    },
    likePoint: "你更像他那种对市场注意力流向非常敏感的能力。",
    unlikePoint: "你不像他可能具备的连续执行经验，这里只在说部分行为倾向。",
  },
  {
    name: "陈小群",
    shortLabel: "新生代情绪弹性选手",
    story:
      "被很多人当作新生代高弹性风格的代表，突出特点是对节奏、热度和市场反馈的快速反应。",
    keywords: ["弹性", "快速反应", "高情绪贝塔"],
    holdingPeriod: "数日",
    riskLevel: "高",
    profileVector: {
      rush: 9,
      fomo: 8,
      risk: 8,
      discipline: 5,
      patience: 3,
      contrarian: 3,
    },
    likePoint: "你更像他那种看到热度时不太想慢半拍的状态。",
    unlikePoint: "你不像他那种成熟资金博弈经验，别把这理解成真实风格映射。",
  },
  {
    name: "作手新一",
    shortLabel: "对情绪周期很敏感",
    story:
      "常被视为情绪交易语境里的代表人物之一，市场热度变化时动作通常不会太慢。",
    keywords: ["情绪周期", "快节奏", "热点嗅觉"],
    holdingPeriod: "数日",
    riskLevel: "高",
    profileVector: {
      rush: 9,
      fomo: 9,
      risk: 8,
      discipline: 5,
      patience: 3,
      contrarian: 3,
    },
    likePoint: "你更像他那种一旦感到热度拐点就会准备出手的敏感。",
    unlikePoint: "你不像他那种高频实战的熟练度，这里只是娱乐向彩蛋。",
  },
  {
    name: "小鳄鱼",
    shortLabel: "强势股偏好明显",
    story:
      "常被归类到偏强势股、偏进攻节奏的人群里，典型气质是愿意围绕强者做交易。",
    keywords: ["强势股", "进攻", "顺势"],
    holdingPeriod: "数日到两周",
    riskLevel: "高",
    profileVector: {
      rush: 8,
      fomo: 8,
      risk: 8,
      discipline: 6,
      patience: 4,
      contrarian: 4,
    },
    likePoint: "你更像他身上那种对强势反馈更有信心的状态。",
    unlikePoint: "你不像他可能拥有的执行强度和资金体量，这不是能力等号。",
  },
  {
    name: "92科比",
    shortLabel: "热度感应器体质",
    story:
      "在情绪和热点风格的讨论里，他常被视为对市场热度极其敏感的一类代表。",
    keywords: ["热点追踪", "高敏感", "情绪反应快"],
    holdingPeriod: "数日",
    riskLevel: "高",
    profileVector: {
      rush: 9,
      fomo: 9,
      risk: 8,
      discipline: 4,
      patience: 3,
      contrarian: 3,
    },
    likePoint: "你更像他那种热度一升温就很难完全无动于衷的体质。",
    unlikePoint: "你不像他对应的完整风格和历史表现，这里只是局部气质相似。",
  },
  {
    name: "孙国栋",
    shortLabel: "趋势与纪律兼顾",
    story:
      "市场讨论他的风格时，往往会提到对趋势机会的跟随，以及执行层面的相对稳定。",
    keywords: ["趋势跟随", "执行稳定", "节奏感"],
    holdingPeriod: "数周到数月",
    riskLevel: "中高",
    profileVector: {
      rush: 7,
      fomo: 6,
      risk: 7,
      discipline: 7,
      patience: 5,
      contrarian: 4,
    },
    likePoint: "你更像他那种既想做趋势，又不完全放弃纪律的平衡感。",
    unlikePoint: "你不像他那种成熟的系统和经验积累，这里只做娱乐类比。",
  },
  {
    name: "炒股养家",
    shortLabel: "情绪与节奏的观察派",
    story:
      "很多人提到他时，会先想到对市场情绪、风险控制和交易节奏的理解，而不只是单一手法。",
    keywords: ["情绪理解", "节奏控制", "风险意识"],
    holdingPeriod: "数日到数周",
    riskLevel: "中高",
    profileVector: {
      rush: 7,
      fomo: 5,
      risk: 7,
      discipline: 8,
      patience: 6,
      contrarian: 5,
    },
    likePoint: "你更像他那种先读懂市场情绪，再决定自己要不要参与的感觉。",
    unlikePoint: "你不像他那种经过长周期验证的交易经验和稳定性。",
  },
  {
    name: "张磊",
    shortLabel: "成长与长期视角",
    story:
      "常被视作长期主义和成长投资语境里的代表人物，强调时间、认知和赔率的结合。",
    keywords: ["长期主义", "成长", "耐心"],
    holdingPeriod: "数月到数年",
    riskLevel: "中",
    profileVector: {
      rush: 2,
      fomo: 2,
      risk: 5,
      discipline: 8,
      patience: 10,
      contrarian: 5,
    },
    likePoint: "你更像他那种愿意把视角拉长，不被短线噪音轻易带跑的气质。",
    unlikePoint: "你不像他那种长期研究深度与资源条件，别把娱乐类比当专业判断。",
  },
  {
    name: "李录",
    shortLabel: "价值与定力感",
    story:
      "他的名字经常和长期、价值、理解能力圈以及耐心等待联系在一起。",
    keywords: ["价值", "定力", "长期框架"],
    holdingPeriod: "多年",
    riskLevel: "中",
    profileVector: {
      rush: 1,
      fomo: 1,
      risk: 4,
      discipline: 8,
      patience: 10,
      contrarian: 7,
    },
    likePoint: "你更像他那种不太被短期热闹影响、愿意等逻辑兑现的定力。",
    unlikePoint: "你不像他那种长期投资视角的完整体系，这里只说行为气质的一小部分。",
  },
  {
    name: "冯柳",
    shortLabel: "逆向里带现实感",
    story:
      "常被提及的是逆向思考、对市场预期差的重视，以及在分歧中寻找价值的倾向。",
    keywords: ["逆向", "预期差", "耐心"],
    holdingPeriod: "数月到数年",
    riskLevel: "中高",
    profileVector: {
      rush: 3,
      fomo: 2,
      risk: 6,
      discipline: 7,
      patience: 8,
      contrarian: 8,
    },
    likePoint: "你更像他那种愿意在分歧和被忽视处找机会的气质。",
    unlikePoint: "你不像他那种研究深度和耐心级别，这里不是能力映射。",
  },
  {
    name: "李嘉诚",
    shortLabel: "极稳的风险意识",
    story:
      "大众语境里，他更像一种稳、慢、先看安全边界的象征，而不是追逐市场热度的人。",
    keywords: ["稳健", "安全边界", "长期"],
    holdingPeriod: "多年",
    riskLevel: "低",
    profileVector: {
      rush: 1,
      fomo: 1,
      risk: 3,
      discipline: 9,
      patience: 10,
      contrarian: 6,
    },
    likePoint: "你更像他那种宁可慢一点，也要先保证自己不乱的气质。",
    unlikePoint: "你不像他那种资源、产业判断和长期经营能力，这里只是娱乐化参考。",
  },
  {
    name: "巴菲特",
    shortLabel: "长期主义最著名的脸",
    story:
      "他的故事几乎等同于长期主义、能力圈和耐心等待，不靠热闹赢，而靠时间放大判断。",
    keywords: ["长期主义", "价值", "能力圈"],
    holdingPeriod: "多年",
    riskLevel: "中",
    profileVector: {
      rush: 1,
      fomo: 1,
      risk: 4,
      discipline: 9,
      patience: 10,
      contrarian: 6,
    },
    likePoint: "你更像他那种不急着跟随市场噪音、愿意等更高确定性的气质。",
    unlikePoint: "你不像他那种长期复利体系和历史业绩，这里不是人物身份测试。",
  },
  {
    name: "芒格",
    shortLabel: "理性和框架感很强",
    story:
      "他代表的不只是长期持有，更是一种重视思维模型、少做错事的理性气质。",
    keywords: ["理性", "框架", "少犯错"],
    holdingPeriod: "多年",
    riskLevel: "中",
    profileVector: {
      rush: 1,
      fomo: 1,
      risk: 4,
      discipline: 9,
      patience: 10,
      contrarian: 7,
    },
    likePoint: "你更像他那种先用框架过滤世界，再决定要不要下注的气质。",
    unlikePoint: "你不像他那种超长周期积累的认知体系，这里只是部分行为相似。",
  },
  {
    name: "格雷厄姆",
    shortLabel: "安全边际型人格",
    story:
      "提到他，很多人会想到安全边际、规则、估值和在热闹之外守住理性。",
    keywords: ["安全边际", "规则", "逆向"],
    holdingPeriod: "数月到数年",
    riskLevel: "低到中",
    profileVector: {
      rush: 1,
      fomo: 1,
      risk: 3,
      discipline: 10,
      patience: 9,
      contrarian: 8,
    },
    likePoint: "你更像他那种先求不犯大错，再谈赚钱效率的气质。",
    unlikePoint: "你不像他那种严谨到体系化的投资方法，这里只做娱乐类比。",
  },
  {
    name: "詹姆斯·西蒙斯",
    shortLabel: "系统派的浪漫",
    story:
      "他常被视为量化和系统交易的象征，强调模型、纪律和重复执行，而不是临场情绪。",
    keywords: ["量化", "系统", "纪律"],
    holdingPeriod: "多周期混合",
    riskLevel: "中高",
    profileVector: {
      rush: 2,
      fomo: 1,
      risk: 6,
      discipline: 10,
      patience: 6,
      contrarian: 5,
    },
    likePoint: "你更像他那种相信流程、相信规则而不太相信临场热血的部分。",
    unlikePoint: "你不像他那种模型能力和组织体系，这里不是技术水平对比。",
  },
  {
    name: "爱德华·索普",
    shortLabel: "概率和纪律感很强",
    story:
      "无论在赌博还是市场语境里，他都代表着概率优势、系统约束和对风险的精密处理。",
    keywords: ["概率", "风控", "系统"],
    holdingPeriod: "策略驱动",
    riskLevel: "中",
    profileVector: {
      rush: 1,
      fomo: 1,
      risk: 5,
      discipline: 10,
      patience: 7,
      contrarian: 6,
    },
    likePoint: "你更像他那种先算赔率和边界，再决定要不要下手的气质。",
    unlikePoint: "你不像他那种数学和系统能力，这里只是行为风格的附加彩蛋。",
  },
  {
    name: "雷·达里奥",
    shortLabel: "宏观框架型观察者",
    story:
      "他常被视为擅长从系统、周期和宏观结构理解市场的人，而不是只盯着单一价格波动。",
    keywords: ["宏观", "系统", "周期"],
    holdingPeriod: "数周到数年",
    riskLevel: "中",
    profileVector: {
      rush: 3,
      fomo: 2,
      risk: 5,
      discipline: 9,
      patience: 8,
      contrarian: 7,
    },
    likePoint: "你更像他那种总想先理解系统怎么运转，再去判断动作的气质。",
    unlikePoint: "你不像他那种宏观研究深度和组织能力，别把娱乐测试当成专业评价。",
  },
  {
    name: "索罗斯",
    shortLabel: "高弹性逆向交易象征",
    story:
      "他经常被提到的是宏观视角、反身性思维，以及在关键节点上大幅下注的勇气。",
    keywords: ["宏观", "反身性", "大仓位"],
    holdingPeriod: "数周到数月",
    riskLevel: "高",
    profileVector: {
      rush: 7,
      fomo: 5,
      risk: 9,
      discipline: 7,
      patience: 5,
      contrarian: 8,
    },
    likePoint: "你更像他那种在关键分歧点敢逆着共识下注的气质。",
    unlikePoint: "你不像他那种宏观视野和大级别判断，这里只是局部行为投影。",
  },
  {
    name: "保罗·都铎·琼斯",
    shortLabel: "趋势和风控并重",
    story:
      "他常被视为既敢做趋势、又极重视风险控制的宏观交易代表。",
    keywords: ["趋势", "风控", "宏观"],
    holdingPeriod: "数日到数月",
    riskLevel: "高",
    profileVector: {
      rush: 8,
      fomo: 5,
      risk: 8,
      discipline: 8,
      patience: 4,
      contrarian: 6,
    },
    likePoint: "你更像他那种有进攻性，但不是纯热血，而是带着边界意识去冲的感觉。",
    unlikePoint: "你不像他那种经过长期验证的交易体系和经验储备。",
  },
  {
    name: "大卫·泰珀",
    shortLabel: "事件与赔率感兼具",
    story:
      "市场谈到他时，常会提到对宏观、政策和赔率变化的敏锐把握，以及敢于下注的特征。",
    keywords: ["赔率", "事件驱动", "宏观敏感"],
    holdingPeriod: "数周到数月",
    riskLevel: "高",
    profileVector: {
      rush: 6,
      fomo: 4,
      risk: 8,
      discipline: 7,
      patience: 6,
      contrarian: 6,
    },
    likePoint: "你更像他那种看到赔率变化就会开始认真考虑出手的气质。",
    unlikePoint: "你不像他那种宏观资源和实战级别，这里只是娱乐化投射。",
  },
  {
    name: "约翰·保尔森",
    shortLabel: "大分歧下注型",
    story:
      "他经常和在大分歧中押注、等待市场慢慢验证判断联系在一起。",
    keywords: ["分歧下注", "事件驱动", "耐心"],
    holdingPeriod: "数月到数年",
    riskLevel: "高",
    profileVector: {
      rush: 5,
      fomo: 3,
      risk: 9,
      discipline: 6,
      patience: 7,
      contrarian: 7,
    },
    likePoint: "你更像他那种敢在别人没完全看懂时先站队的逆向气质。",
    unlikePoint: "你不像他那种大级别判断能力和历史级机会把握，这里只是彩蛋参考。",
  },
  {
    name: "卡尔·伊坎",
    shortLabel: "强势推动型",
    story:
      "他常被放在激进、强势、愿意推动变化的一类人物里，不是温和等待型。",
    keywords: ["激进", "推动变化", "立场鲜明"],
    holdingPeriod: "数月到数年",
    riskLevel: "高",
    profileVector: {
      rush: 5,
      fomo: 3,
      risk: 8,
      discipline: 7,
      patience: 7,
      contrarian: 8,
    },
    likePoint: "你更像他那种一旦认定方向，就不太愿意轻轻放过的强硬感。",
    unlikePoint: "你不像他那种现实世界中的资源和推动力，这里只是部分气质相似。",
  },
  {
    name: "比尔·阿克曼",
    shortLabel: "高信念表达型",
    story:
      "他往往和高信念、公开表达、愿意为自己的判断承受波动联系在一起。",
    keywords: ["高信念", "表达欲", "承压"],
    holdingPeriod: "数月到数年",
    riskLevel: "高",
    profileVector: {
      rush: 5,
      fomo: 4,
      risk: 8,
      discipline: 6,
      patience: 8,
      contrarian: 6,
    },
    likePoint: "你更像他那种一旦相信逻辑，就想把整段都拿明白的气质。",
    unlikePoint: "你不像他那种真实持仓能力和研究深度，这里只是局部人格类比。",
  },
  {
    name: "吉姆·查诺斯",
    shortLabel: "怀疑主义很重",
    story:
      "他往往被视为擅长从相反方向看问题、敢于怀疑主流叙事的一类代表。",
    keywords: ["怀疑主义", "逆向", "风险识别"],
    holdingPeriod: "数周到数月",
    riskLevel: "中高",
    profileVector: {
      rush: 3,
      fomo: 1,
      risk: 7,
      discipline: 8,
      patience: 7,
      contrarian: 9,
    },
    likePoint: "你更像他那种看到共识时，先去找漏洞和反面证据的习惯。",
    unlikePoint: "你不像他那种专业级研究和做空能力，这里不是完整风格对应。",
  },
];

const ENGLISH_EXCLUDED_PEOPLE = new Set([
  "许翔",
  "赵强（赵老哥）",
  "章建平",
  "方新侠",
  "陈小群",
  "作手新一",
  "小鳄鱼",
  "92科比",
  "孙国栋",
  "炒股养家",
]);

const QUESTIONS = [
  {
    id: 1,
    prompt: "看到一只票突然直线拉升，你第一反应更像：",
    options: [
      { text: "先上车再说，强度最重要", weights: { rush: 3, fomo: 3, risk: 2 } },
      { text: "先看能不能持续，不急这一秒", weights: { discipline: 2, patience: 1, fomo: 1 } },
      { text: "涨太快了，等回落看看", weights: { patience: 2, contrarian: 2, discipline: 1 } },
      { text: "热闹通常不是我的买点", weights: { discipline: 2, patience: 2, contrarian: 2 } },
    ],
  },
  {
    id: 2,
    prompt: "对你来说更难受的是：",
    options: [
      { text: "明明看到了却没买", weights: { fomo: 3, rush: 2, risk: 1 } },
      { text: "买了以后立刻亏钱", weights: { discipline: 2, patience: 1 } },
      { text: "赚过又吐回去", weights: { fomo: 1, discipline: 1, patience: 1 } },
      { text: "买得不够有逻辑", weights: { discipline: 3, patience: 1, contrarian: 1 } },
    ],
  },
  {
    id: 3,
    prompt: "大家都在聊同一个机会时，你通常会：",
    options: [
      { text: "更想参与，说明市场认了", weights: { fomo: 3, rush: 2, risk: 1 } },
      { text: "会做，但只做最核心的那个", weights: { risk: 1, discipline: 2, fomo: 1 } },
      { text: "开始警惕，太一致了", weights: { contrarian: 2, discipline: 2, patience: 1 } },
      { text: "我更想找下一个还没被看到的", weights: { contrarian: 3, risk: 1, rush: 1 } },
    ],
  },
  {
    id: 4,
    prompt: "一笔交易刚浮盈，你最容易做什么：",
    options: [
      { text: "想拿更大空间", weights: { risk: 2, patience: 2, rush: 1 } },
      { text: "先保护利润再说", weights: { discipline: 3, patience: 1 } },
      { text: "开始纠结卖不卖", weights: { fomo: 1, discipline: 1, patience: 1 } },
      { text: "看下一根再决定", weights: { rush: 1, fomo: 1, patience: 1 } },
    ],
  },
  {
    id: 5,
    prompt: "连续两笔止损后，你更像：",
    options: [
      { text: "更想立刻做回来", weights: { rush: 3, risk: 2, fomo: 1 } },
      { text: "暂停一下，收缩动作", weights: { discipline: 2, patience: 2 } },
      { text: "开始复盘哪里不对", weights: { discipline: 3, patience: 2, contrarian: 1 } },
      { text: "表面冷静，内心已经在怀疑人生", weights: { fomo: 1, rush: 1, patience: 1 } },
    ],
  },
  {
    id: 6,
    prompt: "市场没主线、很混沌的时候，你通常：",
    options: [
      { text: "还会找强的试", weights: { rush: 2, fomo: 2, risk: 2 } },
      { text: "少做甚至不做", weights: { discipline: 2, patience: 3 } },
      { text: "会盯着看，等情绪变化", weights: { discipline: 1, patience: 2, contrarian: 1 } },
      { text: "更容易去找超跌反弹", weights: { contrarian: 3, risk: 2, patience: 1 } },
    ],
  },
  {
    id: 7,
    prompt: "你更相信哪种机会：",
    options: [
      { text: "市场已经明显选出来的", weights: { rush: 2, fomo: 2, risk: 1 } },
      { text: "逻辑最完整的", weights: { discipline: 2, patience: 1, contrarian: 1 } },
      { text: "位置最舒服、赔率最高的", weights: { patience: 2, contrarian: 2, discipline: 1 } },
      { text: "别人还没反应过来的新东西", weights: { contrarian: 2, rush: 1, risk: 2 } },
    ],
  },
  {
    id: 8,
    prompt: "你买入一笔交易后最怕看到：",
    options: [
      { text: "直接冲高回落", weights: { fomo: 2, rush: 1 } },
      { text: "逻辑证伪", weights: { discipline: 3, patience: 1 } },
      { text: "阴跌不止", weights: { risk: 1, patience: 1, discipline: 1 } },
      { text: "自己卖飞", weights: { fomo: 3, rush: 1 } },
    ],
  },
  {
    id: 9,
    prompt: "别人恐慌的时候，你更像：",
    options: [
      { text: "我也先撤", weights: { discipline: 1, rush: 1 } },
      { text: "我开始认真找机会", weights: { contrarian: 2, risk: 2, patience: 1 } },
      { text: "我先观察有没有情绪拐点", weights: { discipline: 1, patience: 2, contrarian: 2 } },
      { text: "我通常不会在这种时候乱动", weights: { discipline: 3, patience: 2 } },
    ],
  },
  {
    id: 10,
    prompt: "你看盘时更像：",
    options: [
      { text: "猎手", weights: { rush: 2, risk: 2, fomo: 1 } },
      { text: "审核员", weights: { discipline: 3, patience: 1 } },
      { text: "侦察兵", weights: { contrarian: 2, patience: 1, discipline: 1 } },
      { text: "解说员", weights: { discipline: 1, patience: 1, fomo: 1 } },
    ],
  },
  {
    id: 11,
    prompt: "如果朋友说“这票都涨成这样了你还敢看？”你更可能想：",
    options: [
      { text: "越强越值得看", weights: { rush: 2, fomo: 2, risk: 1 } },
      { text: "看，但只在确认后", weights: { discipline: 2, patience: 1, fomo: 1 } },
      { text: "这种时候反而不是我最舒服的位置", weights: { contrarian: 2, patience: 2, discipline: 1 } },
      { text: "我更关心它涨完后谁会接不住", weights: { contrarian: 3, discipline: 1 } },
    ],
  },
  {
    id: 12,
    prompt: "你做决定最依赖：",
    options: [
      { text: "强度", weights: { rush: 2, fomo: 2, risk: 1 } },
      { text: "逻辑", weights: { discipline: 2, patience: 1, contrarian: 1 } },
      { text: "位置", weights: { patience: 2, contrarian: 2, discipline: 1 } },
      { text: "情绪", weights: { rush: 1, fomo: 2, contrarian: 1 } },
    ],
  },
  {
    id: 13,
    prompt: "你最容易死在哪种情况：",
    options: [
      { text: "追得太快", weights: { rush: 3, fomo: 2, risk: 1 } },
      { text: "等得太久", weights: { patience: 3, discipline: 1 } },
      { text: "想得太多", weights: { discipline: 1, patience: 2, fomo: 1 } },
      { text: "不肯认错", weights: { risk: 2, contrarian: 2, discipline: 1 } },
    ],
  },
  {
    id: 14,
    prompt: "如果一次机会完全走成你预想的样子，你更可能：",
    options: [
      { text: "下次更敢", weights: { rush: 2, risk: 2, fomo: 1 } },
      { text: "归纳成方法", weights: { discipline: 3, patience: 1 } },
      { text: "觉得这次只是运气和节奏共振", weights: { discipline: 1, patience: 1, contrarian: 1 } },
      { text: "开始思考还能不能拿更久", weights: { patience: 2, risk: 1, fomo: 1 } },
    ],
  },
  {
    id: 15,
    prompt: "你在市场里最想证明的是：",
    options: [
      { text: "我反应够快", weights: { rush: 3, fomo: 1, risk: 1 } },
      { text: "我判断够准", weights: { discipline: 2, patience: 1, contrarian: 1 } },
      { text: "我足够稳", weights: { discipline: 3, patience: 2 } },
      { text: "我能看懂别人没看懂的东西", weights: { contrarian: 3, patience: 1, risk: 1 } },
    ],
  },
  {
    id: 16,
    prompt: "你觉得自己更像哪种人：",
    options: [
      { text: "冲锋的人", weights: { rush: 2, risk: 2, fomo: 1 } },
      { text: "守纪律的人", weights: { discipline: 3, patience: 2 } },
      { text: "看风向的人", weights: { contrarian: 2, patience: 1, discipline: 1 } },
      { text: "容易跟自己打架的人", weights: { fomo: 1, rush: 1, patience: 1 } },
    ],
  },
];

const QUESTION_COPY_EN = {
  1: {
    prompt: "When a stock suddenly shoots straight up, your first instinct is:",
    options: [
      "Jump in first. Strength matters most.",
      "Check if it can actually hold. No need to rush this second.",
      "It moved too fast. I'd wait for a pullback.",
      "Crowds are usually not my buy point.",
    ],
  },
  2: {
    prompt: "Which of these hurts you more?",
    options: [
      "I saw it but did not buy.",
      "I bought it and it immediately went red.",
      "I had profits and then gave them back.",
      "My entry did not feel logical enough.",
    ],
  },
  3: {
    prompt: "When everyone is talking about the same opportunity, you usually:",
    options: [
      "Want in even more. The market has already approved it.",
      "Will trade it, but only the strongest core name.",
      "Start getting cautious. Too much agreement is dangerous.",
      "Would rather look for the next thing nobody sees yet.",
    ],
  },
  4: {
    prompt: "A trade just turned green. What do you most easily do next?",
    options: [
      "Think about holding for a bigger move.",
      "Protect the profit first.",
      "Start debating whether to sell.",
      "Wait for one more candle before deciding.",
    ],
  },
  5: {
    prompt: "After two stop-losses in a row, you are more like:",
    options: [
      "I want to win it back immediately.",
      "Pause and shrink my activity.",
      "Review what went wrong.",
      "I look calm outside, but I am doubting life inside.",
    ],
  },
  6: {
    prompt: "When the market is messy and has no main theme, you usually:",
    options: [
      "Still try the strongest names.",
      "Trade less or not at all.",
      "Keep watching and wait for sentiment shifts.",
      "Are more likely to hunt for oversold rebounds.",
    ],
  },
  7: {
    prompt: "Which kind of opportunity do you trust more?",
    options: [
      "The one the market has already clearly chosen.",
      "The one with the cleanest logic.",
      "The one with the best entry and best odds.",
      "The one others have not reacted to yet.",
    ],
  },
  8: {
    prompt: "After you buy, what are you most afraid to see?",
    options: [
      "An immediate spike-and-fade.",
      "The thesis getting disproved.",
      "A slow bleed that never ends.",
      "Selling too early and missing the real move.",
    ],
  },
  9: {
    prompt: "When others panic, you are more like:",
    options: [
      "I pull back too.",
      "I start looking seriously for opportunities.",
      "I first watch for a sentiment turning point.",
      "I usually do not move recklessly at times like that.",
    ],
  },
  10: {
    prompt: "When you watch the market, you feel more like a:",
    options: ["Hunter", "Auditor", "Scout", "Commentator"],
  },
  11: {
    prompt: 'If a friend says, "It has already gone up this much and you still want to watch it?" your thought is:',
    options: [
      "The stronger it is, the more it deserves attention.",
      "Yes, but only after confirmation.",
      "This is exactly not my most comfortable entry.",
      "I care more about who gets trapped after the run.",
    ],
  },
  12: {
    prompt: "When making decisions, what do you rely on most?",
    options: ["Strength", "Logic", "Entry / price", "Emotion"],
  },
  13: {
    prompt: "Where are you most likely to die in the market?",
    options: [
      "Chasing too fast.",
      "Waiting too long.",
      "Thinking too much.",
      "Refusing to admit I am wrong.",
    ],
  },
  14: {
    prompt: "If a setup plays out exactly the way you expected, you are more likely to:",
    options: [
      "Get bolder next time.",
      "Turn it into a rule or method.",
      "Tell myself it was still luck plus timing.",
      "Wonder whether I could have held even longer.",
    ],
  },
  15: {
    prompt: "What do you most want to prove in the market?",
    options: [
      "That my reaction speed is fast enough.",
      "That my judgment is accurate enough.",
      "That I am stable enough.",
      "That I can see what others cannot.",
    ],
  },
  16: {
    prompt: "Which kind of person do you feel more like?",
    options: [
      "A person who charges first",
      "A person who follows rules",
      "A person who reads the wind",
      "A person who fights with themselves",
    ],
  },
};

const PERSONA_TRANSLATIONS = {
  天生韭菜: {
    name: "Natural Bagholder",
    subtitle: "Once the market heats up, your hand speaks before your head",
    oneLiner: "You do understand risk. You just keep feeling that maybe this time really is different.",
    description:
      "You are highly sensitive to market temperature, sometimes so sensitive that it drags you along. While others are still confirming, you are already imagining the next leg.",
    whyMatch:
      "Heat and opportunity move you easily. When everyone else is charging, it is especially hard for you to fully hold yourself back.",
    typicalBehavior:
      "You want to chase acceleration in leaders, then explain pullbacks away as washouts. In review you think the issue was execution, then repeat it live.",
    weakness:
      "Your biggest problem is not being wrong. It is mistaking peak emotion for logic.",
    hiddenTalent:
      "Your nose for active market spots is actually not bad. If you can delay your emotional response by half a beat, your read improves a lot.",
    bestMarket: "Strong directional markets with a clear main theme and expanding profit effect.",
    badMarket: "Messy rotation, false breakouts and fast style shifts.",
    shareText:
      "I got Natural Bagholder. Once the market heats up, my judgment turns into participation impulse. I do see risk. I just keep thinking maybe this time it is finally mine.",
  },
  未来游资: {
    name: "Future Hot-Money Trader",
    subtitle: "Not famous yet, but already trading like someone who wants the spotlight",
    oneLiner: "You are not simply impulsive. You react extremely fast to shifts in heat and you are actually willing to own the consequence.",
    description:
      "You like speed, confirmation and the exact moment when position and momentum resonate. Once the market lights up a direction, it is hard for you to stay on the sideline.",
    whyMatch:
      "Your impulse speed and risk appetite are both high, but unlike pure emotion traders, you still carry some execution framework of your own.",
    typicalBehavior:
      "Watch the core, wait for a shakeout, then attack the reflow. If you trade, you want the strongest bite.",
    weakness:
      "You can mistake speed for edge, and because you trust your rhythm so much, you may tolerate too much drawdown.",
    hiddenTalent:
      "Your feel for how the market chooses leaders is real. If discipline catches up, your aggression becomes style.",
    bestMarket: "Aggressive markets with clear leaders, hot sectors and strong emotional follow-through.",
    badMarket: "One-day themes, hard reversals and broken momentum in downcycles.",
    shareText:
      "I got Future Hot-Money Trader. When the market heats up, my hands get ready before my brain fully finishes the sentence. I have not made the big money yet, but the vibe already showed up.",
  },
  基金经理: {
    name: "Fund Manager",
    subtitle: "You act more like you are managing NAV than chasing a story",
    oneLiner: "You are not timid. You simply care much more about confirmation and drawdown control.",
    description:
      "Your instinct is to think in terms of allocation, pace and certainty. You rarely change rhythm just because a short-term topic gets loud.",
    whyMatch:
      "Your discipline and patience are stable, and FOMO is relatively low. You prefer to act after understanding something clearly.",
    typicalBehavior:
      "Research first, size matters as much as entry, and you dislike explaining everything through emotion.",
    weakness:
      "In highly emotional markets you can look half a beat slow. By the time everything is clear, a lot of edge may already be gone.",
    hiddenTalent:
      "Your balance between risk and reward is decent. You are good at holding rhythm in noisy environments.",
    bestMarket: "Slow bull markets and structured trends where fundamentals and price can validate each other.",
    badMarket: "Pure emotional games where moves depend on anticipation and speed.",
    shareText:
      "I got Fund Manager. It is not that I never want to charge. I am just built to calculate drawdown first. The market can be hot. I still need to stay in control.",
  },
  老股民: {
    name: "Seasoned Shareholder",
    subtitle: "You have not only seen big scenes. You have seen too many of them",
    oneLiner: "Your first reaction to the market is often not excitement. It is caution.",
    description:
      "You have seen enough cycles to naturally leave space around hype. While others see opportunity, you first see how rhythm could bite back.",
    whyMatch:
      "Your patience, discipline and contrarian instinct are all relatively high. Your signature is not aggression. It is knowing when not to make mistakes.",
    typicalBehavior:
      "You are not easily seduced by fresh stories. You check volume, level and crowding, and sometimes prefer missing a move over forcing one.",
    weakness:
      "Because you understand risk so well, you can become overly conservative and trail when the market truly breaks out.",
    hiddenTalent:
      "You are excellent at reading danger signals and hitting the brakes when everyone else gets heated.",
    bestMarket: "Choppy, structured and highly rotational environments.",
    badMarket: "Single-direction melt-ups and emotional stampedes that stay irrationally strong.",
    shareText:
      "I got Seasoned Shareholder. Others see opportunity, and I first ask whether this thing might flip tomorrow. It is not fear. I have just seen too much.",
  },
  追涨冠军: {
    name: "Breakout Chaser",
    subtitle: "You trust what the market has already chosen",
    oneLiner: "It is not that you love chasing high prices. You only trust the names that have already won one round.",
    description:
      "You are extremely sensitive to strength and confirmation. You do not care to guess what has not worked yet, but once something proves itself, it is very hard not to want in.",
    whyMatch:
      "Your FOMO is high. You would rather buy expensive than miss the one name the market has clearly singled out.",
    typicalBehavior:
      "You prefer the strongest names and dislike early ambushes. Once a sector accelerates, your willingness to act rises sharply.",
    weakness:
      "The most dangerous place for you is buying into climax. The entry is not always wrong, but exiting when emotion turns is the challenge.",
    hiddenTalent:
      "Your body feel for strength and trend is sharp. You can identify who the market has chosen faster than most.",
    bestMarket: "Leader-led emotional phases where the main sector keeps exceeding expectations.",
    badMarket: "Broken high-flyers, intraday sentiment reversals and fragile momentum.",
    shareText:
      "I got Breakout Chaser. Others say it is too high. I say the market already stamped it as strong. The real problem is not buying expensive. It is trusting once too many times when the turn arrives.",
  },
  抄底艺术家: {
    name: "Dip-Buying Artist",
    subtitle: "When things fall, your first instinct is to ask whether value got mispriced",
    oneLiner: "You are not just being contrarian. You simply feel the most comfortable entries should not show up at the hottest moment.",
    description:
      "You are naturally wary of crowding and climax. You would rather search for value and rebound potential when others are no longer eager to look.",
    whyMatch:
      "Your contrarian instinct stands out. You are willing to endure being early or misunderstood in exchange for what you think is a better starting point.",
    typicalBehavior:
      "Wait for shakeouts, wait for panic, wait for oversold opportunities. You do not love chasing things that are already gone.",
    weakness:
      "Your biggest risk is stepping in too early, before the market has actually stopped falling.",
    hiddenTalent:
      "You have a real gift for catching expectation gaps and emotional reversals. With enough patience, your odds can be excellent.",
    bestMarket: "Oversold repairs, panic rebounds and shakeout-to-recovery sequences.",
    badMarket: "Persistent downtrends where cheap keeps getting cheaper.",
    shareText:
      "I got Dip-Buying Artist. I do not love the hottest place. I would rather see whether something got unfairly marked down while everyone else feels uncomfortable.",
  },
  模拟盘股神: {
    name: "Paper Trading Oracle",
    subtitle: "Your imaginary equity curve is often cleaner than your live one",
    oneLiner: "It is not that you lack logic. It is that the moment real money is involved, logic starts fighting emotion.",
    description:
      "You are great at simulation and review. Ideas look clean after the close, but once real risk shows up, your actions become much more conservative.",
    whyMatch:
      "Your discipline is not low and your risk appetite is not high. That means you are not blindly aggressive, but you do amplify the mental weight of every click.",
    typicalBehavior:
      "Great after-hours review, more hesitation live. You see opportunities clearly, but the actual order button feels heavier.",
    weakness:
      "You get blocked by yourself and wait for perfect confirmation until the best window is gone.",
    hiddenTalent:
      "Your ability to analyze structure and rhythm is strong. You can turn experience into frameworks.",
    bestMarket: "Markets with clear structure and repeatable review value.",
    badMarket: "Very fast markets that reward instinct before thought.",
    shareText:
      "I got Paper Trading Oracle. After the close I am a market consultant. In live trading I become the risk committee. The plan is clear. The order is the hard part.",
  },
  纪律机器人: {
    name: "Discipline Robot",
    subtitle: "Emotion can be loud, but your process is louder",
    oneLiner: "You are not cold. You are simply more willing than most people to obey rules.",
    description:
      "You do not rely heavily on intraday flashes. You trust conditions, plans and consistency. The market may influence you, but it should not decide for you.",
    whyMatch:
      "Your discipline is extremely high, while impulse and FOMO are relatively contained. That is classic process-driven behavior.",
    typicalBehavior:
      "Set conditions, wait for triggers, execute rules. You can stop out cleanly and you can also tolerate sitting out.",
    weakness:
      "In emotional melt-up phases you may miss the most explosive segment because you dislike doing things with no prior sample.",
    hiddenTalent:
      "Your biggest edge is not one genius trade. It is your ability to keep the error rate low over time.",
    bestMarket: "Markets with recurring patterns and rule-based repeatability.",
    badMarket: "Style shifts, random topic changes and environments that reward pure improvisation.",
    shareText:
      "I got Discipline Robot. The market may go crazy. The process cannot. Other people chase excitement. I chase consistency.",
  },
  情绪观察员: {
    name: "Sentiment Observer",
    subtitle: "You are not only watching the market. You are watching how everyone watches it",
    oneLiner: "You are not slow. You first want to know whether the market is actually telling the truth today.",
    description:
      "You are highly sensitive to subtle sentiment changes. You may not jump in first, but you always want to see where the wind is blowing and whether it is real.",
    whyMatch:
      "Your discipline and contrarian instinct are both elevated, which means you treat emotion as information, not instruction.",
    typicalBehavior:
      "Read mood first, then decide which side to stand on. You are good at spotting the crowd psychology behind heat shifts.",
    weakness:
      "Watching too long can cost you the best strike. You may understand first and act second.",
    hiddenTalent:
      "You are good at reading the language of the market. Others see price. You also see what capital is expressing.",
    bestMarket: "Markets where sentiment and expectation games are readable.",
    badMarket: "Leaderless, signal-poor environments dominated by random news shocks.",
    shareText:
      "I got Sentiment Observer. I do not rush to become part of the market. I first want to see what story the market is performing today.",
  },
  纸上巴菲特: {
    name: "Buffett on Paper",
    subtitle: "You can think in years, but not always sit through three days of noise",
    oneLiner: "It is not that you cannot hold for the long term. Real volatility simply makes your ideal self argue with your live self.",
    description:
      "You believe in long-term logic and patience, but when money is live, every fluctuation feels like a test.",
    whyMatch:
      "Your patience aspiration is high and your FOMO is low, so you believe in a long-term frame. The issue is not always belief. It is execution consistency.",
    typicalBehavior:
      "You sound like a long-term investor in research mode, then monitor short-term swings in live mode.",
    weakness:
      "Long term can sometimes become a shelter for emotion, blurring the line between conviction and excuse.",
    hiddenTalent:
      "You have real interest in business logic and long-cycle narratives. If you reduce internal conflict, patience becomes edge.",
    bestMarket: "Medium-to-long trends where logic remains intact and volatility is bearable.",
    badMarket: "Wild, event-driven and purely emotional markets.",
    shareText:
      "I got Buffett on Paper. In philosophy I am already long-term. In live trading I am still learning not to get dragged back into short-term personality by three days of noise.",
  },
  消息冲浪王: {
    name: "News Surfing King",
    subtitle: "The moment the wind changes, you know where heat will gather first",
    oneLiner: "It is not that you only trade news. You are simply very good at smelling tempo changes inside it.",
    description:
      "You are highly sensitive to events, expectation gaps and emerging themes. When something moves, you quickly test whether it could become the next consensus.",
    whyMatch:
      "Your impulse and FOMO are both high, meaning you hate being late when the market just starts a new fire.",
    typicalBehavior:
      "Watch headlines, watch unusual moves, watch sector linkage. Your actions are often faster than the crowd in event-driven setups.",
    weakness:
      "News-heavy periods can pull you into overtrading, mistaking temporary noise for a durable main line.",
    hiddenTalent:
      "You absorb new narratives quickly and can identify where collective attention is heading.",
    bestMarket: "Markets with dense catalysts and fast expectation repricing.",
    badMarket: "Markets with plenty of news but poor follow-through.",
    shareText:
      "I got News Surfing King. The wind is not even fully up yet and I am already looking for the sector. The issue is not a lack of sensitivity. It is sometimes having too much of it.",
  },
  格局大师: {
    name: "Big Picture Holder",
    subtitle: "When you really believe in something, you want to give it more time",
    oneLiner: "It is not simply that you hold longer. You want to capture the segment that actually matters.",
    description:
      "You are not the most impulsive type, but once you buy into a thesis, you are willing to give the trend more space instead of being shaken out by daily noise.",
    whyMatch:
      "Your risk appetite is not low and your patience is higher than a typical attacker. You do not just want the first bite. You want the meaningful middle.",
    typicalBehavior:
      "You give favored names more time and want logic, sentiment and trend to confirm each other before exiting.",
    weakness:
      "Too much big-picture thinking can turn into attachment and give back profits that should have been taken.",
    hiddenTalent:
      "You judge trend continuation well. When you are right, you often hold the main leg better than others.",
    bestMarket: "Clear trending markets with durable leadership.",
    badMarket: "Markets that slap back and forth with constantly changing leaders.",
    shareText:
      "I got Big Picture Holder. I am not trying to hold one more random day. I just feel a real main move should pay more than the opening emotion.",
  },
  键盘分析师: {
    name: "Keyboard Analyst",
    subtitle: "You can break down charts and logic. The hard part is the click",
    oneLiner: "It is not that you do not understand the market. You just tend to analyze yourself one more time before acting.",
    description:
      "You are good at summarizing, expressing and structuring ideas. In live trading, though, your action can be much less decisive than your analysis.",
    whyMatch:
      "Your risk appetite is relatively low, while discipline and contrarian instinct are decent. You are better at understanding the environment than winning pure speed contests.",
    typicalBehavior:
      "You can draw the chart, explain the logic and map the rhythm, but your execution is not always as sharp as your commentary.",
    weakness:
      "Analysis itself can trap you. The more you want to be right, the more likely you are to miss the simplest execution window.",
    hiddenTalent:
      "Your ability to organize frameworks is strong. You are a natural candidate for building your own review database.",
    bestMarket: "Markets with structure you can study, summarize and refine.",
    badMarket: "Extremely fast environments that reward reflex and nerve more than thought.",
    shareText:
      "I got Keyboard Analyst. I have the chart. I have the thesis. The difficult part is not opening a second internal committee meeting while the market is moving.",
  },
  空仓哲学家: {
    name: "Cash-Only Philosopher",
    subtitle: "You have a sophisticated explanation for staying out",
    oneLiner: "It is not that you do not want to make money. You simply think a lot of losses can be avoided by doing nothing.",
    description:
      "You see cash as an active position. While others feel bored, you frame it as waiting for better odds, better rhythm and a cleaner signal.",
    whyMatch:
      "Your discipline and patience are both high, while impulse and FOMO are low. You can truly choose not to participate.",
    typicalBehavior:
      "When the market is unclear, you stay out. While others search for trades, you filter most of the noise away.",
    weakness:
      "Caution can gradually become over-caution, and then you miss opportunities that actually were yours.",
    hiddenTalent:
      "Your respect for rhythm is strong. You can preserve your state, capital and touch for when it finally matters.",
    bestMarket: "Chaotic, loss-making environments where saying no is valuable.",
    badMarket: "Strong trends that clearly signal and then keep going without you.",
    shareText:
      "I got Cash-Only Philosopher. It is not that there are no opportunities. Most of them just have not passed the committee yet. Staying out is not always boring, but it does miss fireworks.",
  },
  止盈困难户: {
    name: "Profit-Taking Struggler",
    subtitle: "You can buy and you can hold. Selling is where the negotiations begin",
    oneLiner: "It is not that you cannot sell. Every time you want to sell, a new voice appears saying maybe wait a little longer.",
    description:
      "You may not buy recklessly, but once you have profit, you start bargaining with the market and with yourself.",
    whyMatch:
      "Your patience is decent, but discipline around exits is unstable. That combination often creates messy profit management.",
    typicalBehavior:
      "You want to lock gains, then fear selling too early; once it pulls back you explain it away and repeat the cycle.",
    weakness:
      "You can turn a good trade into an incomplete one by refusing to close the loop when you should.",
    hiddenTalent:
      "You do have holding ability. What you need is to apply rules to exits, not just entries.",
    bestMarket: "Trending environments with moderate pullbacks and room to hold.",
    badMarket: "Sharp spike-and-fade conditions where profits evaporate quickly.",
    shareText:
      "I got Profit-Taking Struggler. It is not that I never want to leave while green. I just keep thinking maybe it still understands me a little more. Then the profit leaves first.",
  },
  补仓艺术家: {
    name: "Averaging-Down Artist",
    subtitle: "A drawdown looks not only like risk to you, but also a renegotiation",
    oneLiner: "It is not stubbornness exactly. It is that you find it hard to admit your first entry timing may have been wrong.",
    description:
      "You are more sensitive to price than to crowd emotion. When something falls, your instinct is to improve cost before doubting direction.",
    whyMatch:
      "Your contrarian instinct and patience are both high. That means you are willing to go against the market, but weak discipline can turn that into fighting risk.",
    typicalBehavior:
      "When price falls, you first look for reasons, then for levels, then for a new entry. If the thesis is not fully broken, you want to give it another chance.",
    weakness:
      "You can turn correction into escalation and delay the moment you should admit the timing was wrong.",
    hiddenTalent:
      "You can stay calm in panic. If averaging down becomes conditional rather than emotional, it becomes much more powerful.",
    bestMarket: "Sharp selloffs followed by repair, or volatile but still-intact structures.",
    badMarket: "Persistent downtrends and real thesis breakdowns where adding keeps making things worse.",
    shareText:
      "I got Averaging-Down Artist. When price falls, my first thought is not surrender. It is whether I can improve the cost. The artistic instinct is strong. The risk instinct needs to keep up.",
  },
};

const PEOPLE_TRANSLATIONS = {
  许翔: {
    name: "Xu Xiang",
    shortLabel: "A legend of emotional short-term trading",
    story:
      "He is often remembered for aggressive short-term execution and an exceptional feel for limit-up sentiment and market intensity.",
    keywords: ["sentiment", "short-term aggression", "fast rhythm"],
    holdingPeriod: "Days to weeks",
    riskLevel: "Very high",
    likePoint: "You resemble his willingness to make the move real the moment an opportunity appears.",
    unlikePoint: "You do not resemble his real-world execution density or ability level. This is only a temperament comparison.",
  },
  "赵强（赵老哥）": {
    name: "Zhao Qiang (Zhao Laoge)",
    shortLabel: "Strong leader-following instinct",
    story:
      "He is widely associated with leader continuation trades and strong sensitivity to the market's main line.",
    keywords: ["leaders", "follow-through", "emotion"],
    holdingPeriod: "Days to weeks",
    riskLevel: "High",
    likePoint: "You resemble the part of him that wants to stand with names the market has already chosen.",
    unlikePoint: "You do not resemble a fully developed trading system or real track record. This is only a vibe match.",
  },
  章建平: {
    name: "Zhang Jianping",
    shortLabel: "Large-style trend conviction",
    story:
      "People often associate him with size, trend conviction and the ability to sit through meaningful segments.",
    keywords: ["trend", "conviction", "holding power"],
    holdingPeriod: "Days to months",
    riskLevel: "High",
    likePoint: "You resemble the side that is willing to push time and exposure once the direction feels right.",
    unlikePoint: "You do not resemble that level of scale, pressure tolerance or complete experience.",
  },
  方新侠: {
    name: "Fang Xinxia",
    shortLabel: "Fast on hot themes",
    story:
      "He is often mentioned as someone with strong feel for theme rotation, hot topics and real-time sentiment changes.",
    keywords: ["theme rotation", "fast tempo", "hot-money feel"],
    holdingPeriod: "Days to two weeks",
    riskLevel: "High",
    likePoint: "You resemble his sensitivity to where the market's attention is flowing next.",
    unlikePoint: "You do not resemble the depth of his live execution experience. This is a partial style echo.",
  },
  陈小群: {
    name: "Chen Xiaoqun",
    shortLabel: "A high-beta new-gen trader",
    story:
      "He is often discussed as a representative of high elasticity and fast emotional response in newer market cycles.",
    keywords: ["elasticity", "fast reaction", "high beta"],
    holdingPeriod: "Days",
    riskLevel: "High",
    likePoint: "You resemble the urge not to be late when heat suddenly expands.",
    unlikePoint: "You do not resemble his real-world trading maturity or scale.",
  },
  作手新一: {
    name: "Zuoshou Xinyi",
    shortLabel: "Very sensitive to sentiment cycles",
    story:
      "He is often used as an example of someone who reacts quickly when emotional cycles turn.",
    keywords: ["sentiment cycle", "speed", "theme feel"],
    holdingPeriod: "Days",
    riskLevel: "High",
    likePoint: "You resemble the part that gets ready as soon as a heat inflection appears.",
    unlikePoint: "You do not resemble the real trading mileage behind that style.",
  },
  小鳄鱼: {
    name: "Little Crocodile",
    shortLabel: "Prefers strong names",
    story:
      "He is commonly grouped with aggressive traders who prefer to operate around clearly strong stocks.",
    keywords: ["strong stocks", "aggression", "trend follow"],
    holdingPeriod: "Days to two weeks",
    riskLevel: "High",
    likePoint: "You resemble his confidence in strong feedback and already-proven names.",
    unlikePoint: "You do not resemble his execution intensity or actual capital scale.",
  },
  "92科比": {
    name: "Kobe '92",
    shortLabel: "Built like a heat sensor",
    story:
      "He is often mentioned as someone highly sensitive to market heat and fast topic transitions.",
    keywords: ["heat sensing", "topic chasing", "fast emotion"],
    holdingPeriod: "Days",
    riskLevel: "High",
    likePoint: "You resemble the part that can hardly stay completely still once the market gets hot.",
    unlikePoint: "You do not resemble his full live-trading style or actual results.",
  },
  孙国栋: {
    name: "Sun Guodong",
    shortLabel: "Trend plus discipline",
    story:
      "He is often described as someone who combines trend participation with relatively stable execution.",
    keywords: ["trend", "execution", "rhythm"],
    holdingPeriod: "Weeks to months",
    riskLevel: "Medium-high",
    likePoint: "You resemble the balance between wanting the trend and still respecting structure.",
    unlikePoint: "You do not resemble the maturity of his real system or experience base.",
  },
  炒股养家: {
    name: "Chaogu Yangjia",
    shortLabel: "Observer of sentiment and timing",
    story:
      "People often bring him up for his understanding of sentiment, timing and risk control rather than one single tactic.",
    keywords: ["sentiment reading", "timing", "risk control"],
    holdingPeriod: "Days to weeks",
    riskLevel: "Medium-high",
    likePoint: "You resemble the side that wants to understand the market's mood before joining it.",
    unlikePoint: "You do not resemble a fully tested long-cycle trading record.",
  },
  张磊: {
    name: "Zhang Lei",
    shortLabel: "Growth and long-term lens",
    story:
      "He is often seen as a symbol of long-term growth investing and thinking in years rather than sessions.",
    keywords: ["growth", "long term", "patience"],
    holdingPeriod: "Months to years",
    riskLevel: "Medium",
    likePoint: "You resemble the willingness to stretch your horizon and not get dragged around by short-term noise.",
    unlikePoint: "You do not resemble his research depth, access or real-world resources.",
  },
  李录: {
    name: "Li Lu",
    shortLabel: "Value with real patience",
    story:
      "His name is often associated with long-term value, patience and staying inside what you truly understand.",
    keywords: ["value", "patience", "circle of competence"],
    holdingPeriod: "Years",
    riskLevel: "Medium",
    likePoint: "You resemble his calm willingness to wait for logic rather than noise.",
    unlikePoint: "You do not resemble his full long-term investment framework or track record.",
  },
  冯柳: {
    name: "Feng Liu",
    shortLabel: "Contrarian but grounded",
    story:
      "He is often associated with contrarian thinking, expectation gaps and patiently looking where the crowd is not.",
    keywords: ["contrarian", "expectation gap", "patience"],
    holdingPeriod: "Months to years",
    riskLevel: "Medium-high",
    likePoint: "You resemble the side that searches for opportunity inside disagreement and neglect.",
    unlikePoint: "You do not resemble that level of research depth or long-horizon consistency.",
  },
  李嘉诚: {
    name: "Li Ka-shing",
    shortLabel: "A symbol of extreme risk awareness",
    story:
      "In popular culture he stands more for steadiness, margin of safety and not rushing into heat.",
    keywords: ["stability", "safety margin", "long term"],
    holdingPeriod: "Years",
    riskLevel: "Low",
    likePoint: "You resemble the preference to stay orderly first and profitable second.",
    unlikePoint: "You do not resemble his real-world resources, business judgment or scale.",
  },
  巴菲特: {
    name: "Warren Buffett",
    shortLabel: "The most famous face of long-term investing",
    story:
      "His story is practically synonymous with long-term thinking, circle of competence and letting time magnify judgment.",
    keywords: ["long term", "value", "patience"],
    holdingPeriod: "Years",
    riskLevel: "Medium",
    likePoint: "You resemble the side that does not rush to follow market noise and prefers high certainty.",
    unlikePoint: "You do not resemble his compounding system or lifetime record. This is not an identity test.",
  },
  芒格: {
    name: "Charlie Munger",
    shortLabel: "Very rational, very framework-driven",
    story:
      "He represents not just holding for a long time, but using mental models and avoiding major mistakes.",
    keywords: ["rationality", "frameworks", "fewer mistakes"],
    holdingPeriod: "Years",
    riskLevel: "Medium",
    likePoint: "You resemble the tendency to filter the world through frameworks before taking a bet.",
    unlikePoint: "You do not resemble his level of accumulated thinking system.",
  },
  格雷厄姆: {
    name: "Benjamin Graham",
    shortLabel: "Margin-of-safety personality",
    story:
      "He is usually associated with rules, valuation, safety margin and staying rational outside the crowd.",
    keywords: ["safety margin", "rules", "contrarian"],
    holdingPeriod: "Months to years",
    riskLevel: "Low to medium",
    likePoint: "You resemble the instinct to avoid big mistakes before optimizing returns.",
    unlikePoint: "You do not resemble a fully systematized professional method of that depth.",
  },
  "詹姆斯·西蒙斯": {
    name: "James Simons",
    shortLabel: "The romance of systems",
    story:
      "He is often treated as a symbol of quant and system trading, where models and repeatability matter more than emotion.",
    keywords: ["quant", "system", "discipline"],
    holdingPeriod: "Multi-horizon",
    riskLevel: "Medium-high",
    likePoint: "You resemble the side that trusts process and repetition more than live adrenaline.",
    unlikePoint: "You do not resemble the mathematical, technical or organizational sophistication involved.",
  },
  "爱德华·索普": {
    name: "Edward Thorp",
    shortLabel: "Probability and discipline",
    story:
      "Whether in gambling or markets, he represents probability edge, boundaries and careful risk handling.",
    keywords: ["probability", "risk control", "system"],
    holdingPeriod: "Strategy-driven",
    riskLevel: "Medium",
    likePoint: "You resemble the instinct to price odds and boundaries before you act.",
    unlikePoint: "You do not resemble his math depth or system-building ability.",
  },
  "雷·达里奥": {
    name: "Ray Dalio",
    shortLabel: "Macro systems observer",
    story:
      "He is known for understanding markets through systems, cycles and macro structure rather than a single price move.",
    keywords: ["macro", "systems", "cycles"],
    holdingPeriod: "Weeks to years",
    riskLevel: "Medium",
    likePoint: "You resemble the side that wants to understand how the machine works before acting inside it.",
    unlikePoint: "You do not resemble his macro depth, resources or organizational platform.",
  },
  索罗斯: {
    name: "George Soros",
    shortLabel: "High-elasticity contrarian icon",
    story:
      "He is often linked with reflexivity, macro vision and the courage to size up hard at key turning points.",
    keywords: ["macro", "reflexivity", "conviction"],
    holdingPeriod: "Weeks to months",
    riskLevel: "High",
    likePoint: "You resemble the side that can bet against consensus when the setup looks meaningful.",
    unlikePoint: "You do not resemble his level of macro vision or historical opportunity capture.",
  },
  "保罗·都铎·琼斯": {
    name: "Paul Tudor Jones",
    shortLabel: "Trend plus risk control",
    story:
      "He is often seen as someone who can be highly aggressive while still respecting risk control deeply.",
    keywords: ["trend", "risk control", "macro"],
    holdingPeriod: "Days to months",
    riskLevel: "High",
    likePoint: "You resemble the part that is willing to attack but still wants a boundary.",
    unlikePoint: "You do not resemble the fully tested professional system behind that style.",
  },
  "大卫·泰珀": {
    name: "David Tepper",
    shortLabel: "Catalyst and odds together",
    story:
      "He is often discussed for seeing shifts in macro, policy and odds, then being willing to size up.",
    keywords: ["odds", "event-driven", "macro"],
    holdingPeriod: "Weeks to months",
    riskLevel: "High",
    likePoint: "You resemble the side that becomes serious once the odds clearly move.",
    unlikePoint: "You do not resemble his macro resources or institutional scale.",
  },
  "约翰·保尔森": {
    name: "John Paulson",
    shortLabel: "Big disagreement bettor",
    story:
      "He is associated with taking meaningful positions in large disagreements and waiting for the world to catch up.",
    keywords: ["disagreement", "event-driven", "patience"],
    holdingPeriod: "Months to years",
    riskLevel: "High",
    likePoint: "You resemble the side that can stand early in a big disagreement when the case feels right.",
    unlikePoint: "You do not resemble his historical scale of judgment or opportunity set.",
  },
  "卡尔·伊坎": {
    name: "Carl Icahn",
    shortLabel: "Forceful and activist",
    story:
      "He is often grouped among aggressive, forceful investors who are willing to push change rather than wait quietly.",
    keywords: ["aggressive", "forceful", "activist"],
    holdingPeriod: "Months to years",
    riskLevel: "High",
    likePoint: "You resemble the side that does not like letting a strong view remain soft.",
    unlikePoint: "You do not resemble his real-world leverage, influence or activist toolkit.",
  },
  "比尔·阿克曼": {
    name: "Bill Ackman",
    shortLabel: "High-conviction expression",
    story:
      "He is often linked with public conviction, large expression and a willingness to endure volatility for a view.",
    keywords: ["conviction", "expression", "holding power"],
    holdingPeriod: "Months to years",
    riskLevel: "High",
    likePoint: "You resemble the side that wants to own the full move once you believe the logic.",
    unlikePoint: "You do not resemble his actual research depth or real-world position sizing.",
  },
  "吉姆·查诺斯": {
    name: "Jim Chanos",
    shortLabel: "Heavy on skepticism",
    story:
      "He is often treated as someone who naturally looks at the opposite side and questions mainstream narratives.",
    keywords: ["skepticism", "contrarian", "risk detection"],
    holdingPeriod: "Weeks to months",
    riskLevel: "Medium-high",
    likePoint: "You resemble the instinct to search for flaws and the other side of the story when consensus gets loud.",
    unlikePoint: "You do not resemble his professional short-selling depth or research process.",
  },
};

const QUESTION_BOUNDS = DIMENSIONS.reduce((acc, dimension) => {
  acc[dimension.key] = { min: 0, max: 0 };
  return acc;
}, {});

QUESTIONS.forEach((question) => {
  DIMENSIONS.forEach(({ key }) => {
    const values = question.options.map((option) => option.weights[key] || 0);
    QUESTION_BOUNDS[key].min += Math.min(...values);
    QUESTION_BOUNDS[key].max += Math.max(...values);
  });
});

const shellStyle = {
  backgroundColor: "#f5efe6",
  backgroundImage:
    "radial-gradient(circle at 10% 0%, rgba(196, 154, 118, 0.18), transparent 28%), radial-gradient(circle at 90% 10%, rgba(124, 137, 113, 0.14), transparent 24%), linear-gradient(180deg, #fbf8f2 0%, #f5efe6 54%, #efe6d8 100%)",
  color: "#2f2721",
  fontFamily:
    '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
};

const titleStyle = {
  fontFamily: '"Songti SC", "Noto Serif SC", "Source Han Serif SC", serif',
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

const cardClass =
  "rounded-[28px] border border-[#e8ddd0] bg-[#fffaf3]/92 shadow-[0_14px_40px_rgba(111,86,57,0.08)] backdrop-blur";

function getText(language) {
  return UI_TEXT[language] || UI_TEXT.zh;
}

function getDimensionLabel(dimension, language) {
  return language === "en" ? dimension.labelEn : dimension.label;
}

function getDimensionShort(dimension, language) {
  return language === "en" ? dimension.shortEn : dimension.short;
}

function getCampContent(camp, language) {
  const meta = CAMP_META[camp];
  if (!meta) return { label: camp, description: "" };
  return {
    ...meta,
    label: language === "en" ? meta.labelEn : meta.label,
    description: language === "en" ? meta.descriptionEn : meta.description,
  };
}

function getPersonaContent(persona, language) {
  if (language !== "en") return persona;
  const translated = PERSONA_TRANSLATIONS[persona.name];
  if (!translated) return persona;
  return {
    ...persona,
    ...translated,
    camp: getCampContent(persona.camp, language).label,
  };
}

function getPeopleContent(person, language) {
  if (language !== "en") return person;
  const translated = PEOPLE_TRANSLATIONS[person.name];
  if (!translated) return person;
  return {
    ...person,
    ...translated,
  };
}

function getQuestionPrompt(question, language) {
  if (language !== "en") return question.prompt;
  return QUESTION_COPY_EN[question.id]?.prompt || question.prompt;
}

function getQuestionOptionText(question, option, index, language) {
  if (language !== "en") return option.text;
  return QUESTION_COPY_EN[question.id]?.options?.[index] || option.text;
}

function localizeCloseTypeNames(text, language) {
  if (language !== "en") return text;

  let nextText = text;
  Object.entries(PERSONA_TRANSLATIONS).forEach(([zhName, content]) => {
    nextText = nextText.replaceAll(zhName, content.name);
  });
  Object.entries(CAMP_META).forEach(([zhCamp, content]) => {
    nextText = nextText.replaceAll(zhCamp, content.labelEn);
  });
  DIMENSIONS.forEach((dimension) => {
    nextText = nextText.replaceAll(dimension.label, dimension.labelEn);
    nextText = nextText.replaceAll(dimension.short, dimension.shortEn);
  });
  return nextText;
}

function LanguageToggle({ language, onChange }) {
  const ui = getText(language);

  return (
    <div className="mb-4 flex justify-end">
      <div className="inline-flex rounded-full border border-[#e4d7c8] bg-[#fffaf3]/90 p-1 shadow-[0_8px_20px_rgba(111,86,57,0.08)]">
        {[
          { key: "zh", label: ui.langZh },
          { key: "en", label: ui.langEn },
        ].map((item) => {
          const active = language === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? "bg-[#2f2721] text-[#f8f2e8]" : "text-[#6d5d51]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatScore(value) {
  return Number(value).toFixed(1);
}

function getEmptyVector() {
  return DIMENSIONS.reduce((acc, { key }) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function scoreToTone(value, language) {
  const ui = getText(language);
  if (value >= 8.2) return ui.toneVeryHigh;
  if (value >= 6.6) return ui.toneHigh;
  if (value >= 4.6) return ui.toneMid;
  if (value >= 3) return ui.toneLow;
  return ui.toneVeryLow;
}

function calculateUserScores(answers) {
  const raw = getEmptyVector();

  answers.forEach((answerIndex, questionIndex) => {
    const option = QUESTIONS[questionIndex]?.options?.[answerIndex];
    if (!option) return;

    DIMENSIONS.forEach(({ key }) => {
      raw[key] += option.weights[key] || 0;
    });
  });

  const normalized = {};
  DIMENSIONS.forEach(({ key }) => {
    const min = QUESTION_BOUNDS[key].min;
    const max = QUESTION_BOUNDS[key].max;
    const ratio = max === min ? 0.5 : (raw[key] - min) / (max - min);
    normalized[key] = clamp(Math.round((1 + ratio * 9) * 10) / 10, 1, 10);
  });

  return normalized;
}

function vectorDistance(a, b) {
  const weights = {
    rush: 1.12,
    fomo: 1.15,
    risk: 1.08,
    discipline: 1.04,
    patience: 1.02,
    contrarian: 1.06,
  };

  return Math.sqrt(
    DIMENSIONS.reduce((sum, { key }) => {
      const delta = (a[key] - b[key]) * (weights[key] || 1);
      return sum + delta * delta;
    }, 0),
  );
}

function rankPersonas(scores) {
  return PERSONAS.map((persona) => ({
    persona,
    distance: vectorDistance(scores, persona.scores),
  })).sort((a, b) => a.distance - b.distance);
}

function rankPeople(scores, mainPersona, options = {}) {
  const excludedNames = options.excludedNames || new Set();
  const blended = {};
  DIMENSIONS.forEach(({ key }) => {
    blended[key] = Number(
      ((scores[key] * 0.68) + (mainPersona.scores[key] * 0.32)).toFixed(2),
    );
  });

  return PEOPLE.filter((person) => !excludedNames.has(person.name))
    .map((person) => {
    let distance = vectorDistance(blended, person.profileVector);
    if (mainPersona.peopleMatches.includes(person.name)) {
      distance -= 0.75;
    }
    return { ...person, distance };
  })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);
}

function buildDimensionInsight(scores, language) {
  const sorted = [...DIMENSIONS].sort((a, b) => scores[b.key] - scores[a.key]);
  const topA = sorted[0];
  const topB = sorted[1];
  const bottomA = sorted[sorted.length - 1];

  let insight =
    language === "en"
      ? "Your core is not simply aggressive or conservative. You are first triggered by a specific kind of market signal."
      : "你的核心不是简单激进或保守，而是会先被市场里的某种信号触发。";
  let contrast =
    language === "en"
      ? `You are driven more by ${getDimensionLabel(topA, language)} than by ${getDimensionLabel(bottomA, language)}.`
      : `你更像${getDimensionLabel(topA, language)}驱动型，而不是${getDimensionLabel(bottomA, language)}驱动型。`;

  if (scores.rush >= 7 && scores.fomo >= 7) {
    insight =
      language === "en"
        ? "Your profile leans toward high FOMO plus high impulse speed. You react to opportunity shifts faster than your emotions can fully digest them."
        : "你的画像偏向“高踏空敏感 + 高上头速度”，你对机会变化的反应通常快过情绪消化。";
    contrast =
      language === "en"
        ? "You behave more like a heat sensor than a slow accumulator."
        : "你更像热度感应型，而不是慢热囤积型。";
  } else if (scores.discipline >= 7.5 && scores.patience >= 7) {
    insight =
      language === "en"
        ? "Your core is not aggression. It is confirmation. You want to decide whether a trade deserves your energy before you allow yourself to get excited."
        : "你的核心不是激进，而是确认。你会先判断这笔交易值不值得，再决定自己要不要兴奋。";
    contrast =
      language === "en"
        ? "You are driven more by discipline than by emotion."
        : "你更像纪律驱动型，而不是情绪驱动型。";
  } else if (scores.contrarian >= 7 && scores.patience >= 6) {
    insight =
      language === "en"
        ? "Your strength is not following consensus. It is your natural suspicion of crowding. You would rather search for comfort where others feel discomfort."
        : "你的强项不是追随共识，而是对拥挤的本能警惕。你更愿意在别人不舒服时找位置。";
    contrast =
      language === "en"
        ? "You act more like an expectation-gap hunter than a hype follower."
        : "你更像预期差猎手，而不是热闹跟随者。";
  } else if (scores.risk >= 7 && scores.discipline >= 6) {
    insight =
      language === "en"
        ? "You are not blindly reckless. You are an offensive executor with boundaries. If the odds and strength are there, you are willing to carry volatility."
        : "你不是盲冲型，而是偏进攻的执行派。只要觉得赔率和强度够，你愿意承担波动。";
    contrast =
      language === "en"
        ? "You feel more like an attacker with boundaries than a pure conservative."
        : "你更像带边界的进攻者，而不是纯保守型选手。";
  } else if (scores.patience >= 7 && scores.fomo <= 4) {
    insight =
      language === "en"
        ? "Your patience is clearly above average. You are not easily thrown off your rhythm just because others made money first."
        : "你的耐心明显高于大多数人。你不太容易因为别人先赚到而乱掉自己的节奏。";
    contrast =
      language === "en"
        ? "You behave more like a time-based player than a chasing player."
        : "你更像时间型玩家，而不是追逐型玩家。";
  }

  return {
    headline:
      language === "en"
        ? `Your profile leans toward "${getDimensionLabel(topA, language)} + ${getDimensionLabel(topB, language)}."`
        : `你的画像偏向“${getDimensionLabel(topA, language)} + ${getDimensionLabel(topB, language)}”。`,
    insight,
    contrast,
  };
}

function buildCloseTypeReason(scores, otherPersona, language) {
  const sharedHigh = DIMENSIONS.filter(
    ({ key }) => scores[key] >= 6.6 && otherPersona.scores[key] >= 6.6,
  );
  const localizedOther = getPersonaContent(otherPersona, language);

  if (sharedHigh.length >= 2) {
    const sharedLabel = sharedHigh
      .slice(0, 2)
      .map((item) => getDimensionLabel(item, language))
      .join(" + ");
    return language === "en"
      ? `You also carry a bit of ${localizedOther.name}: both of you lean toward ${sharedLabel}, but your expression is a little more restrained.`
      : `你也有一点${localizedOther.name}的倾向：你们都偏${sharedLabel}，只是你的表现方式更克制一点。`;
  }

  if (scores.contrarian >= 6.6 && otherPersona.scores.contrarian >= 6.6) {
    return language === "en"
      ? `You also carry a bit of ${localizedOther.name}: you dislike entering at peak crowding and prefer waiting for the market to hand back a more comfortable spot.`
      : `你也有一点${localizedOther.name}的倾向：你不太愿意在最拥挤的时候下手，更喜欢等市场把舒服位置吐出来。`;
  }

  if (scores.discipline >= 6.6 && otherPersona.scores.discipline >= 6.6) {
    return language === "en"
      ? `You also carry a bit of ${localizedOther.name}: you do not act on emotion alone, and often want your plan aligned before you move.`
      : `你也有一点${localizedOther.name}的倾向：你不是完全靠情绪出手，很多时候还是会想先对齐自己的计划。`;
  }

  if (scores.fomo >= 6.6 && otherPersona.scores.fomo >= 6.6) {
    return language === "en"
      ? `You also carry a bit of ${localizedOther.name}: once the market has stamped something as real, it is hard for you to remain completely still.`
      : `你也有一点${localizedOther.name}的倾向：机会一旦被市场盖章，你会很难彻底无动于衷。`;
  }

  return language === "en"
    ? `You also carry a bit of ${localizedOther.name}: ${localizedOther.oneLiner}`
    : `你也有一点${localizedOther.name}的倾向：${localizedOther.oneLiner}`;
}

function buildShareCopy(persona, insight, language) {
  const localizedPersona = getPersonaContent(persona, language);
  const disclaimer = getText(language).disclaimer;
  return `${localizedPersona.shareText}
${insight.headline}
${insight.contrast}
${disclaimer}`;
}

function buildResult(answers) {
  const scores = calculateUserScores(answers);
  const personaRanking = rankPersonas(scores);
  const mainPersona = personaRanking[0].persona;
  const closePersonas = personaRanking.slice(1, 3).map((item) => item.persona);
  const peopleMatches = rankPeople(scores, mainPersona);
  const dimensionInsight = buildDimensionInsight(scores, "zh");

  return {
    answers,
    scores,
    persona: mainPersona,
    camp: CAMP_META[mainPersona.camp],
    closePersonas: closePersonas.map((item) => ({
      ...item,
      reason: buildCloseTypeReason(scores, item, "zh"),
    })),
    peopleMatches,
    dimensionInsight,
    shareCopy: buildShareCopy(mainPersona, dimensionInsight, "zh"),
    createdAt: new Date().toISOString(),
  };
}

function getRadarData(scores, language) {
  return DIMENSIONS.map((dimension) => ({
    dimension: getDimensionLabel(dimension, language),
    score: Number(scores[dimension.key]),
    fullMark: 10,
  }));
}

function scrollToTop() {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#eadfce]">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#b97d59] via-[#cc9d74] to-[#d7b68b]"
        initial={false}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </div>
  );
}

function RadarPanel({ scores, language }) {
  const data = getRadarData(scores, language);
  const ui = getText(language);

  return (
    <div className={`${cardClass} p-5`}>
      <div className="mb-4">
        <h3 className="text-[20px] font-semibold text-[#2d241f]">{ui.radarTitle}</h3>
        <p className="mt-1 text-sm leading-6 text-[#7a6a5f]">{ui.radarBody}</p>
      </div>

      <div className="h-[270px] rounded-[22px] bg-[#f9f3eb]/90">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="68%">
            <PolarGrid stroke="#d9c9b8" radialLines={false} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#6b5b4f", fontSize: 12 }}
            />
            <Radar
              name="人格画像"
              dataKey="score"
              stroke="#b7704f"
              fill="#cc8e68"
              fillOpacity={0.32}
              strokeWidth={2.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {DIMENSIONS.map((dimension) => (
          <div
            key={dimension.key}
            className="rounded-[18px] border border-[#eadfce] bg-[#fffcf7] p-3"
          >
            <div className="text-xs tracking-[0.18em] text-[#9b8572]">
              {getDimensionLabel(dimension, language)}
            </div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-lg font-semibold text-[#342922]">
                {formatScore(scores[dimension.key])}
              </div>
              <div className="text-xs text-[#8a7567]">
                {scoreToTone(scores[dimension.key], language)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultExplainCard({ title, content }) {
  return (
    <div className="rounded-[24px] border border-[#eadfce] bg-[#fffcf7]/92 p-4">
      <div className="text-sm font-medium tracking-[0.14em] text-[#8d7564]">{title}</div>
      <p className="mt-2 text-[15px] leading-7 text-[#3a2f28]">{content}</p>
    </div>
  );
}

function PeopleAccordion({ peopleMatches, openMap, onToggle, language }) {
  const ui = getText(language);

  return (
    <div className={`${cardClass} p-5`}>
      <div className="mb-4">
        <h3 className="text-[20px] font-semibold text-[#2d241f]">{ui.peopleTitle}</h3>
        <p className="mt-1 text-sm leading-6 text-[#7a6a5f]">{ui.peopleBody}</p>
      </div>

      <div className="space-y-3">
        {peopleMatches.map((person) => {
          const open = Boolean(openMap[person.name]);
          const localizedPerson = getPeopleContent(person, language);
          return (
            <div
              key={person.name}
              className="overflow-hidden rounded-[24px] border border-[#eadfce] bg-[#fffcf7]"
            >
              <button
                type="button"
                onClick={() => onToggle(person.name)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[18px] font-semibold text-[#2f2721]">
                      {localizedPerson.name}
                    </div>
                    <div className="mt-1 text-sm text-[#8a7567]">{localizedPerson.shortLabel}</div>
                    <div className="mt-3 text-[15px] leading-7 text-[#43352d]">
                      {localizedPerson.likePoint}
                    </div>
                  </div>
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e4d8c8] text-[#7b6556]">
                    {open ? "−" : "+"}
                  </div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#efe4d5] px-4 pb-4 pt-4">
                      <div className="rounded-[20px] bg-[#fbf5ed] p-4">
                        <div className="text-sm leading-7 text-[#43352d]">
                          <span className="font-medium text-[#8a6a56]">{ui.peopleStory}：</span>
                          {localizedPerson.story}
                        </div>
                        <div className="mt-3 text-sm leading-7 text-[#43352d]">
                          <span className="font-medium text-[#8a6a56]">{ui.peopleKeywords}：</span>
                          {localizedPerson.keywords.join(" / ")}
                        </div>
                        <div className="mt-3 text-sm leading-7 text-[#43352d]">
                          <span className="font-medium text-[#8a6a56]">{ui.peopleHolding}：</span>
                          {localizedPerson.holdingPeriod}
                        </div>
                        <div className="mt-3 text-sm leading-7 text-[#43352d]">
                          <span className="font-medium text-[#8a6a56]">{ui.peopleRisk}：</span>
                          {localizedPerson.riskLevel}
                        </div>
                        <div className="mt-3 text-sm leading-7 text-[#43352d]">
                          <span className="font-medium text-[#8a6a56]">{ui.peopleLike}：</span>
                          {localizedPerson.likePoint}
                        </div>
                        <div className="mt-3 text-sm leading-7 text-[#43352d]">
                          <span className="font-medium text-[#8a6a56]">{ui.peopleUnlike}：</span>
                          {localizedPerson.unlikePoint}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-6 text-[#8c7868]">{ui.peopleDisclaimer}</p>
    </div>
  );
}

export default function StockMarketPersonaTest() {
  const shareCardRef = useRef(null);
  const [language, setLanguage] = useState("zh");
  const [screen, setScreen] = useState("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);
  const [openPeople, setOpenPeople] = useState({});
  const [completionCount, setCompletionCount] = useState(0);
  const [shareImageUrl, setShareImageUrl] = useState("");
  const [shareImageLoading, setShareImageLoading] = useState(false);
  const [shareImageError, setShareImageError] = useState("");
  const [sharePreviewOpen, setSharePreviewOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage === "zh" || savedLanguage === "en") {
        setLanguage(savedLanguage);
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      const savedCount = Number(window.localStorage.getItem(COUNT_STORAGE_KEY) || "0");
      setCompletionCount(Number.isFinite(savedCount) ? savedCount : 0);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed?.persona || !parsed?.scores) return;

      setResult(parsed);
      setScreen("result");
      setRestored(true);
    } catch (error) {
      console.error("restore result failed", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function startTest() {
    setScreen("question");
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setResult(null);
    setRestored(false);
    setOpenPeople({});
    setShareImageUrl("");
    setShareImageError("");
    setSharePreviewOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    scrollToTop();
  }

  function restartTest() {
    startTest();
  }

  function closeSharePreview() {
    setSharePreviewOpen(false);
  }

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage);
  }

  function handlePrevious() {
    if (selectedOption !== null || currentQuestion === 0) return;
    setCurrentQuestion((value) => Math.max(0, value - 1));
    setSelectedOption(null);
    scrollToTop();
  }

  function handleSelect(optionIndex) {
    if (selectedOption !== null) return;

    setSelectedOption(optionIndex);
    const nextAnswers = [...answers];
    nextAnswers[currentQuestion] = optionIndex;
    setAnswers(nextAnswers);

    window.setTimeout(() => {
      if (currentQuestion === QUESTIONS.length - 1) {
        const nextResult = buildResult(nextAnswers);
        setResult(nextResult);
        setScreen("result");
        setSelectedOption(null);
        setOpenPeople({});
        scrollToTop();

        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResult));
          const nextCount = completionCount + 1;
          window.localStorage.setItem(COUNT_STORAGE_KEY, String(nextCount));
          setCompletionCount(nextCount);
        }
        return;
      }

      setCurrentQuestion((value) => value + 1);
      setSelectedOption(null);
      scrollToTop();
    }, 260);
  }

  async function handleCopy() {
    if (!localizedShareCopy) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(localizedShareCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = localizedShareCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch (error) {
      console.error("copy failed", error);
    }
  }

  async function handleGenerateShareImage() {
    if (!result) return;

    setSharePreviewOpen(true);
    setShareImageLoading(true);
    setShareImageError("");
    setShareImageUrl("");

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 120));

      if (!shareCardRef.current) {
        throw new Error("share card not ready");
      }

      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: "#fbf7f0",
      });

      setShareImageUrl(dataUrl);
    } catch (error) {
      console.error("generate share image failed", error);
      setShareImageError(ui.shareImageError);
    } finally {
      setShareImageLoading(false);
    }
  }

  function handleDownloadShareImage() {
    if (!shareImageUrl) return;

    const link = document.createElement("a");
    link.href = shareImageUrl;
    link.download = SHARE_IMAGE_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function togglePerson(name) {
    setOpenPeople((current) => ({
      ...current,
      [name]: !current[name],
    }));
  }

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const activeQuestion = QUESTIONS[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const ui = getText(language);
  const localizedResultPersona = result ? getPersonaContent(result.persona, language) : null;
  const localizedResultCamp = result ? getCampContent(result.persona.camp, language) : null;
  const localizedDimensionInsight = result ? buildDimensionInsight(result.scores, language) : null;
  const localizedShareCopy =
    result && localizedDimensionInsight
      ? buildShareCopy(result.persona, localizedDimensionInsight, language)
      : "";
  const localizedPeopleMatches = result
    ? language === "en"
      ? rankPeople(result.scores, result.persona, { excludedNames: ENGLISH_EXCLUDED_PEOPLE })
      : result.peopleMatches
    : [];
  const shareImageSummary =
    localizedResultPersona?.oneLiner || localizedDimensionInsight?.contrast || "";
  const shareCardDimensions = result
    ? DIMENSIONS.map((dimension) => ({
        key: dimension.key,
        label: getDimensionShort(dimension, language),
        score: formatScore(result.scores[dimension.key]),
        value: result.scores[dimension.key],
      }))
    : [];

  return (
    <div className="min-h-screen" style={shellStyle}>
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-5">
        <LanguageToggle language={language} onChange={handleLanguageChange} />
        <AnimatePresence mode="wait">
          {screen === "intro" ? (
            <motion.section key="intro" {...fadeUp} className="space-y-4">
              <div className="relative overflow-hidden rounded-[34px] border border-[#eadfce] bg-[#fffaf3]/94 px-6 pb-7 pt-8 shadow-[0_18px_50px_rgba(98,74,49,0.08)]">
                <div className="absolute -left-8 top-0 h-28 w-28 rounded-full bg-[#e3c3a2]/30 blur-2xl" />
                <div className="absolute right-0 top-10 h-24 w-24 rounded-full bg-[#b7c1ab]/25 blur-2xl" />

                <div className="relative">
                  <div className="inline-flex rounded-full border border-[#e5d8c8] bg-[#fbf4eb] px-3 py-1 text-xs tracking-[0.18em] text-[#8c7463]">
                    {ui.appBadge}
                  </div>

                  <h1
                    className="mt-5 text-[36px] font-semibold leading-[1.18] tracking-[-0.03em] text-[#2d241f]"
                    style={titleStyle}
                  >
                    {ui.appTitle}
                  </h1>

                  <p className="mt-4 text-[16px] leading-8 text-[#4a3d35]">
                    {ui.appIntro}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[#6f5e53]">
                    <div className="rounded-[20px] border border-[#eadfce] bg-[#fffcf7] p-4">
                      {ui.statQuestions}
                    </div>
                    <div className="rounded-[20px] border border-[#eadfce] bg-[#fffcf7] p-4">
                      {ui.statPersonas}
                    </div>
                    <div className="rounded-[20px] border border-[#eadfce] bg-[#fffcf7] p-4">
                      {ui.statCamps}
                    </div>
                    <div className="rounded-[20px] border border-[#eadfce] bg-[#fffcf7] p-4">
                      {ui.statShare}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[22px] border border-[#e8ddd0] bg-[#f7efe3] p-4 text-sm leading-7 text-[#6b5a4d]">
                    {language === "en" ? "Completed on this device " : "本机已完成测试 "}
                    <span className="font-semibold text-[#2f2721]">{completionCount}</span>
                    {language === "en" ? " times" : " 次"}
                  </div>

                  {restored ? (
                    <div className="mt-5 rounded-[22px] border border-[#e8ddd0] bg-[#f7efe3] p-4 text-sm leading-7 text-[#6b5a4d]">
                      {ui.restoredIntro}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={startTest}
                    className="mt-6 w-full rounded-[22px] bg-[#2f2721] px-5 py-4 text-[16px] font-medium text-[#f8f2e8] transition hover:translate-y-[-1px] hover:bg-[#241d18]"
                  >
                    {ui.startTest}
                  </button>
                </div>
              </div>

              <div className={`${cardClass} p-5`}>
                <div className="text-sm tracking-[0.16em] text-[#8e7766]">{ui.notAdviceTitle}</div>
                <p className="mt-3 text-[15px] leading-7 text-[#41342d]">{ui.notAdviceBody}</p>
              </div>

              <p className="px-1 text-center text-xs leading-6 text-[#8c7868]">
                {ui.disclaimer}
              </p>
            </motion.section>
          ) : null}

          {screen === "question" && activeQuestion ? (
            <motion.section key={`question-${currentQuestion}`} {...fadeUp} className="space-y-4">
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center justify-between text-sm text-[#846f61]">
                  <span>{ui.questionProgress(currentQuestion + 1, QUESTIONS.length)}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-3">
                  <ProgressBar value={progress} />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] border border-[#eadfce] bg-[#fffaf3]/94 p-6 shadow-[0_16px_46px_rgba(111,86,57,0.08)]">
                <div className="absolute -right-7 top-0 h-24 w-24 rounded-full bg-[#e6cfb1]/35 blur-2xl" />
                <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-[#c6d0b8]/25 blur-2xl" />
                <div className="relative">
                  <div className="text-xs tracking-[0.18em] text-[#9d8775]">{ui.questionHint}</div>
                  <h2 className="mt-4 text-[28px] font-semibold leading-[1.45] text-[#2f2721]">
                    {getQuestionPrompt(activeQuestion, language)}
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {activeQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCurrentAnswer = selectedOption === null && currentAnswer === index;
                  const isLocked = selectedOption !== null && !isSelected;
                  return (
                    <motion.button
                      key={`${activeQuestion.id}-${index}`}
                      type="button"
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelect(index)}
                      className={`w-full rounded-[24px] border p-4 text-left transition ${
                        isSelected || isCurrentAnswer
                          ? "border-[#c98e69] bg-[#f7e7d7] shadow-[0_10px_28px_rgba(188,125,82,0.14)]"
                          : "border-[#eadfce] bg-[#fffcf7] hover:border-[#dbc6b0] hover:bg-[#fff8ef]"
                      } ${isLocked ? "opacity-55" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                            isSelected || isCurrentAnswer
                              ? "border-[#b7704f] bg-[#b7704f] text-white"
                              : "border-[#dbcbb7] text-[#8e7766]"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <div className="text-[16px] leading-7 text-[#372c26]">
                          {getQuestionOptionText(activeQuestion, option, index, language)}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || selectedOption !== null}
                  className="w-full rounded-[20px] border border-[#d8c9b7] bg-[#fffaf3] px-4 py-3 text-sm font-medium text-[#3e332c] transition disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {ui.previousQuestion}
                </button>
              </div>

              <p className="px-1 text-center text-xs leading-6 text-[#8c7868]">
                {ui.disclaimer}
              </p>
            </motion.section>
          ) : null}

          {screen === "result" && result ? (
            <motion.section key="result" {...fadeUp} className="space-y-4">
              <div className="relative overflow-hidden rounded-[34px] border border-[#e6daca] bg-[#fff8ef]/95 p-6 shadow-[0_18px_54px_rgba(111,86,57,0.1)]">
                <div className="absolute -left-8 top-4 h-24 w-24 rounded-full bg-[#d9b18a]/26 blur-2xl" />
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#b8c3ab]/24 blur-2xl" />

                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#e4d5c3] bg-[#f8f0e4] px-3 py-1 text-xs tracking-[0.16em] text-[#8f7665]">
                      {ui.campIs}
                      {localizedResultCamp?.label}
                    </span>
                    <span className="rounded-full border border-[#e4d5c3] bg-[#f8f0e4] px-3 py-1 text-xs tracking-[0.16em] text-[#8f7665]">
                      {ui.mainResult}
                    </span>
                  </div>

                  <div className="mt-5 rounded-[28px] bg-gradient-to-br from-[#f6ebdc] via-[#fff8ef] to-[#f2e3d1] p-5">
                    <div className="text-xs tracking-[0.2em] text-[#9b8572]">{ui.appBadge}</div>
                    <h2
                      className="mt-3 text-[34px] font-semibold leading-[1.15] text-[#2f2721]"
                      style={titleStyle}
                    >
                      {localizedResultPersona?.name}
                    </h2>
                    <p className="mt-2 text-[15px] leading-7 text-[#7a675a]">
                      {localizedResultPersona?.subtitle}
                    </p>

                    <div className="mt-5 rounded-[22px] border border-[#eadbc9] bg-[#fffdf9]/86 p-4">
                      <div className="text-[15px] leading-7 text-[#4a3d35]">
                        {localizedResultPersona?.description}
                      </div>
                      <div className="mt-3 rounded-[16px] bg-[#f7efe3] px-3 py-3 text-sm leading-7 text-[#3a2f28]">
                        {localizedResultPersona?.oneLiner}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-[20px] border border-[#eadbc9] bg-[#fffdf9]/86 p-4">
                        <div className="text-xs tracking-[0.16em] text-[#907968]">{ui.campLabel}</div>
                        <div className="mt-2 text-lg font-semibold text-[#2f2721]">
                          {localizedResultCamp?.label}
                        </div>
                      </div>
                      <div className="rounded-[20px] border border-[#eadbc9] bg-[#fffdf9]/86 p-4">
                        <div className="text-xs tracking-[0.16em] text-[#907968]">{ui.summaryLabel}</div>
                        <div className="mt-2 text-sm leading-6 text-[#3b3028]">
                          {localizedDimensionInsight?.contrast}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[24px] border border-[#eadfce] bg-[#fffcf7] p-4">
                    <div className="text-sm font-medium tracking-[0.14em] text-[#8d7564]">
                      {ui.campDescriptionTitle}
                    </div>
                    <p className="mt-2 text-[15px] leading-7 text-[#3a2f28]">
                      {localizedResultCamp?.description}
                    </p>
                  </div>

                  {restored ? (
                    <div className="mt-4 rounded-[18px] bg-[#f6efe4] px-4 py-3 text-sm text-[#7d6a5d]">
                      {ui.restoredResult}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={`${cardClass} p-5`}>
                <div className="text-sm font-medium tracking-[0.14em] text-[#8d7564]">{ui.dimensionSummaryTitle}</div>
                <p className="mt-3 text-[18px] font-semibold leading-8 text-[#2f2721]">
                  {localizedDimensionInsight?.headline}
                </p>
                <p className="mt-2 text-[15px] leading-7 text-[#43352d]">
                  {localizedDimensionInsight?.insight}
                </p>
                <p className="mt-2 text-[15px] leading-7 text-[#6f5d51]">
                  {localizedDimensionInsight?.contrast}
                </p>
              </div>

              <RadarPanel scores={result.scores} language={language} />

              <div className={`${cardClass} p-5`}>
                <h3 className="text-[20px] font-semibold text-[#2d241f]">{ui.whySectionTitle}</h3>
                <div className="mt-4 grid gap-3">
                  <ResultExplainCard title={ui.whyMatch} content={localizedResultPersona?.whyMatch} />
                  <ResultExplainCard title={ui.behavior} content={localizedResultPersona?.typicalBehavior} />
                  <ResultExplainCard title={ui.weakness} content={localizedResultPersona?.weakness} />
                  <ResultExplainCard title={ui.talent} content={localizedResultPersona?.hiddenTalent} />
                  <ResultExplainCard title={ui.bestMarket} content={localizedResultPersona?.bestMarket} />
                  <ResultExplainCard title={ui.badMarket} content={localizedResultPersona?.badMarket} />
                </div>
              </div>

              <div className={`${cardClass} p-5`}>
                <div className="mb-4">
                  <h3 className="text-[20px] font-semibold text-[#2d241f]">{ui.closeTypesTitle}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#7a6a5f]">{ui.closeTypesBody}</p>
                </div>
                <div className="space-y-3">
                  {result.closePersonas.map((persona) => (
                    <div
                      key={persona.name}
                      className="rounded-[24px] border border-[#eadfce] bg-[#fffcf7] p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[18px] font-semibold text-[#2f2721]">
                            {getPersonaContent(persona, language).name}
                          </div>
                          <div className="mt-1 text-sm text-[#8a7567]">
                            {getPersonaContent(persona, language).subtitle}
                          </div>
                        </div>
                        <div className="rounded-full bg-[#f4eadc] px-3 py-1 text-xs tracking-[0.16em] text-[#8c7463]">
                          {getCampContent(persona.camp, language).label}
                        </div>
                      </div>
                      <p className="mt-3 text-[15px] leading-7 text-[#43352d]">
                        {localizeCloseTypeNames(buildCloseTypeReason(result.scores, persona, language), language)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <PeopleAccordion
                peopleMatches={localizedPeopleMatches}
                openMap={openPeople}
                onToggle={togglePerson}
                language={language}
              />

              <div className={`${cardClass} p-5`}>
                <div className="mb-4">
                  <h3 className="text-[20px] font-semibold text-[#2d241f]">{ui.shareTitle}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#7a6a5f]">{ui.shareBody}</p>
                </div>

                <div className="rounded-[24px] border border-[#eadfce] bg-[#fbf5ed] p-4">
                  <p className="whitespace-pre-line text-[15px] leading-7 text-[#3b3028]">
                    {localizedShareCopy}
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleGenerateShareImage}
                    disabled={shareImageLoading}
                    className="w-full rounded-[20px] bg-[#b97d59] px-4 py-3 text-sm font-medium text-[#fffaf3] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {shareImageLoading ? ui.generatingShareImage : ui.generateShareImage}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-[20px] bg-[#2f2721] px-4 py-3 text-sm font-medium text-[#f8f2e8]"
                  >
                    {copied ? ui.copied : ui.copyShare}
                  </button>
                  <button
                    type="button"
                    onClick={restartTest}
                    className="rounded-[20px] border border-[#d8c9b7] bg-[#fffaf3] px-4 py-3 text-sm font-medium text-[#3e332c]"
                  >
                    {ui.restart}
                  </button>
                </div>
              </div>

              <p className="px-1 text-center text-xs leading-6 text-[#8c7868]">
                {ui.disclaimer}
              </p>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>

      {result ? (
        <div className="pointer-events-none fixed left-[-9999px] top-0 z-[-1] opacity-0" aria-hidden>
          <ShareImageCard
            ref={shareCardRef}
            title="股市人格测试"
            titleEn={language === "en" ? "Stock Market Persona Test" : ""}
            personaName={localizedResultPersona?.name}
            summary={shareImageSummary}
            campLabel={ui.campLabel}
            campName={localizedResultCamp?.label}
            dimensionTitle={language === "en" ? "Six dimensions" : "六维人格"}
            dimensions={shareCardDimensions}
            qrUrl={SHARE_TARGET_URL}
            footerCta={
              language === "en"
                ? "Scan to see what kind of person you are in the stock market"
                : "扫码测测你进 A 股像什么人"
            }
            footerDisclaimer={
              language === "en"
                ? "This test is for entertainment only and does not constitute investment advice"
                : "本测试仅供娱乐，不构成任何投资建议"
            }
            websiteLabel={SHARE_TARGET_URL}
          />
        </div>
      ) : null}

      <ShareImagePreviewModal
        open={sharePreviewOpen}
        imageUrl={shareImageUrl}
        loading={shareImageLoading}
        error={shareImageError}
        title={ui.sharePreviewTitle}
        loadingText={ui.generatingShareImage}
        saveText={ui.saveImage}
        closeText={ui.close}
        onClose={closeSharePreview}
        onDownload={handleDownloadShareImage}
      />
    </div>
  );
}
