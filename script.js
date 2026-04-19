const SAVE_KEY = "arcanaTap_v5";

const state = {
  gold: 0,
  shards: 0,
  prestige: 0,
  room: 1,
  kills: 0,
  totalKills: 0,
  bossesKilled: 0,
  crits: 0,
  combo: 0,
  comboTimer: 0,
  furyCd: 0,
  overdriveCharge: 0,
  overdriveTime: 0,
  tapBase: 1,
  dpsBase: 0,
  activePanel: "shop",
  enemy: {
    name: "Slime del Sotano",
    hp: 22,
    maxHp: 22,
    shield: 0,
    isBoss: false,
    isElite: false,
    modId: null,
  },
  meta: {
    tapBonus: 0,
    dpsBonus: 0,
    critBonus: 0,
    goldBonus: 0,
    comboBonus: 0,
    furyBonus: 0,
  },
  run: {
    blade: 0,
    familiar: 0,
    greed: 0,
    mirror: 0,
    rune: 0,
  },
  multipliers: {
    tap: 1,
    dps: 1,
    critChance: 0,
    critMult: 1.7,
    gold: 1,
    enemyHp: 1,
    shieldBreak: 1,
    overdrive: 1,
    shardChance: 0,
  },
  relics: [],
  cards: [],
  quests: {
    kills30: { progress: 0, claimed: false },
    room25: { progress: 0, claimed: false },
    crit20: { progress: 0, claimed: false },
    boss3: { progress: 0, claimed: false },
  },
};

const enemyBases = [
  { name: "Slime del Sotano", hp: 22 },
  { name: "Murcielago Ciego", hp: 18 },
  { name: "Payaso de Carton", hp: 28 },
  { name: "Cuervo Oxidado", hp: 25 },
  { name: "Mago de Ceniza", hp: 34 },
  { name: "Angel de Plomo", hp: 42 },
  { name: "Arana de Cristal", hp: 52 },
];

const bosses = [
  { name: "The Collector", hpMult: 4.8 },
  { name: "Reina Tuerca", hpMult: 5.6 },
  { name: "Ojo Carmesi", hpMult: 6.4 },
  { name: "Monarca de Sal", hpMult: 7.2 },
];

const enemyMods = {
  armored: { name: "Blindado", desc: "Mitiga dano", hpMult: 1.35, damageReduction: 0.28 },
  regen: { name: "Regenerador", desc: "Regenera HP", hpMult: 1.2, regen: 0.06 },
  rich: { name: "Acaparador", desc: "+oro al morir", hpMult: 1.12, goldMult: 1.6 },
  burst: { name: "Frenetico", desc: "Baja vida, alta recompensa", hpMult: 0.88, goldMult: 1.3 },
};

const runUpgrades = [
  { id: "blade", name: "Cuchilla Astillada", desc: "+1.7 dano base", tag: "run", base: 16, growth: 1.5,
    apply: () => { state.run.blade += 1; state.tapBase += 1.7; } },
  { id: "familiar", name: "Familiar de Laton", desc: "+1.3 DPS", tag: "run", base: 24, growth: 1.56,
    apply: () => { state.run.familiar += 1; state.dpsBase += 1.3; } },
  { id: "greed", name: "Caliz Dorado", desc: "+16% oro", tag: "run", base: 34, growth: 1.62,
    apply: () => { state.run.greed += 1; state.multipliers.gold *= 1.16; } },
  { id: "mirror", name: "Espejo Roto", desc: "+10% critico", tag: "run", base: 42, growth: 1.68,
    apply: () => { state.run.mirror += 1; state.multipliers.critChance += 0.1; } },
  { id: "rune", name: "Runa de Sangre", desc: "+18% dano de golpe", tag: "run", base: 58, growth: 1.73,
    apply: () => { state.run.rune += 1; state.multipliers.tap *= 1.18; } },
];

