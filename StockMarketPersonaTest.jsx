import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toJpeg } from "html-to-image";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { ShareLongImage } from "./components/ShareLongImage";
import ShareImagePreviewModal from "./components/ShareImagePreviewModal";
import { SHARE_IMAGE_FILENAME, SHARE_TARGET_URL } from "./constants/share";

const STORAGE_KEY = "stock-persona-test-result-v1";
const COUNT_STORAGE_KEY = "stock-persona-test-completion-count-v1";
const LANGUAGE_STORAGE_KEY = "stock-persona-test-language-v1";

const DIMENSIONS = [
  { key: "rush", label: "决策速度", labelEn: "Decision Speed", short: "速度", shortEn: "Speed" },
  { key: "fomo", label: "机会敏感", labelEn: "Opportunity Drive", short: "机会", shortEn: "Opportunity" },
  { key: "risk", label: "风险承受", labelEn: "Risk Tolerance", short: "风险", shortEn: "Risk" },
  { key: "discipline", label: "纪律执行", labelEn: "Discipline", short: "纪律", shortEn: "Discipline" },
  { key: "patience", label: "持有周期", labelEn: "Holding Horizon", short: "周期", shortEn: "Horizon" },
  { key: "contrarian", label: "风格弹性", labelEn: "Style Flexibility", short: "弹性", shortEn: "Flexibility" },
];

const CAMP_META = {
  系统派: {
    label: "系统派",
    labelEn: "System Camp",
    description: "你更相信规则、框架和可复用的方法，交易更像在执行系统，而不是追逐情绪。",
    descriptionEn:
      "You trust rules, structure and repeatable methods. Trading feels more like running a system than chasing emotion.",
    accent: "from-[#7d8d77] to-[#596453]",
  },
  价值派: {
    label: "价值派",
    labelEn: "Value Camp",
    description: "你更重视研究、耐心和本金安全，宁可显得慢一点，也不愿被市场节奏随便拽走。",
    descriptionEn:
      "You care more about research, patience and capital protection. You would rather look slow than get dragged around by market speed.",
    accent: "from-[#8a7d70] to-[#64584f]",
  },
  进攻派: {
    label: "进攻派",
    labelEn: "Action Camp",
    description: "你对波动、机会和出手时机更敏感，愿意为速度和赔率承担更高风险。",
    descriptionEn:
      "You are more sensitive to volatility, opportunity and timing, and more willing to take risk in exchange for speed and upside.",
    accent: "from-[#c6865e] to-[#9b5e43]",
  },
  事件派: {
    label: "事件派",
    labelEn: "Catalyst Camp",
    description: "你会围绕新闻、催化剂和市场新叙事寻找机会，变化本身就是你的信号源。",
    descriptionEn:
      "You hunt around news, catalysts and fresh narratives. Change itself is one of your main signal sources.",
    accent: "from-[#b49364] to-[#8f6b3f]",
  },
  情绪派: {
    label: "情绪派",
    labelEn: "Emotion Camp",
    description: "你和市场情绪的耦合度更高，热度、波动和群体反应很容易直接影响你的判断。",
    descriptionEn:
      "You are more tightly coupled to market emotion. Heat, volatility and crowd reaction can influence your decisions directly.",
    accent: "from-[#b56f5f] to-[#8a4f43]",
  },
};

