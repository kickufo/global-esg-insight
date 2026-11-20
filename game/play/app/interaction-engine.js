const themeDefinitions = {
  environment: {
    label: '环境与社区',
    test: /水|地下水|废水|土壤|污染|化学|气味|噪声|生境|环境|厂址|排放|能源|低碳/,
    actions: [
      { id: 'records', title: '调取许可与历史记录', channel: '主管机关 / 数据室', days: 3, cost: 1, clue: '许可边界、历史异常和责任人之间出现了可核对的时间线。', fx: { compliance: 2 } },
      { id: 'sampling', title: '委托独立技术核验', channel: '第三方实验室 / 工程顾问', days: 5, cost: 3, clue: '独立数据缩小了影响范围，也暴露了原有基线中的缺口。', fx: { environment: 3, finance: -1 } },
      { id: 'stakeholder', title: '听取受影响方意见', channel: '员工 / 社区 / 公益机构', days: 2, cost: 1, clue: '利益相关方提供了企业监测没有覆盖的时间、地点或实际影响。', fx: { social: 3 } },
    ],
  },
  people: {
    label: '人员与供应链',
    test: /员工|劳工|工时|招聘|裁员|分包|供应商|工程师|发明|绩效|夜班/,
    actions: [
      { id: 'records', title: '核对合同、工时与授权', channel: 'HR / 采购 / 法务', days: 3, cost: 1, clue: '书面记录与现场实际做法之间存在可验证的差异。', fx: { compliance: 2 } },
      { id: 'interviews', title: '开展保密访谈', channel: '员工 / 承包商 / 员工代表', days: 3, cost: 2, clue: '一线人员补充了管理层汇报中缺失的压力来源和受影响群体。', fx: { people: 3 } },
      { id: 'supplier', title: '穿透供应链核查', channel: '供应商 / 招聘代理 / 受益人', days: 4, cost: 2, clue: '费用、分包和责任链被还原，部分风险不能再归为单一供应商问题。', fx: { people: 2, compliance: 1 } },
    ],
  },
  integrity: {
    label: '诚信与第三方',
    test: /顾问|佣金|加速费|成功费|举报|受益|代理|渠道|付款|关联/,
    actions: [
      { id: 'beneficial-owner', title: '核验受益人与付款路径', channel: '财务 / KYC / 公司登记', days: 3, cost: 1, clue: '实际收款人、合同相对方和服务提供者并不完全一致。', fx: { compliance: 3 } },
      { id: 'contacts', title: '还原政府与客户接触', channel: '邮件 / 日历 / 访谈', days: 4, cost: 2, clue: '关键接触和承诺被还原，能够判断哪些活动需要升级审批。', fx: { compliance: 2 } },
      { id: 'independent', title: '启动独立复核', channel: '外部律师 / 审计', days: 5, cost: 3, clue: '独立复核保护了证据链，也识别了可能持续发生的风险。', fx: { social: 2, compliance: 3, finance: -1 } },
    ],
  },
  data: {
    label: '数据与技术',
    test: /数据|文件|云|访问|监测|图纸|远程|日志|原型|跨境/,
    actions: [
      { id: 'mapping', title: '绘制数据与访问地图', channel: 'IT / 数据保护 / 客户合同', days: 3, cost: 1, clue: '数据类别、访问者、地点和合同限制被放到同一张图中。', fx: { compliance: 3 } },
      { id: 'logs', title: '保全并分析系统日志', channel: '安全运营 / 取证', days: 4, cost: 2, clue: '日志确认了访问范围，并区分了已知事实与仍待核实的猜测。', fx: { compliance: 2, market: 1 } },
      { id: 'consult', title: '征询本地员工与客户', channel: '员工代表 / 客户安全团队', days: 2, cost: 1, clue: '受影响方说明了可接受的应急边界和通知节奏。', fx: { people: 2, market: 2 } },
    ],
  },
  product: {
    label: '产品与市场',
    test: /.*/,
    actions: [
      { id: 'contract', title: '核对合同与变更边界', channel: '客户 / 质量 / 法务', days: 3, cost: 1, clue: '交付承诺、验证状态和通知义务被明确区分。', fx: { compliance: 2 } },
      { id: 'technical', title: '进行限定技术验证', channel: '实验室 / 质量团队', days: 4, cost: 2, clue: '验证结果显示风险集中在特定批次、参数或使用条件。', fx: { market: 2, compliance: 1 } },
      { id: 'customer', title: '与关键客户共同评审', channel: '客户工程 / 采购', days: 2, cost: 1, clue: '客户给出了真实优先级，并同意用阶段条件替代绝对承诺。', fx: { market: 3 } },
    ],
  },
};

const groundwaterPlan = {
  id: 'de-pcb-greenfield-groundwater',
  theme: 'environment',
  label: '地下水与社会许可',
  deadline: 21,
  pressure: '客户要求21天内锁定厂址；社区已要求公开地下水影响依据。',
  objective: '在价格锁定前判断地块是否具备可接受的水文、许可与社区基础。',
  actions: [
    { id: 'hydro', title: '调取水文地质与历史用地数据', channel: 'LfULG / GeoSN / 数据室', days: 4, cost: 2, clue: '公开资料显示地块靠近支流水系，历史填土区的地下水流向仍需项目级钻探确认。', fx: { compliance: 2, environment: 2 } },
    { id: 'sampling', title: '布置独立基线采样', channel: '认证实验室 / 水文顾问', days: 7, cost: 4, clue: '上游、场址和下游样点建立了可追溯基线；一处异常值需要复测，不能被简单解释为本项目造成。', fx: { environment: 4, finance: -1 } },
    { id: 'community', title: '召开社区小组与水使用访谈', channel: '居民 / 市环境局 / BUND', days: 3, cost: 1, clue: '居民真正担忧的不只是污染，还包括施工降水、货车交通和企业拒绝持续公开监测。', fx: { social: 4 } },
    { id: 'permit', title: '举行许可预沟通', channel: '德累斯顿市环境局', days: 3, cost: 2, clue: '主管部门要求在选址决定前说明取排水、事故防控、基线和监测责任，而非只提交后期工程承诺。', fx: { compliance: 3 } },
  ],
};