const metaUpgrades = [
  { id: "tapBonus", name: "Guante de Hierro", desc: "+1 dano permanente", cost: (lvl) => Math.floor(10 * Math.pow(1.85, lvl)), apply: () => { state.meta.tapBonus += 1; } },
  { id: "dpsBonus", name: "Totem de Bronce", desc: "+1 DPS permanente", cost: (lvl) => Math.floor(12 * Math.pow(1.9, lvl)), apply: () => { state.meta.dpsBonus += 1; } },
  { id: "critBonus", name: "Moneda Marcada", desc: "+4% critico permanente", cost: (lvl) => Math.floor(15 * Math.pow(2.0, lvl)), apply: () => { state.meta.critBonus += 0.04; } },
  { id: "goldBonus", name: "Cofre Infinito", desc: "+10% oro permanente", cost: (lvl) => Math.floor(18 * Math.pow(2.05, lvl)), apply: () => { state.meta.goldBonus += 0.1; } },
  { id: "comboBonus", name: "Cadena de Titanio", desc: "+5% combo base", cost: (lvl) => Math.floor(21 * Math.pow(2.2, lvl)), apply: () => { state.meta.comboBonus += 0.05; } },
  { id: "furyBonus", name: "Nucleo de Ira", desc: "+15% Furia", cost: (lvl) => Math.floor(24 * Math.pow(2.3, lvl)), apply: () => { state.meta.furyBonus += 0.15; } },
];

const relicPool = [
  { id: "joker", name: "Joker Roto", desc: "+42% dano", rarity: "quest", apply: () => { state.multipliers.tap *= 1.42; } },
  { id: "blood", name: "Sangre Fria", desc: "+60% DPS", rarity: "quest", apply: () => { state.multipliers.dps *= 1.6; } },
  { id: "coin", name: "Moneda Negra", desc: "+40% oro", rarity: "quest", apply: () => { state.multipliers.gold *= 1.4; } },
  { id: "tear", name: "Lagrima Prismatica", desc: "+14% critico", rarity: "quest", apply: () => { state.multipliers.critChance += 0.14; } },
  { id: "storm", name: "Punio de Trueno", desc: "+35% rompe-escudos", rarity: "quest", apply: () => { state.multipliers.shieldBreak *= 1.35; } },
  { id: "engine", name: "Motor Obsidiana", desc: "+22% dano y DPS", rarity: "quest", apply: () => { state.multipliers.tap *= 1.22; state.multipliers.dps *= 1.22; } },
  { id: "crown", name: "Corona Hueca", desc: "+1 reliquia extra en boss", rarity: "quest", apply: () => {} },
];

const cardPool = [
  { id: "tempo", name: "Tempo Azul", desc: "+25% DPS y +10% combo", apply: () => { state.multipliers.dps *= 1.25; state.meta.comboBonus += 0.1; } },
  { id: "breaker", name: "Quebrador", desc: "+50% dano a escudos", apply: () => { state.multipliers.shieldBreak *= 1.5; } },
  { id: "glass", name: "Vidrio Rojo", desc: "+35% dano, enemigos +12% HP", apply: () => { state.multipliers.tap *= 1.35; state.multipliers.enemyHp *= 1.12; } },
  { id: "afterburn", name: "Postcombustion", desc: "+30% Overdrive", apply: () => { state.multipliers.overdrive *= 1.3; } },
  { id: "siphon", name: "Sifon", desc: "+20% oro y +10% chance esencias", apply: () => { state.multipliers.gold *= 1.2; state.multipliers.shardChance += 0.1; } },
  { id: "precision", name: "Precision", desc: "+8% critico", apply: () => { state.multipliers.critChance += 0.08; } },
];

const questDefs = {
  kills30: { title: "Carnicero", text: "Elimina 30 enemigos", goal: 30, reward: "+220 oro", claim: () => { state.gold += 220; }, progress: () => state.kills },
  room25: { title: "Explorador", text: "Llega a sala 25", goal: 25, reward: "+4 esencias", claim: () => { state.shards += 4; }, progress: () => state.room },
  crit20: { title: "Cirujano", text: "Haz 20 criticos", goal: 20, reward: "+35% dano critico", claim: () => { state.multipliers.critMult += 0.35; }, progress: () => state.crits },
  boss3: { title: "Cazador de Jefes", text: "Derrota 3 bosses", goal: 3, reward: "+1 reliquia", claim: () => { grantRandomRelic(); }, progress: () => state.bossesKilled },
};