const UI_TEXT = {
  zh: {
    langZh: "中文",
    langEn: "EN",
    appBadge: "Trading Personality Quiz",
    appTitle: "交易人格测试",
    appIntro:
      "这套测试会根据你的习惯、直觉和决策方式，试着还原你真实的交易人格。这里没有标准答案，只有更诚实的答案。",
    statQuestions: "16 道题",
    statPersonas: "10 种结果",
    statCamps: "5 个阵营",
    statShare: "支持分享截图",
    completionCount: (count) => `本机已完成测试 ${count} 次`,
    restoredIntro:
      "已恢复你上次的测试结果。你也可以直接重新测一遍，看今天的交易人格有没有变化。",
    startTest: "开始测试",
    notAdviceTitle: "这不是投资建议工具",
    notAdviceBody:
      "它不是专业交易测评，也不负责告诉你该买什么。它只会把你在真实交易里的情绪反应、风险偏好、节奏习惯和行为倾向，映射成一个更适合分享和截图传播的“交易人格”。",
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
    radarTitle: "六维交易人格图",
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
    appBadge: "Trading Personality Quiz",
    appTitle: "Trading Personality Quiz",
    appIntro:
      "This quiz is designed to uncover your real trading personality through your habits, instincts, and decision-making style. There are no perfect answers here, just honest ones.",
    statQuestions: "16 questions",
    statPersonas: "10 result types",
    statCamps: "5 camps",
    statShare: "Made for screenshots",
    completionCount: (count) => `Completed on this device ${count} times`,
    restoredIntro:
      "Your last result has been restored. You can also retake the quiz and see whether today's trading personality feels different.",
    startTest: "Start Test",
    notAdviceTitle: "Not an Investment Tool",
    notAdviceBody:
      "This is not a professional trading assessment and it does not tell you what to buy. It simply maps your emotional reactions, risk preference, timing habits and behavior patterns into a more shareable trading personality.",
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
    name: "基金经理",
    subtitle: "冷静、成体系，而且有点过分理性",
    camp: "系统派",
    oneLiner: "你更在意过程、风控和一致性，而不是一次交易到底够不够刺激。",
    description:
      "你做交易时天然会先想风险预算、组合结构和回撤容忍，而不是只盯着某一个机会够不够热。",
    whyMatch:
      "你的纪律和持有周期都偏高，决策速度不算快，更像一个先做尽调、再决定配置的人。",
    typicalBehavior:
      "先看框架、再看赔率；仓位控制和风控边界往往比单次买卖点更重要。",
    weakness:
      "在爆发式行情里容易显得慢半拍，等一切都看清楚时，最肥的一段可能已经走完了。",
    hiddenTalent:
      "你擅长把交易做成可长期复用的流程，这种稳定感本身就是稀缺能力。",
    bestMarket: "结构清晰、节奏稳定、基本面和价格行为能互相验证的环境。",
    badMarket: "纯情绪驱动、日内剧烈切换、靠抢反应吃肉的躁动市场。",
    shareText:
      "测出来是基金经理。市场可以很热，但我还是会先算回撤，再决定要不要参与。",
    scores: {
      rush: 2,
      fomo: 3,
      risk: 3,
      discipline: 9,
      patience: 8,
      contrarian: 4,
    },
    closeTypes: ["保守配置者", "趋势跟随者"],
    peopleMatches: ["张磊", "雷·达里奥", "李嘉诚"],
  },
  {
    name: "价值投资者",
    subtitle: "愿意等、愿意研究，也愿意忍受无聊",
    camp: "价值派",
    oneLiner: "你相信耐心会得到回报，价格噪音不值得你每次都跟着起舞。",
    description:
      "你更愿意把时间花在研究价值、理解定价和等待更合适的位置上，而不是追逐每一次短期情绪波动。",
    whyMatch:
      "你的持有周期明显更长，纪律和耐心也偏高，说明你更像一个愿意为逻辑等待的人。",
    typicalBehavior:
      "看研究、看估值、看长期逻辑；不急着天天出手，更在意自己买到的是不是合理价格。",
    weakness:
      "有时会过于坚持自己的研究判断，低估市场在短中期持续偏离的能力。",
    hiddenTalent:
      "你能在喧闹市场里保留独立判断，这种不被噪音牵着走的能力非常值钱。",
    bestMarket: "逻辑能慢慢兑现、市场愿意给时间验证基本面的环境。",
    badMarket: "全靠情绪推动、消息一来就改叙事的高波动阶段。",
    shareText:
      "测出来是价值投资者。我不是懒得动，我只是更相信研究和耐心，而不是市场一天一个态度。",
    scores: {
      rush: 1,
      fomo: 2,
      risk: 4,
      discipline: 8,
      patience: 10,
      contrarian: 5,
    },
    closeTypes: ["保守配置者", "基金经理"],
    peopleMatches: ["巴菲特", "芒格", "李录"],
  },
  {
    name: "趋势跟随者",
    subtitle: "你不预测一切，你只想在趋势启动后搭上车",
    camp: "系统派",
    oneLiner: "你不需要永远买在最低点，你更在意一旦趋势成立，自己能不能跟得上。",
    description:
      "你更相信价格行为和趋势延续，而不是提前猜拐点。只要市场已经走出来，你愿意顺着它做。",
    whyMatch:
      "你的机会敏感和纪律都不低，说明你既愿意跟随趋势，也会尽量用规则约束自己的节奏。",
    typicalBehavior:
      "看突破、看跟随、看趋势是否延续；一旦确认方向，你更愿意顺势而为。",
    weakness:
      "横盘和假突破会让你很难受，来回试错时，你会明显感觉效率下降。",
    hiddenTalent:
      "你能把交易从“讲故事”拉回到“跟随事实”，这让你在好趋势里往往更稳定。",
    bestMarket: "趋势清晰、方向一致、价格会自己证明自己的阶段。",
    badMarket: "震荡反复、假信号密集、趋势总在半路失效的环境。",
    shareText:
      "测出来是趋势跟随者。我不一定想猜未来，但只要趋势确认了，我就想跟上那一段。",
    scores: {
      rush: 6,
      fomo: 7,
      risk: 6,
      discipline: 8,
      patience: 5,
      contrarian: 2,
    },
    closeTypes: ["事件驱动交易者", "激进投机者"],
    peopleMatches: ["保罗·都铎·琼斯", "索罗斯", "大卫·泰珀"],
  },
  {
    name: "量化交易员",
    subtitle: "相信数据、规则和可重复性，胜过相信灵感",
    camp: "系统派",
    oneLiner: "与其争论叙事，你更愿意先验证策略能不能重复成立。",
    description:
      "你偏爱逻辑、数据和结构化方法。你对“感觉不错”这种理由天然不太放心，更想知道样本和纪律站不站得住。",
    whyMatch:
      "你的纪律维度很高，决策节奏不算莽，说明你更像先定义规则、再让执行服务规则的人。",
    typicalBehavior:
      "重视回测、记录、复盘和一致性；比起临场拍脑袋，你更相信流程和边界。",
    weakness:
      "一旦市场进入极端情绪化状态，纯靠系统可能会显得慢，甚至有点钝。",
    hiddenTalent:
      "你最大的优势不是一次神来之笔，而是能把好决策变成可复用的长期资产。",
    bestMarket: "样本有效、噪音可控、策略可以重复发挥的市场环境。",
    badMarket: "风格突变、情绪极端、市场不给模型留缓冲的阶段。",
    shareText:
      "测出来是量化交易员。相信感觉之前，我更想先看数据。能复现，才算数。",
    scores: {
      rush: 3,
      fomo: 2,
      risk: 4,
      discipline: 10,
      patience: 6,
      contrarian: 4,
    },
    closeTypes: ["基金经理", "趋势跟随者"],
    peopleMatches: ["詹姆斯·西蒙斯", "爱德华·索普", "雷·达里奥"],
  },
  {
    name: "事件驱动交易者",
    subtitle: "你交易的不是蜡烛本身，而是背后的催化剂",
    camp: "事件派",
    oneLiner: "你对新闻、政策、财报和主题变化很敏感，机会常常在催化剂里冒出来。",
    description:
      "你会先问市场为什么要动，而不是只问它动了多少。新的信息、主题和事件变化，本来就是你最自然的观察入口。",
    whyMatch:
      "你的机会敏感和风格弹性偏高，说明你更愿意围绕新催化和变化本身去寻找不对称机会。",
    typicalBehavior:
      "盯财报、盯政策、盯大新闻和主题轮动；一旦看到催化，你会快速判断它是不是刚刚开始发酵。",
    weakness:
      "最怕消息只响一声就没了，或者你把一次性噪音误判成长期催化。",
    hiddenTalent:
      "你对市场注意力如何转移有很强体感，只要控制节奏，很容易比别人早一步看到新方向。",
    bestMarket: "催化密集、主题清晰、预期差能快速兑现的阶段。",
    badMarket: "新闻很多但持续性很差、一天一个故事的噪音型环境。",
    shareText:
      "测出来是事件驱动交易者。我交易的不只是价格，我更在意是什么事情让价格开始移动。",
    scores: {
      rush: 7,
      fomo: 8,
      risk: 7,
      discipline: 5,
      patience: 4,
      contrarian: 7,
    },
    closeTypes: ["灵活机会主义者", "激进投机者"],
    peopleMatches: ["索罗斯", "大卫·泰珀", "约翰·保尔森"],
  },
  {
    name: "日内剥头皮选手",
    subtitle: "手快、眼快、压力也来得快",
    camp: "进攻派",
    oneLiner: "你想要的是动作、精度和即时反馈，太慢的机会会让你失去兴趣。",
    description:
      "你偏爱短周期博弈，注意力更集中在盘口节奏、短线波动和执行效率上，而不是长逻辑慢兑现。",
    whyMatch:
      "你的决策速度、机会敏感和风险承受都偏高，同时持有周期明显偏短，这就是很典型的快节奏交易画像。",
    typicalBehavior:
      "看盘、试单、快进快出；你更在意当下有没有可做的波动，而不是一笔单子能拿几个月。",
    weakness:
      "频率高的时候，情绪和疲劳会一起抬头，判断很容易在连续博弈里变形。",
    hiddenTalent:
      "你对即时反馈非常敏感，只要纪律顶住，短周期执行力会是你的核心优势。",
    bestMarket: "成交活跃、波动充足、节奏清楚的短线环境。",
    badMarket: "低波动、无节奏、拉不开空间的沉闷市场。",
    shareText:
      "测出来是日内剥头皮选手。我要的不是遥远的大逻辑，我要的是现在这一段波动到底做不做。",
    scores: {
      rush: 10,
      fomo: 8,
      risk: 7,
      discipline: 5,
      patience: 1,
      contrarian: 4,
    },
    closeTypes: ["激进投机者", "事件驱动交易者"],
    peopleMatches: ["保罗·都铎·琼斯", "索罗斯", "大卫·泰珀"],
  },
  {
    name: "保守配置者",
    subtitle: "先保护资本，再谈收益弹性",
    camp: "价值派",
    oneLiner: "你首先关心的是别亏大钱，而不是别人今天又赚到了多少。",
    description:
      "你对本金安全、仓位分散和波动控制非常敏感。对你来说，睡得着觉本身也是交易体验的一部分。",
    whyMatch:
      "你的纪律和持有周期偏高，风险承受偏低，说明你并不追求每次都打满，而是更偏向长期稳定。",
    typicalBehavior:
      "控制仓位、分散风险、优先考虑防守；在机会不够干净的时候宁可继续等待。",
    weakness:
      "太注重安全边际时，容易把所有激进收益都让给别人，结果长期回报偏保守。",
    hiddenTalent:
      "你很擅长活下来，而且活得稳。很多人忽略了，长期留在市场里本身就是一种能力。",
    bestMarket: "可以慢慢积累、回撤可控、收益来自稳定配置的环境。",
    badMarket: "单边疯涨、风格极端偏激、所有人都在拼杠杆和节奏的市场。",
    shareText:
      "测出来是保守配置者。别人先想赚多少，我先想这一段有没有必要把自己暴露在太大的风险里。",
    scores: {
      rush: 1,
      fomo: 2,
      risk: 2,
      discipline: 8,
      patience: 9,
      contrarian: 3,
    },
    closeTypes: ["基金经理", "价值投资者"],
    peopleMatches: ["李嘉诚", "格雷厄姆", "张磊"],
  },
  {
    name: "激进投机者",
    subtitle: "信念大、波动大、后果也大",
    camp: "进攻派",
    oneLiner: "只要你觉得赔率站在自己这边，就愿意让一笔交易真正“有感觉”。",
    description:
      "你对大波动并不天然抗拒，甚至会觉得只有足够大的波动，才配得上真正的收益空间。",
    whyMatch:
      "你的风险承受和决策速度都不低，仓位和回撤容忍也更激进，说明你愿意为高收益承担明显代价。",
    typicalBehavior:
      "机会一旦看对，往往不只想象征性参与，而是希望这笔交易足够有分量。",
    weakness:
      "判断一旦失误，损失放大的速度也会比别人快。你的上限高，回撤也同样真实。",
    hiddenTalent:
      "你天生不怕承担结果，这会让你在真正的高赔率机会面前比大多数人更有行动力。",
    bestMarket: "方向明确、赔率拉开、胜负空间很大的阶段。",
    badMarket: "噪音太多、胜率不稳、每一步都在赌情绪的混乱环境。",
    shareText:
      "测出来是激进投机者。要做就想做得有感觉，问题是大收益和大回撤往往也一起出现。",
    scores: {
      rush: 8,
      fomo: 7,
      risk: 10,
      discipline: 4,
      patience: 4,
      contrarian: 6,
    },
    closeTypes: ["日内剥头皮选手", "事件驱动交易者"],
    peopleMatches: ["索罗斯", "卡尔·伊坎", "比尔·阿克曼"],
  },
  {
    name: "天然散户受害者",
    subtitle: "市场大概已经给你上过几次昂贵的人性课了",
    camp: "情绪派",
    oneLiner: "你容易被情绪、热度和短期波动带着走，规则常常在最需要的时候失效。",
    description:
      "你不是完全没有判断力，而是实战里太容易被 FOMO、恐惧和即时波动打乱节奏，最后做出和计划不同的动作。",
    whyMatch:
      "你的机会敏感很高，但纪律和持有稳定性偏弱，这让你容易在最热和最慌的时候做出最情绪化的选择。",
    typicalBehavior:
      "涨了想追、跌了不舍得砍、回头复盘又觉得自己本来不是这么计划的。",
    weakness:
      "会在短时间里反复被市场牵着跑，最贵的不是亏钱本身，而是总在重复同一种错。",
    hiddenTalent:
      "只要能把情绪延迟半拍，你对市场热度和变化的感知其实并不差。",
    bestMarket: "简单、强趋势、对错一眼能分清的环境。",
    badMarket: "情绪拉扯、消息反复、最容易诱发追涨杀跌的市场。",
    shareText:
      "测出来是天然散户受害者。不是没想法，是每次一热一慌，手就容易先替脑子做决定。",
    scores: {
      rush: 8,
      fomo: 10,
      risk: 7,
      discipline: 2,
      patience: 3,
      contrarian: 5,
    },
    closeTypes: ["激进投机者", "灵活机会主义者"],
    peopleMatches: ["比尔·阿克曼", "索罗斯", "大卫·泰珀"],
  },
  {
    name: "灵活机会主义者",
    subtitle: "你不忠于某一种风格，你只忠于当下有效的东西",
    camp: "事件派",
    oneLiner: "你不会把自己绑死在某个标签上，市场怎么变，你就更愿意怎么调。",
    description:
      "你不太迷信单一方法。趋势能做趋势，事件能做事件，环境一变，你的第一反应往往不是死扛，而是调整。",
    whyMatch:
      "你的风格弹性是最突出的维度之一，同时风险承受和机会敏感也不低，这让你更像一个会随环境切换打法的人。",
    typicalBehavior:
      "会根据市场阶段切换持仓周期、交易理由和执行节奏，不太愿意被某种教条困住。",
    weakness:
      "灵活的另一面是边界模糊。切换过快时，很容易把“适应”做成“没有稳定锚点”。",
    hiddenTalent:
      "你很少被某一种旧叙事困死，这让你在风格切换频繁的市场里更容易保有行动空间。",
    bestMarket: "风格切换快、机会分散、单一方法容易失效的市场。",
    badMarket: "单一主线极强、只奖励一种打法的纯风格市场。",
    shareText:
      "测出来是灵活机会主义者。我不忠于某一种风格，我只忠于现在什么还有效。",
    scores: {
      rush: 6,
      fomo: 7,
      risk: 7,
      discipline: 5,
      patience: 5,
      contrarian: 10,
    },
    closeTypes: ["事件驱动交易者", "趋势跟随者"],
    peopleMatches: ["雷·达里奥", "索罗斯", "大卫·泰珀"],
  },
];