function cloneActions(actions) {
  return actions.map(action => ({ ...action, fx: { ...(action.fx || {}) } }));
}

export function classifyEvent(event) {
  const text = `${event.title} ${event.body} ${(event.signals || []).join(' ')}`;
  return Object.entries(themeDefinitions).find(([, value]) => value.test.test(text))?.[0] || 'product';
}

export function buildInteractionPlan(event, context) {
  if (context.mode === '绿地建厂' && event.title === '厂址的价格') {
    return { ...groundwaterPlan, actions: cloneActions(groundwaterPlan.actions) };
  }
  const theme = classifyEvent(event);
  const definition = themeDefinitions[theme];
  const deadline = [18, 14, 9, 3][event.phase] || 7;
  return {
    id: `${context.mode}-${context.turn}-${theme}`,
    theme,
    label: definition.label,
    deadline,
    pressure: `董事会窗口剩余${deadline}天。调查会消耗时间和预算，但可降低在不完整信息下决策的风险。`,
    objective: `识别“${event.title}”背后的事实、受影响方与不可逆后果。`,
    actions: cloneActions(definition.actions),
  };
}

export function ensureInteractionState(state, event, context) {
  state.interactions ||= {};
  const key = `${context.mode}:${context.turn}:${event.title}`;
  if (!state.interactions[key]) {
    const plan = buildInteractionPlan(event, context);
    state.interactions[key] = {
      key,
      planId: plan.id,
      theme: plan.theme,
      label: plan.label,
      deadline: plan.deadline,
      remaining: plan.deadline,
      pressure: plan.pressure,
      objective: plan.objective,
      actions: plan.actions,
      completed: [],
      evidence: [],
      decisionOpen: false,
      overdue: false,
    };
  }
  return state.interactions[key];
}

export function investigate(interaction, actionId) {
  if (interaction.completed.includes(actionId) || interaction.decisionOpen) return null;
  const action = interaction.actions.find(item => item.id === actionId);
  if (!action) return null;
  interaction.completed.push(action.id);
  interaction.remaining -= action.days;
  interaction.overdue = interaction.remaining < 0;
  interaction.evidence.push({ id: action.id, title: action.title, channel: action.channel, clue: action.clue });
  return action;
}

export function openDecision(interaction) {
  interaction.decisionOpen = true;
  return interaction;
}

export function investigationOutcome(interaction) {
  const count = interaction.completed.length;
  const fx = {};
  if (count === 0) Object.assign(fx, { compliance: -3, social: -1 });
  else if (count === 1) Object.assign(fx, { compliance: 1 });
  else Object.assign(fx, { compliance: 2, social: 1 });
  if (interaction.overdue) Object.assign(fx, { market: (fx.market || 0) - 3, finance: (fx.finance || 0) - 2 });
  return { count, fx, summary: count === 0 ? '未进行额外核查，决定主要依赖初始汇报。' : `已完成${count}项调查并形成${interaction.evidence.length}条证据；${interaction.overdue ? '但已超过决策窗口。' : '仍在决策窗口内。'}` };
}

export function groundwaterConsequences(interaction, choice, turn) {
  if (interaction.planId !== groundwaterPlan.id) return [];
  const done = new Set(interaction.completed);
  const items = [];
  if (choice.flag === 'riverSite') {
    if (!done.has('hydro') || !done.has('sampling')) items.push({ at: Math.max(turn + 2, 4), text: '施工降水后，居民水井水位变化与一处历史异常值同时进入舆论；由于缺少完整基线，公司无法快速区分历史背景与项目影响。', fx: { social: -9, environment: -7, compliance: -4 }, chain: 'groundwater' });
    else items.push({ at: Math.max(turn + 2, 4), text: '施工期监测发现异常，但完整基线使公司能够暂停局部工程、定位来源并向社区解释已知与未知事项。', fx: { finance: -3, social: 2, compliance: 2 }, chain: 'groundwater' });
    if (!done.has('community')) items.push({ at: Math.max(turn + 5, 8), text: '客户审厂前夕，社区请愿与地下水质疑汇合，客户要求提供利益相关方沟通和监测证据。', fx: { market: -8, social: -8 }, chain: 'groundwater-client' });
  }
  if (choice.flag === 'industrialPark' && done.size >= 2) items.push({ at: Math.max(turn + 3, 5), text: '工业园扩产评审接受了可追溯基线，客户将环境调查质量列为供应商治理加分项。', fx: { market: 3, compliance: 2, environment: 2 }, chain: 'groundwater' });
  return items;
}

export function frameworkStats() {
  return { engineVersion: 15, interactionThemes: Object.keys(themeDefinitions).length, reviewedCombinations: 1, scalableDimensions: ['country', 'industry', 'productService', 'entryMode', 'operatingStyle'] };
}