const events = [
  {
    title: "Mercader Pirata",
    subtitle: "Te ofrece un trato arriesgado",
    choices: [
      { label: "Comprar reliquia (120 oro)", do: () => {
        if (state.gold < 120) return "No tienes suficiente oro";
        state.gold -= 120;
        grantRandomRelic();
        return "Trato cerrado";
      } },
      { label: "Cobrar oro seguro", do: () => { state.gold += 130; return "+130 oro"; } },
      { label: "Ignorar", do: () => "Sigues adelante" },
    ],
  },
  {
    title: "Fuente de Fuego",
    subtitle: "Canaliza energia elemental",
    choices: [
      { label: "Bendecir arma", do: () => { state.multipliers.tap *= 1.2; return "+20% dano"; } },
      { label: "Absorber calor", do: () => { state.multipliers.dps *= 1.2; return "+20% DPS"; } },
      { label: "Sacrificar 2 esencias", do: () => {
        if (state.shards < 2) return "No tienes esencias";
        state.shards -= 2;
        state.multipliers.gold *= 1.3;
        return "+30% oro";
      } },
    ],
  },
];

const ui = {
  runStatus: document.getElementById("runStatus"),
  gold: document.getElementById("gold"),
  tapDamage: document.getElementById("tapDamage"),
  dps: document.getElementById("dps"),
  shards: document.getElementById("shards"),
  combo: document.getElementById("combo"),
  critChance: document.getElementById("critChance"),
  bosses: document.getElementById("bosses"),
  cards: document.getElementById("cards"),
  enemyName: document.getElementById("enemyName"),
  enemyMeta: document.getElementById("enemyMeta"),
  stage: document.getElementById("stage"),
  hpBar: document.getElementById("hpBar"),
  hpText: document.getElementById("hpText"),
  overdriveBar: document.getElementById("overdriveBar"),
  overdriveText: document.getElementById("overdriveText"),
  combatLog: document.getElementById("combatLog"),
  attackBtn: document.getElementById("attackBtn"),
  attackPreview: document.getElementById("attackPreview"),
  furyBtn: document.getElementById("furyBtn"),
  furyText: document.getElementById("furyText"),
  tabs: Array.from(document.querySelectorAll(".tab-btn")),
  panels: Array.from(document.querySelectorAll(".panel")),
  shopList: document.getElementById("shopList"),
  cardList: document.getElementById("cardList"),
  relicList: document.getElementById("relicList"),
  questList: document.getElementById("questList"),
  metaList: document.getElementById("metaList"),
  menuBtn: document.getElementById("menuBtn"),
  menuDialog: document.getElementById("menuDialog"),
  newRunBtn: document.getElementById("newRunBtn"),
  forceCardBtn: document.getElementById("forceCardBtn"),
  forceRelicBtn: document.getElementById("forceRelicBtn"),
  draftDialog: document.getElementById("draftDialog"),
  draftTitle: document.getElementById("draftTitle"),
  draftSubtitle: document.getElementById("draftSubtitle"),
  draftChoices: document.getElementById("draftChoices"),
};