const PEOPLE = [
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

const QUESTIONS = [
  {
    id: 1,
    prompt: "当你看到一个高风险、高回报的机会时，你通常的反应是：",
    options: [
      { text: "我会兴奋，而且愿意出手试一把", weights: { rush: 2, fomo: 2, risk: 3 } },
      { text: "我会考虑，但会比较谨慎", weights: { discipline: 2, risk: 1, patience: 1 } },
      { text: "我更愿意先观望，不急着参与", weights: { discipline: 2, patience: 2 } },
    ],
  },
  {
    id: 2,
    prompt: "你通常会把一笔仓位拿多久？",
    options: [
      { text: "日内进出，甚至当天解决", weights: { rush: 3, fomo: 1 } },
      { text: "几天到两周左右", weights: { patience: 2, discipline: 1, fomo: 1 } },
      { text: "几个月以上，甚至更久", weights: { patience: 4, discipline: 2 } },
    ],
  },
  {
    id: 3,
    prompt: "市场突然加速时，你通常怎么做决定？",
    options: [
      { text: "很快，几乎靠直觉就会动", weights: { rush: 3, risk: 1, fomo: 1 } },
      { text: "先看一会儿，再决定要不要上", weights: { rush: 1, discipline: 2, fomo: 1 } },
      { text: "我需要更多时间分析，不能太快", weights: { discipline: 2, patience: 2 } },
    ],
  },
  {
    id: 4,
    prompt: "你会在进场前先设止损吗？",
    options: [
      { text: "会，而且我通常会严格执行", weights: { discipline: 4 } },
      { text: "有时会，看具体情况", weights: { discipline: 2, risk: 1 } },
      { text: "很少，或者几乎不设", weights: { risk: 2, rush: 1, fomo: 1 } },
    ],
  },
  {
    id: 5,
    prompt: "你通常怎么控制仓位大小？",
    options: [
      { text: "小仓、控制住风险", weights: { discipline: 3, patience: 1 } },
      { text: "中等仓位，尽量平衡一些", weights: { discipline: 1, risk: 1, patience: 1 } },
      { text: "我会下重仓，想让这笔交易有分量", weights: { risk: 3, rush: 1 } },
    ],
  },
  {
    id: 6,
    prompt: "你怎么看待杠杆？",
    options: [
      { text: "我接受，而且知道怎么控风险", weights: { risk: 2, rush: 1, discipline: 1 } },
      { text: "偶尔会用，但不会太依赖", weights: { risk: 1 } },
      { text: "我尽量避免", weights: { discipline: 1, patience: 1 } },
    ],
  },
  {
    id: 7,
    prompt: "连续亏几笔以后，你通常是什么状态？",
    options: [
      { text: "还算冷静，继续按计划来", weights: { discipline: 3, patience: 1 } },
      { text: "会有点焦虑，但还能尽量理性", weights: { discipline: 1, fomo: 1 } },
      { text: "容易烦躁，甚至开始情绪化乱动", weights: { rush: 2, fomo: 2, risk: 1 } },
    ],
  },
  {
    id: 8,
    prompt: "你交易得有多频繁？",
    options: [
      { text: "非常频繁，几乎天天都在做", weights: { rush: 3, fomo: 2, risk: 1 } },
      { text: "一周做几次", weights: { rush: 1, fomo: 1, risk: 1 } },
      { text: "偶尔做一下", weights: { patience: 2, discipline: 1 } },
      { text: "很少，甚至长时间都不动", weights: { patience: 3, discipline: 2 } },
    ],
  },
  {
    id: 9,
    prompt: "你最依赖哪类信息？",
    options: [
      { text: "基本面，比如财报、宏观数据", weights: { discipline: 2, patience: 2 } },
      { text: "图表、走势和技术指标", weights: { discipline: 2, rush: 1 } },
      { text: "新闻、主题和重大事件", weights: { fomo: 2, rush: 1, contrarian: 1 } },
      { text: "数据模型和系统化分析", weights: { discipline: 3, contrarian: 1 } },
    ],
  },
  {
    id: 10,
    prompt: "哪种策略最像你的风格？",
    options: [
      { text: "价值投资 / 基本面研究", weights: { patience: 3, discipline: 2 } },
      { text: "趋势跟随", weights: { discipline: 2, rush: 1, risk: 1 } },
      { text: "事件驱动", weights: { fomo: 2, contrarian: 1, risk: 1 } },
      { text: "量化 / 算法交易", weights: { discipline: 3, contrarian: 1 } },
    ],
  },
  {
    id: 11,
    prompt: "你会写交易日志、复盘交易吗？",
    options: [
      { text: "会，而且我做得比较持续", weights: { discipline: 3 } },
      { text: "偶尔会", weights: { discipline: 1 } },
      { text: "基本没有", weights: { rush: 1, fomo: 1 } },
    ],
  },
  {
    id: 12,
    prompt: "你的持仓通常有多集中？",
    options: [
      { text: "我更喜欢少数几笔重点仓位", weights: { risk: 2, discipline: 1 } },
      { text: "中等分散，尽量平衡", weights: { discipline: 1, risk: 1 } },
      { text: "会分散到很多资产或很多标的", weights: { patience: 1, discipline: 2 } },
    ],
  },
  {
    id: 13,
    prompt: "你执行计划的纪律性怎么样？",
    options: [
      { text: "我基本能严格按计划执行", weights: { discipline: 4 } },
      { text: "大多数时候可以", weights: { discipline: 2 } },
      { text: "我经常做到一半就改主意", weights: { rush: 1, fomo: 1, contrarian: 1 } },
    ],
  },
  {
    id: 14,
    prompt: "一笔单子开始赚钱后，你通常怎么处理？",
    options: [
      { text: "到预设目标就止盈", weights: { discipline: 3 } },
      { text: "分批止盈，留一部分继续跑", weights: { discipline: 2, patience: 2 } },
      { text: "没有固定目标，边走边看", weights: { patience: 2, risk: 1, contrarian: 1 } },
      { text: "先赚到手，免得利润又消失", weights: { rush: 1, fomo: 2 } },
    ],
  },
  {
    id: 15,
    prompt: "单笔交易里，你现实中能承受多大的亏损？",
    options: [
      { text: "很小，我不想让单笔错误太伤", weights: { discipline: 2 } },
      { text: "中等，只要在可控范围内", weights: { risk: 1, discipline: 1 } },
      { text: "如果我还信逻辑，可以承受比较大回撤", weights: { risk: 3, patience: 1 } },
    ],
  },
  {
    id: 16,
    prompt: "哪种描述最像你？",
    options: [
      { text: "我有一套清晰系统，并尽量照它执行", weights: { discipline: 3, patience: 1 } },
      { text: "我很依赖感觉和经验", weights: { rush: 1, contrarian: 1, risk: 1 } },
      { text: "市场现在热什么，我就更愿意顺着去做", weights: { fomo: 2, contrarian: 2, rush: 1 } },
    ],
  },
];

const QUESTION_COPY_EN = {
  1: {
    prompt: "When you see a high-risk, high-reward setup, what is your usual reaction?",
    options: ["I am excited and willing to go for it", "I will consider it, but carefully", "I would rather stay on the sidelines"],
  },
  2: {
    prompt: "How long do you usually hold a position?",
    options: ["In and out within the same day", "A few days to a couple of weeks", "Several months or longer"],
  },
  3: {
    prompt: "When the market moves fast, how do you make decisions?",
    options: ["Very quickly, almost instinctively", "I watch for a moment, then act", "I need time to think and analyze first"],
  },
  4: {
    prompt: "Do you set a stop-loss before entering a trade?",
    options: ["Always, and I stick to it", "Sometimes, depending on the situation", "Rarely or never"],
  },
  5: {
    prompt: "How do you usually size your positions?",
    options: ["Small and controlled", "Medium-sized, balanced", "Heavy size — I want the trade to matter"],
  },
  6: {
    prompt: "What is your attitude toward leverage?",
    options: ["I am open to it and know how to manage the risk", "I use it occasionally", "I prefer to avoid it"],
  },
  7: {
    prompt: "After a losing streak, what are you usually like?",
    options: [
      "Calm and disciplined — I stick to the plan",
      "A bit stressed, but still trying to stay rational",
      "Frustrated and likely to make emotional trades",
    ],
  },
  8: {
    prompt: "How often do you trade?",
    options: ["Very frequently, sometimes every day", "A few times a week", "Once in a while", "Hardly ever"],
  },
  9: {
    prompt: "What type of information do you rely on most?",
    options: [
      "Fundamentals, such as earnings and macro data",
      "Charts, price action, and technical indicators",
      "News, themes, and major events",
      "Data models and systematic analysis",
    ],
  },
  10: {
    prompt: "Which strategy sounds most like your style?",
    options: [
      "Value investing / fundamental analysis",
      "Trend following",
      "Event-driven trading",
      "Quantitative / algorithmic trading",
    ],
  },
  11: {
    prompt: "Do you keep a trading journal and review your trades?",
    options: ["Yes, consistently", "Sometimes", "Not really"],
  },
  12: {
    prompt: "How concentrated is your portfolio usually?",
    options: ["I prefer a small number of positions", "I hold a moderate mix", "I spread across many assets or names"],
  },
  13: {
    prompt: "How disciplined are you when it comes to following your plan?",
    options: ["I follow it closely", "Most of the time", "I often change my mind mid-trade"],
  },
  14: {
    prompt: "When a trade is in profit, what do you usually do?",
    options: [
      "Take profit at a pre-planned target",
      "Scale out gradually and let part of it run",
      "Hold without a fixed target and decide later",
      "Take the money quickly before it disappears",
    ],
  },
  15: {
    prompt: "On a single trade, how much loss are you realistically willing to tolerate?",
    options: ["Very little", "A moderate amount", "A large drawdown if I still believe in it"],
  },
  16: {
    prompt: "Which description fits you best?",
    options: [
      "I trade with a clear system and try to follow it",
      "I rely a lot on feel and experience",
      "I adapt constantly to whatever is hot in the market",
    ],
  },
};

const LEGACY_PERSONA_TRANSLATIONS = {
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

const PERSONA_TRANSLATIONS = {
  基金经理: {
    name: "Fund Manager",
    subtitle: "Calm, organized, and annoyingly rational",
    oneLiner: "You care about process, risk control, and consistency more than thrill.",
    description:
      "You think about allocation, drawdown and portfolio behavior before you think about excitement. Trading is closer to managing a process than chasing a story.",
    whyMatch:
      "Your discipline and holding horizon are both high, while your decision speed is relatively measured. You prefer control over adrenaline.",
    typicalBehavior:
      "Research first, size carefully, and avoid letting short-term heat rewrite your entire framework.",
    weakness:
      "In fast emotional markets you can look late, because you usually want more confirmation than the crowd needs.",
    hiddenTalent:
      "You are good at turning good habits into repeatable performance. That matters more than one flashy trade.",
    bestMarket: "Structured markets where fundamentals and price action can validate each other over time.",
    badMarket: "Purely emotional environments that reward reflex before judgment.",
    shareText:
      "I got Fund Manager. Calm, organized, and annoyingly rational. The market can be hot. I still want risk under control first.",
  },
  价值投资者: {
    name: "Value Investor",
    subtitle: "Patient enough to look boring, which is often a strength",
    oneLiner: "You believe patience pays, especially when the market is too noisy to think clearly.",
    description:
      "You would rather understand what something is worth and wait than chase every move that looks exciting in the moment.",
    whyMatch:
      "Your holding horizon and discipline are high, and you are not especially driven by immediate opportunity pressure.",
    typicalBehavior:
      "Research deeply, wait for a better price, and try not to let daily volatility bully you out of your own thesis.",
    weakness:
      "Patience can turn into stubbornness if you underestimate how long the market can stay inefficient.",
    hiddenTalent:
      "You can keep independent judgment when everyone else is reacting to noise. That is rare.",
    bestMarket: "Markets that eventually reward fundamentals, valuation and time.",
    badMarket: "Markets dominated by short bursts of hype and endless narrative rotation.",
    shareText:
      "I got Value Investor. Patient enough to look boring, which is often a strength. I would rather wait for value than sprint after every headline.",
  },
  趋势跟随者: {
    name: "Trend Follower",
    subtitle: "You would rather ride the move than predict the future",
    oneLiner: "You do not need to call the bottom. You just want to catch the move once it is real.",
    description:
      "You trust price more than storytelling. Once the market proves direction, you are willing to follow rather than over-intellectualize it.",
    whyMatch:
      "Your opportunity drive and discipline are both relatively strong, which makes you well suited for following what is already working.",
    typicalBehavior:
      "Look for breakouts, confirmation and continuation. Once the market agrees, you want to stay with the move.",
    weakness:
      "Choppy markets and fake breakouts can grind you down fast.",
    hiddenTalent:
      "You are good at simplifying the problem: what is actually moving, and is it still moving?",
    bestMarket: "Directional markets with durable trends and clear leadership.",
    badMarket: "Whipsaw environments where nothing follows through for long.",
    shareText:
      "I got Trend Follower. I do not need to predict everything. I just want to catch the move once it actually starts.",
  },
  量化交易员: {
    name: "Quant Trader",
    subtitle: "In God we trust. Everyone else brings data",
    oneLiner: "You like logic, data, and repeatable systems more than narrative certainty.",
    description:
      "You would rather test a method than debate a storyline. Repeatability matters more to you than sounding right in real time.",
    whyMatch:
      "Your discipline is very high and your decision style is more structured than emotional. You want process before opinion.",
    typicalBehavior:
      "Track data, review outcomes, and look for approaches that can survive beyond one market regime.",
    weakness:
      "When the market turns highly emotional, your system-first instinct can feel slow or rigid.",
    hiddenTalent:
      "You can build edge that does not depend on mood, charisma or a hot hand.",
    bestMarket: "Markets where signals, process and repeated behavior still mean something.",
    badMarket: "Regime shifts and emotional extremes that distort previously stable patterns.",
    shareText:
      "I got Quant Trader. In God we trust. Everyone else brings data. If it cannot repeat, I do not trust it much.",
  },
  事件驱动交易者: {
    name: "Event-Driven Trader",
    subtitle: "You trade catalysts, not just candles",
    oneLiner: "Policy shifts, earnings releases, headlines and big news are where opportunity starts to light up for you.",
    description:
      "You tend to ask why the market is moving, not just whether it is moving. Catalysts and fresh narratives are your natural hunting ground.",
    whyMatch:
      "Your opportunity drive and style flexibility are both high, which points to someone who likes new information and changing setups.",
    typicalBehavior:
      "Track earnings, macro, policy and breaking themes, then move when you think the market has not fully priced the shift.",
    weakness:
      "It is easy to mistake noise for a true catalyst or confuse a one-day reaction with a durable move.",
    hiddenTalent:
      "You are often early to new narratives because you naturally pay attention to what changed.",
    bestMarket: "Catalyst-rich environments with real repricing and follow-through.",
    badMarket: "Headline-heavy markets where every new story fades immediately.",
    shareText:
      "I got Event-Driven Trader. You trade catalysts, not just candles. If something changed, I want to know whether the market has understood it yet.",
  },
  日内剥头皮选手: {
    name: "Intraday Scalper",
    subtitle: "Fast hands, fast eyes, fast stress",
    oneLiner: "You want action, precision and quick feedback. Slow opportunities do not hold your attention well.",
    description:
      "You focus on short-term movement, execution and immediate reaction. To you, a lot of the edge lives in timing, not in waiting.",
    whyMatch:
      "Your decision speed, opportunity drive and risk tolerance are all elevated, while your holding horizon is short.",
    typicalBehavior:
      "Stay close to the screen, react fast, and care more about today's move than a long story six months out.",
    weakness:
      "High frequency can magnify fatigue, emotion and overtrading if discipline slips even a little.",
    hiddenTalent:
      "You are highly responsive to real-time feedback. In the right environment that is a real advantage.",
    bestMarket: "Liquid, volatile sessions with clean intraday movement.",
    badMarket: "Flat, low-energy markets with no real short-term edge.",
    shareText:
      "I got Intraday Scalper. Fast hands, fast eyes, fast stress. If the move is here now, I want to do something with it now.",
  },
  保守配置者: {
    name: "Conservative Allocator",
    subtitle: "You sleep better than most traders",
    oneLiner: "Protecting capital comes first. Excitement is optional.",
    description:
      "You care more about preservation, stability and avoiding damage than about squeezing maximum drama out of every trade.",
    whyMatch:
      "Your discipline and holding horizon are high, while your risk tolerance is clearly restrained.",
    typicalBehavior:
      "Diversify, control exposure, and think about survivability before upside.",
    weakness:
      "You can end up underexposed in the exact moments when good risk is actually worth taking.",
    hiddenTalent:
      "You understand that staying in the game matters. Most traders learn that lesson later and more expensively.",
    bestMarket: "Steady environments where controlled exposure compounds over time.",
    badMarket: "Frenzied phases where everyone is rewarded for taking oversized risk immediately.",
    shareText:
      "I got Conservative Allocator. You sleep better than most traders. I would rather miss some upside than let one idea wreck the whole account.",
  },
  激进投机者: {
    name: "Aggressive Speculator",
    subtitle: "Big conviction, big swings, big consequences",
    oneLiner: "When you think you are right, you want the upside to matter.",
    description:
      "You are comfortable taking meaningful swings if the setup feels asymmetric. If the trade works, you want it to count.",
    whyMatch:
      "Your risk tolerance and decision speed are both high, and you are not naturally built for tiny, cautious positioning.",
    typicalBehavior:
      "Commit hard when you believe the setup is there and accept that volatility is part of the price of upside.",
    weakness:
      "Your upside is large, but your mistakes can also get large quickly if discipline falls behind conviction.",
    hiddenTalent:
      "You do not scare easily when real opportunity appears. That matters in moments most people freeze.",
    bestMarket: "High-conviction environments with clear asymmetry and meaningful payoff.",
    badMarket: "Noisy, indecisive markets that punish size and conviction equally.",
    shareText:
      "I got Aggressive Speculator. Big conviction, big swings, big consequences. If I am right, I want the result to matter.",
  },
  天然散户受害者: {
    name: "Natural Retail Victim",
    subtitle: "The market has probably taught you expensive lessons",
    oneLiner: "You are easily pulled around by emotion, hype, fear of missing out, and short-term noise.",
    description:
      "You may understand what you should do, but in real time the market's emotional pull can be stronger than your plan.",
    whyMatch:
      "Your opportunity sensitivity is high while your discipline is relatively weak. That often creates expensive emotional timing.",
    typicalBehavior:
      "Chase when it feels urgent, hesitate when it feels scary, then review it later wishing you had simply followed your own rules.",
    weakness:
      "You may buy tops, hold losers too long, or switch plans mid-trade because the market's mood gets inside your head.",
    hiddenTalent:
      "You are not unaware. You are just too close to the heat. One extra beat of discipline would change a lot.",
    bestMarket: "Simple, directional markets where the right move is obvious and quick to validate.",
    badMarket: "Emotionally noisy markets that constantly tempt you into impulsive decisions.",
    shareText:
      "I got Natural Retail Victim. The market has probably taught me expensive lessons. The pattern is not lack of intelligence. It is getting dragged around by the moment.",
  },
  灵活机会主义者: {
    name: "Flexible Opportunist",
    subtitle: "You are not loyal to one style, only to what works",
    oneLiner: "You do not fit neatly into one box, and you are usually okay with that.",
    description:
      "You adapt to market conditions rather than forcing the same playbook onto every environment. Style, to you, is a tool, not an identity.",
    whyMatch:
      "Your flexibility is high and your risk appetite is not low, which makes you more willing to shift style as the market changes.",
    typicalBehavior:
      "You switch between setups, timeframes and tactics depending on what the environment is rewarding now.",
    weakness:
      "Adaptability can become inconsistency if you switch too fast and lose a stable decision framework.",
    hiddenTalent:
      "You are harder to trap inside one dead style. When markets rotate, that becomes useful quickly.",
    bestMarket: "Fast-changing markets where one rigid playbook keeps breaking.",
    badMarket: "Very one-style markets that reward deep specialization over adaptation.",
    shareText:
      "I got Flexible Opportunist. I am not loyal to one style, only to what works. If the market changes, I would rather adapt than pretend it did not.",
  },
};

const PEOPLE_TRANSLATIONS = {
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
  const lookup = new Map(PEOPLE.map((person) => [person.name, person]));
  const directMatches = (mainPersona.peopleMatches || [])
    .filter((name) => !excludedNames.has(name))
    .map((name) => lookup.get(name))
    .filter(Boolean);

  if (directMatches.length >= 3) {
    return directMatches.slice(0, 3);
  }

  const fallbacks = PEOPLE.filter(
    (person) =>
      !excludedNames.has(person.name) &&
      !directMatches.some((item) => item.name === person.name),
  );

  return [...directMatches, ...fallbacks].slice(0, 3);
}

function buildDimensionInsight(scores, language) {
  const sorted = [...DIMENSIONS].sort((a, b) => scores[b.key] - scores[a.key]);
  const topA = sorted[0];
  const topB = sorted[1];
  const bottomA = sorted[sorted.length - 1];

  let insight =
    language === "en"
      ? "Your trading style is shaped less by what sounds good in theory and more by how you actually respond under pressure."
      : "你的交易风格，不是由你嘴上认同什么决定的，而是由你在真实波动里会怎么动决定的。";
  let contrast =
    language === "en"
      ? `You are driven more by ${getDimensionLabel(topA, language)} than by ${getDimensionLabel(bottomA, language)}.`
      : `你更像${getDimensionLabel(topA, language)}驱动型，而不是${getDimensionLabel(bottomA, language)}驱动型。`;

  if (scores.discipline >= 7.5 && scores.patience >= 7) {
    insight =
      language === "en"
        ? "Your center of gravity is structure. You care about repeatability, process and survival more than the thrill of any single trade."
        : "你的核心更偏向结构和流程。你在意可复用性、风控和长期存活，而不是单笔交易够不够刺激。";
    contrast =
      language === "en"
        ? "You behave more like a system builder than a heat chaser."
        : "你更像系统型交易者，而不是热度追逐型玩家。";
  } else if (scores.rush >= 7 && scores.risk >= 7) {
    insight =
      language === "en"
        ? "You are wired for speed. When opportunity appears, you would rather act and manage than wait and watch the move leave without you."
        : "你天然偏快。机会一来，你更愿意先上车、边做边管，而不是站在原地看它自己走掉。";
    contrast =
      language === "en"
        ? "You behave more like an attacker than a capital preserver."
        : "你更像进攻型选手，而不是纯防守型选手。";
  } else if (scores.patience >= 7.5 && scores.fomo <= 4) {
    insight =
      language === "en"
        ? "Time is one of your real edges. You are more comfortable waiting for logic than reacting to every short-term stimulus."
        : "时间对你来说是真正的优势之一。你更能等逻辑兑现，而不是被短期噪音拽着走。";
    contrast =
      language === "en"
        ? "You behave more like a long-horizon player than a short-cycle chaser."
        : "你更像长周期选手，而不是短频追逐型玩家。";
  } else if (scores.contrarian >= 7 && scores.fomo >= 6) {
    insight =
      language === "en"
        ? "You are not loyal to one style for emotional reasons. You care more about whether the current environment rewards it."
        : "你不太会为某种风格死忠。你更在意的，是眼下这个市场到底奖励什么。";
    contrast =
      language === "en"
        ? "You behave more like an adapter than a style purist."
        : "你更像适应型玩家，而不是风格教条型玩家。";
  } else if (scores.fomo >= 7 && scores.discipline <= 4) {
    insight =
      language === "en"
        ? "Your biggest variable is not intelligence. It is how strongly the market's emotion can enter your decision process."
        : "你最大的问题通常不是看不懂，而是市场情绪会不会在关键时刻直接接管你的动作。";
    contrast =
      language === "en"
        ? "You behave more like an emotional participant than a fully rules-based trader."
        : "你更像情绪参与型选手，而不是完全规则驱动型交易者。";
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
      ? `You also carry a bit of ${localizedOther.name}: both of you lean toward ${sharedLabel}, but your expression is slightly different in tempo or intensity.`
      : `你也有一点${localizedOther.name}的倾向：你们都偏向${sharedLabel}，只是你的表达方式在节奏或力度上有些不同。`;
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

      const dataUrl = await toJpeg(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: "#fbf7f0",
        quality: 0.95,
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
  const localizedPeopleMatches = result ? result.peopleMatches : [];
  const shareCardDimensions = result
    ? DIMENSIONS.map((dimension) => ({
        key: dimension.key,
        label: getDimensionShort(dimension, language),
        score: formatScore(result.scores[dimension.key]),
        value: result.scores[dimension.key],
      }))
    : [];
  const shareExplainCards = localizedResultPersona
    ? [
        { title: ui.whyMatch, content: localizedResultPersona.whyMatch },
        { title: ui.behavior, content: localizedResultPersona.typicalBehavior },
        { title: ui.weakness, content: localizedResultPersona.weakness },
        { title: ui.talent, content: localizedResultPersona.hiddenTalent },
        { title: ui.bestMarket, content: localizedResultPersona.bestMarket },
        { title: ui.badMarket, content: localizedResultPersona.badMarket },
      ]
    : [];
  const shareClosePersonas = result
    ? result.closePersonas.map((persona) => ({
        name: getPersonaContent(persona, language).name,
        subtitle: getPersonaContent(persona, language).subtitle,
        camp: getCampContent(persona.camp, language).label,
        reason: localizeCloseTypeNames(
          buildCloseTypeReason(result.scores, persona, language),
          language,
        ),
      }))
    : [];
  const sharePeopleCards = localizedPeopleMatches.map((person) => {
    const localized = getPeopleContent(person, language);
    return {
      name: localized.name,
      shortLabel: localized.shortLabel,
      likePoint: localized.likePoint,
      story: localized.story,
      keywords: localized.keywords,
    };
  });

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
          <ShareLongImage
            ref={shareCardRef}
            title={language === "en" ? "Trading Personality Quiz" : "交易人格测试"}
            titleEn=""
            persona={localizedResultPersona}
            camp={localizedResultCamp}
            campLabel={ui.campLabel}
            summaryLabel={ui.summaryLabel}
            insight={localizedDimensionInsight}
            dimensions={shareCardDimensions}
            radarTitle={ui.radarTitle}
            explainTitle={ui.whySectionTitle}
            explainCards={shareExplainCards}
            closeTypesTitle={ui.closeTypesTitle}
            closeTypesBody={ui.closeTypesBody}
            closePersonas={shareClosePersonas}
            peopleTitle={ui.peopleTitle}
            peopleBody={ui.peopleBody}
            peopleCards={sharePeopleCards}
            shareTitle={ui.shareTitle}
            shareText={localizedShareCopy}
            qrUrl={SHARE_TARGET_URL}
            footerCta={
              language === "en"
                ? "Scan to discover your trading personality"
                : "扫码测测你真实的交易人格"
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