function num(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

function deepAssign(target, source) {
  Object.keys(target).forEach((key) => {
    if (source[key] === undefined) return;
    if (typeof target[key] === "object" && target[key] && !Array.isArray(target[key])) {
      deepAssign(target[key], source[key] || {});
    } else {
      target[key] = source[key];
    }
  });
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    deepAssign(state, JSON.parse(raw));
  } catch {
    // Ignore invalid save.
  }
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function tapDamage() {
  return (state.tapBase + state.meta.tapBonus) * state.multipliers.tap * comboMult() * overdriveMult();
}

function dpsDamage() {
  return (state.dpsBase + state.meta.dpsBonus) * state.multipliers.dps * overdriveMult();
}

function comboMult() {
  return 1 + Math.min(1, state.combo * 0.04 + state.meta.comboBonus);
}

function overdriveMult() {
  return state.overdriveTime > 0 ? 1.6 * state.multipliers.overdrive : 1;
}

function critChance() {
  return Math.min(0.92, state.multipliers.critChance + state.meta.critBonus + state.prestige * 0.002);
}

function isBossRoom() {
  return state.room % 10 === 0;
}

function isEliteRoom() {
  return !isBossRoom() && state.room % 7 === 0;
}

function randomModId() {
  const keys = Object.keys(enemyMods);
  return keys[Math.floor(Math.random() * keys.length)];
}

function spawnEnemy() {
  const base = enemyBases[(state.room - 1) % enemyBases.length];
  const scale = Math.pow(1.21, state.room - 1);

  state.enemy.isBoss = isBossRoom();
  state.enemy.isElite = isEliteRoom();
  state.enemy.modId = state.enemy.isBoss ? null : (Math.random() < Math.min(0.5, 0.08 + state.room * 0.01) ? randomModId() : null);

  let hp = base.hp * scale * state.multipliers.enemyHp;

  if (state.enemy.isBoss) {
    const boss = bosses[(Math.floor(state.room / 10) - 1) % bosses.length];
    hp *= boss.hpMult;
    state.enemy.name = `${boss.name} - Boss`;
  } else if (state.enemy.isElite) {
    hp *= 2.2;
    state.enemy.name = `${base.name} Elite`;
  } else {
    state.enemy.name = base.name;
  }

  if (state.enemy.modId) {
    hp *= enemyMods[state.enemy.modId].hpMult || 1;
  }

  state.enemy.maxHp = Math.floor(hp);
  state.enemy.hp = state.enemy.maxHp;
  state.enemy.shield = state.enemy.isElite ? Math.floor(state.enemy.maxHp * 0.3) : 0;
}

function killReward() {
  const base = 12 + Math.floor(state.room * 1.45);
  let mult = state.multipliers.gold * (1 + state.meta.goldBonus + state.prestige * 0.01);
  if (state.enemy.modId && enemyMods[state.enemy.modId].goldMult) mult *= enemyMods[state.enemy.modId].goldMult;
  if (state.enemy.isElite) mult *= 1.45;
  if (state.enemy.isBoss) mult *= 2.3;
  return base * mult;
}

function shardReward() {
  let amount = 0;
  if (state.room % 5 === 0 || state.enemy.isBoss) amount += 1 + Math.floor(state.room / 25);
  if (state.enemy.isElite) amount += 1;
  if (Math.random() < state.multipliers.shardChance) amount += 1;
  return amount;
}

function applyQuestProgress() {
  Object.keys(questDefs).forEach((id) => {
    state.quests[id].progress = questDefs[id].progress();
  });
}

function onEnemyDown(source) {
  state.kills += 1;
  state.totalKills += 1;
  if (state.enemy.isBoss) state.bossesKilled += 1;

  const gold = killReward();
  const shards = shardReward();
  state.gold += gold;
  state.shards += shards;

  if (state.enemy.isBoss) {
    grantRandomRelic();
    if (hasRelic("crown")) grantRandomRelic();
  }

  state.room += 1;
  applyQuestProgress();
  spawnEnemy();

  if (state.room % 6 === 0) openRelicDraft();
  if (state.room % 12 === 0) openCardDraft();
  if (state.room % 8 === 0 && Math.random() < 0.7) openEventDialog();

  flash(`${source}: +${num(gold)} oro${shards ? `, +${shards} esencias` : ""}`);
  renderAll();
  save();
}

function applyDamage(raw, source) {
  let dmg = raw;
  if (state.enemy.modId && enemyMods[state.enemy.modId].damageReduction) {
    dmg *= 1 - enemyMods[state.enemy.modId].damageReduction;
  }

  if (state.enemy.shield > 0) {
    const shieldDmg = dmg * state.multipliers.shieldBreak;
    state.enemy.shield -= shieldDmg;
    if (state.enemy.shield < 0) {
      state.enemy.hp += state.enemy.shield;
      state.enemy.shield = 0;
    }
  } else {
    state.enemy.hp -= dmg;
  }

  if (state.enemy.hp < 0) state.enemy.hp = 0;
  renderLive();
  if (state.enemy.hp <= 0) onEnemyDown(source);
}

function normalHit() {
  state.combo += 1;
  state.comboTimer = 2.2;
  let dmg = tapDamage();

  const crit = Math.random() < critChance();
  if (crit) {
    dmg *= state.multipliers.critMult;
    state.crits += 1;
    state.overdriveCharge += 10;
  } else {
    state.overdriveCharge += 6;
  }

  if (state.overdriveCharge >= 100) {
    state.overdriveCharge = 0;
    state.overdriveTime = 8;
    flash("Overdrive activado");
  }

  applyQuestProgress();
  applyDamage(dmg, crit ? "CRIT" : "Golpe");
}

function furyHit() {
  if (state.furyCd > 0) return;
  const fury = (tapDamage() * 12 + dpsDamage() * 7) * (1 + state.meta.furyBonus);
  state.furyCd = 16;
  applyDamage(fury, "Furia");
  flash(`Furia: ${num(fury)} dano`);
}

function runUpgradeCost(id) {
  const def = runUpgrades.find((x) => x.id === id);
  if (!def) return 0;
  const lvl = state.run[id] || 0;
  return Math.floor(def.base * Math.pow(def.growth, lvl));
}

function buyRunUpgrade(id) {
  const def = runUpgrades.find((x) => x.id === id);
  if (!def) return;
  const cost = runUpgradeCost(id);
  if (state.gold < cost) return;
  state.gold -= cost;
  def.apply();
  renderAll();
  save();
}

function buyMetaUpgrade(id) {
  const def = metaUpgrades.find((x) => x.id === id);
  if (!def) return;
  const lvl = state.meta[id] || 0;
  const cost = def.cost(lvl);
  if (state.shards < cost) return;
  state.shards -= cost;
  def.apply();
  renderAll();
  save();
}

function claimQuest(id) {
  const quest = questDefs[id];
  const status = state.quests[id];
  if (!quest || !status || status.claimed) return;
  if (status.progress < quest.goal) return;
  status.claimed = true;
  quest.claim();
  flash(`Mision completada: ${quest.reward}`);
  renderAll();
  save();
}

function grantRelic(id) {
  if (state.relics.includes(id)) {
    state.gold += 120;
    return;
  }
  const relic = relicPool.find((r) => r.id === id);
  if (!relic) return;
  state.relics.push(id);
  relic.apply();
}

function grantRandomRelic() {
  const available = relicPool.filter((r) => !state.relics.includes(r.id));
  if (!available.length) {
    state.gold += 300;
    return;
  }
  const relic = available[Math.floor(Math.random() * available.length)];
  grantRelic(relic.id);
}

function grantCard(id) {
  if (state.cards.includes(id)) {
    state.gold += 150;
    return;
  }
  const card = cardPool.find((c) => c.id === id);
  if (!card) return;
  state.cards.push(id);
  card.apply();
  applyQuestProgress();
}

function pickOptions(pool, owned, n) {
  const available = pool.filter((x) => !owned.includes(x.id));
  const bag = available.length ? available : [...pool];
  const copy = [...bag];
  const result = [];
  while (result.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(i, 1)[0]);
  }
  return result;
}

function openDraft(title, subtitle, options, onPick) {
  ui.draftTitle.textContent = title;
  ui.draftSubtitle.textContent = subtitle;
  ui.draftChoices.innerHTML = options.map((opt) => (
    `<button type="button" class="choice-btn" data-choice="${opt.id}"><strong>${opt.name}</strong><br>${opt.desc}</button>`
  )).join("");

  ui.draftChoices.onclick = (ev) => {
    const btn = ev.target.closest("button[data-choice]");
    if (!btn) return;
    onPick(btn.dataset.choice);
    ui.draftDialog.close();
    renderAll();
    save();
  };

  if (!ui.draftDialog.open) ui.draftDialog.showModal();
}

function openRelicDraft() {
  const opts = pickOptions(relicPool, state.relics, 3);
  openDraft("Elige 1 Reliquia", `Tienes ${state.relics.length} reliquias`, opts, (id) => {
    grantRelic(id);
    flash("Reliquia obtenida");
  });
}

function openCardDraft() {
  const opts = pickOptions(cardPool, state.cards, 3);
  openDraft("Elige 1 Carta", `Tienes ${state.cards.length} cartas`, opts, (id) => {
    grantCard(id);
    flash("Carta equipada");
  });
}

function openEventDialog() {
  const event = events[Math.floor(Math.random() * events.length)];
  openDraft(event.title, event.subtitle, event.choices.map((c, i) => ({ id: String(i), name: c.label, desc: "" })), (id) => {
    const result = event.choices[Number(id)].do();
    flash(result);
  });
}

function hasRelic(id) {
  return state.relics.includes(id);
}

function renderPanelTabs() {
  ui.tabs.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === state.activePanel));
  ui.panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === state.activePanel));
}

function renderShop() {
  ui.shopList.innerHTML = runUpgrades.map((u) => {
    const cost = runUpgradeCost(u.id);
    const can = state.gold >= cost;
    return `
      <article class="item">
        <div>
          <h4>${u.name}</h4>
          <p>${u.desc}</p>
          <span class="badge run">Run</span>
        </div>
        <button type="button" class="buy-btn" data-run-buy="${u.id}" ${can ? "" : "disabled"}>${num(cost)}</button>
      </article>
    `;
  }).join("");
}

function renderMeta() {
  ui.metaList.innerHTML = metaUpgrades.map((u) => {
    const lvl = state.meta[u.id] || 0;
    const cost = u.cost(lvl);
    const can = state.shards >= cost;
    return `
      <article class="item">
        <div>
          <h4>${u.name} <span style="opacity:.6;">Lv.${lvl}</span></h4>
          <p>${u.desc}</p>
          <span class="badge perm">Permanente</span>
        </div>
        <button type="button" class="buy-btn" data-meta-buy="${u.id}" ${can ? "" : "disabled"}>${num(cost)}</button>
      </article>
    `;
  }).join("");
}

function renderRelics() {
  if (!state.relics.length) {
    ui.relicList.innerHTML = "<div class='relic-badge'><strong>Sin reliquias</strong><p>Consigue una cada 6 salas y en bosses.</p></div>";
    return;
  }
  ui.relicList.innerHTML = state.relics.map((id) => {
    const r = relicPool.find((x) => x.id === id);
    if (!r) return "";
    return `<div class="relic-badge"><strong>${r.name}</strong><p>${r.desc}</p></div>`;
  }).join("");
}

function renderCards() {
  if (!state.cards.length) {
    ui.cardList.innerHTML = "<div class='card-badge'><strong>Sin cartas</strong><p>Recibe draft de cartas cada 12 salas.</p></div>";
    return;
  }
  ui.cardList.innerHTML = state.cards.map((id) => {
    const c = cardPool.find((x) => x.id === id);
    if (!c) return "";
    return `<div class="card-badge"><strong>${c.name}</strong><p>${c.desc}</p></div>`;
  }).join("");
}

function renderQuests() {
  ui.questList.innerHTML = Object.entries(questDefs).map(([id, q]) => {
    const s = state.quests[id];
    const done = s.progress >= q.goal;
    return `
      <article class="item">
        <div>
          <h4>${q.title}</h4>
          <p>${q.text}</p>
          <p>${s.progress} / ${q.goal}</p>
          <span class="badge quest">${q.reward}</span>
        </div>
        <button type="button" class="buy-btn" data-quest-claim="${id}" ${done && !s.claimed ? "" : "disabled"}>${s.claimed ? "Cobrada" : "Cobrar"}</button>
      </article>
    `;
  }).join("");
}

function renderLive() {
  const tap = tapDamage();
  const dps = dpsDamage();

  ui.runStatus.textContent = `Sala ${state.room} | Prestige ${state.prestige}`;
  ui.gold.textContent = num(state.gold);
  ui.tapDamage.textContent = num(tap);
  ui.dps.textContent = num(dps);
  ui.shards.textContent = num(state.shards);
  ui.combo.textContent = `x${comboMult().toFixed(2)}`;
  ui.critChance.textContent = `${(critChance() * 100).toFixed(1)}%`;
  ui.bosses.textContent = num(state.bossesKilled);
  ui.cards.textContent = num(state.cards.length);

  ui.enemyName.textContent = state.enemy.name;
  ui.stage.textContent = state.enemy.isBoss ? `Boss ${state.room}` : `Sala ${state.room}`;
  ui.enemyMeta.textContent = state.enemy.isBoss
    ? "Jefe: gran recompensa"
    : state.enemy.isElite
      ? "Elite: escudo activo"
      : (state.enemy.modId ? `[${enemyMods[state.enemy.modId].name}] ${enemyMods[state.enemy.modId].desc}` : "Normal");

  const hpPct = (state.enemy.hp / state.enemy.maxHp) * 100;
  ui.hpBar.style.width = `${Math.max(0, hpPct)}%`;
  ui.hpText.textContent = `${num(state.enemy.hp)} / ${num(state.enemy.maxHp)}${state.enemy.shield > 0 ? ` | Escudo ${num(state.enemy.shield)}` : ""}`;

  const oPct = state.overdriveTime > 0 ? 100 : Math.min(100, state.overdriveCharge);
  ui.overdriveBar.style.width = `${oPct}%`;
  ui.overdriveText.textContent = state.overdriveTime > 0
    ? `Overdrive activo ${state.overdriveTime.toFixed(1)}s`
    : `Overdrive ${Math.floor(state.overdriveCharge)}%`;

  ui.attackPreview.textContent = `+${num(tap)}`;
  if (state.furyCd <= 0) {
    ui.furyBtn.disabled = false;
    ui.furyText.textContent = "Lista";
  } else {
    ui.furyBtn.disabled = true;
    ui.furyText.textContent = `${state.furyCd.toFixed(1)}s`;
  }
}

function renderAll() {
  applyQuestProgress();
  renderPanelTabs();
  renderShop();
  renderMeta();
  renderRelics();
  renderCards();
  renderQuests();
  renderLive();
}

function flash(text) {
  ui.combatLog.textContent = text;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => {
    ui.combatLog.textContent = "";
  }, 1600);
}

function hardResetRun() {
  state.prestige += Math.floor(state.totalKills / 55);
  state.room = 1;
  state.kills = 0;
  state.crits = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.furyCd = 0;
  state.overdriveCharge = 0;
  state.overdriveTime = 0;
  state.tapBase = 1;
  state.dpsBase = 0;
  state.run = { blade: 0, familiar: 0, greed: 0, mirror: 0, rune: 0 };
  state.relics = [];
  state.cards = [];
  state.multipliers = {
    tap: 1,
    dps: 1,
    critChance: 0,
    critMult: 1.7,
    gold: 1,
    enemyHp: 1,
    shieldBreak: 1,
    overdrive: 1,
    shardChance: 0,
  };
  state.quests = {
    kills30: { progress: 0, claimed: false },
    room25: { progress: 0, claimed: false },
    crit20: { progress: 0, claimed: false },
    boss3: { progress: 0, claimed: false },
  };
  spawnEnemy();
  renderAll();
  save();
}

function setupInteractions() {
  ui.attackBtn.addEventListener("pointerup", (e) => {
    e.preventDefault();
    normalHit();
  });

  ui.furyBtn.addEventListener("pointerup", (e) => {
    e.preventDefault();
    furyHit();
  });

  ui.tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activePanel = btn.dataset.tab;
      renderPanelTabs();
    });
  });

  ui.shopList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-run-buy]");
    if (!btn) return;
    buyRunUpgrade(btn.dataset.runBuy);
  });

  ui.metaList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-meta-buy]");
    if (!btn) return;
    buyMetaUpgrade(btn.dataset.metaBuy);
  });

  ui.questList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-quest-claim]");
    if (!btn) return;
    claimQuest(btn.dataset.questClaim);
  });

  ui.menuBtn.addEventListener("click", () => {
    if (!ui.menuDialog.open) ui.menuDialog.showModal();
  });

  ui.newRunBtn.addEventListener("click", () => {
    ui.menuDialog.close();
    hardResetRun();
    flash("Nueva run iniciada");
  });

  ui.forceCardBtn.addEventListener("click", () => {
    ui.menuDialog.close();
    openCardDraft();
  });

  ui.forceRelicBtn.addEventListener("click", () => {
    ui.menuDialog.close();
    openRelicDraft();
  });

  // Block iOS double-tap zoom and pinch.
  let lastTouchEnd = 0;
  document.addEventListener("touchend", (event) => {
    const now = Date.now();
    if (now - lastTouchEnd < 280) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener("gesturestart", (event) => {
    event.preventDefault();
  }, { passive: false });
}

function loopStart() {
  let last = performance.now();
  setInterval(() => save(), 3000);

  function frame(now) {
    const dt = Math.min(0.2, (now - last) / 1000);
    last = now;

    if (dpsDamage() > 0) applyDamage(dpsDamage() * dt, "DPS");

    if (state.enemy.modId === "regen") {
      state.enemy.hp += state.enemy.maxHp * (enemyMods.regen.regen || 0) * dt;
      if (state.enemy.hp > state.enemy.maxHp) state.enemy.hp = state.enemy.maxHp;
    }

    state.comboTimer -= dt;
    if (state.comboTimer <= 0 && state.combo > 0) {
      state.combo -= 1;
      state.comboTimer = 0.24;
    }

    if (state.furyCd > 0) state.furyCd -= dt;
    if (state.furyCd < 0) state.furyCd = 0;

    if (state.overdriveTime > 0) state.overdriveTime -= dt;
    if (state.overdriveTime < 0) state.overdriveTime = 0;

    renderLive();
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function start() {
  load();
  if (!state.enemy.hp || state.enemy.hp <= 0) spawnEnemy();
  setupInteractions();
  renderAll();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  loopStart();
}

start();
