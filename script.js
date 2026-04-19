const SAVE_KEY = "arcanaTap_v4";

const state = {
  gold: 0,
  shards: 0,
  prestige: 0,
  room: 1,
  kills: 0,
  totalKills: 0,
  bossesKilled: 0,
  crits: 0,
  taps: 0,
  comboCount: 0,
  comboTimer: 0,
  furyCooldown: 0,
  overdriveCharge: 0,
  overdriveTime: 0,
  tapDamageBase: 1,
  dpsBase: 0,
  enemy: {
    name: "Slime del Sotano",
    maxHp: 22,
    hp: 22,
    shield: 0,
    isBoss: false,
    isElite: false,
    modId: null,
  },
  meta: {
    tapBonus: 0,
    dpsBonus: 0,
    critChance: 0,
    goldBonus: 0,
    comboBonus: 0,
    furyPower: 0,
    overdrivePower: 0,
  },
  runUpgrades: {
    blade: 0,
    familiar: 0,
    chalice: 0,
    mirror: 0,
    rune: 0,
    anvil: 0,
  },
  ownedRelicIds: [],
  ownedCardIds: [],
  modifiers: {
    tapMult: 1,
    dpsMult: 1,
    goldMult: 1,
    critChance: 0,
    critMult: 1.7,
    enemyHpMult: 1,
    comboMult: 1,
    furyMult: 1,
    overdriveMult: 1,
    shieldBreak: 1,
    shardChance: 0,
  },
  quests: {
    q_kills_30: { progress: 0, claimed: false },
    q_room_25: { progress: 0, claimed: false },
    q_crits_20: { progress: 0, claimed: false },
    q_boss_3: { progress: 0, claimed: false },
    q_cards_4: { progress: 0, claimed: false },
  },
};

const enemies = [
  { name: "Slime del Sotano", baseHp: 22 },
  { name: "Murcielago Ciego", baseHp: 18 },
  { name: "Payaso de Carton", baseHp: 28 },
  { name: "Cuervo Oxidado", baseHp: 25 },
  { name: "Mago de Ceniza", baseHp: 34 },
  { name: "Angel de Plomo", baseHp: 42 },
  { name: "Arana de Cristal", baseHp: 51 },
];

const bosses = [
  { name: "The Collector", hpMult: 4.7 },
  { name: "Reina Tuerca", hpMult: 5.5 },
  { name: "Ojo Carmesi", hpMult: 6.3 },
  { name: "Monarca de Sal", hpMult: 7.2 },
];

const enemyMods = {
  accelerated: { name: "Acelerado", desc: "Menos vida, mas agresivo", hpMult: 0.86, regen: 0 },
  armored: { name: "Blindado", desc: "Mitiga dano", hpMult: 1.36, dmgReduction: 0.3, regen: 0 },
  regenerating: { name: "Regenerador", desc: "Recupera vida", hpMult: 1.2, regen: 0.06 },
  rich: { name: "Acaparador", desc: "Suelta mucho mas oro", hpMult: 1.08, goldBonus: 0.7 },
  unstable: { name: "Inestable", desc: "Vida alta, premio alto", hpMult: 1.5, goldBonus: 0.45 },
};

const runShop = [
  { id: "blade", name: "Cuchilla Astillada", desc: "+1.8 dano base", tag: "Run", baseCost: 18, growth: 1.5,
    buy: () => { state.runUpgrades.blade += 1; state.tapDamageBase += 1.8; } },
  { id: "familiar", name: "Familiar de Laton", desc: "+1.4 DPS", tag: "Run", baseCost: 26, growth: 1.56,
    buy: () => { state.runUpgrades.familiar += 1; state.dpsBase += 1.4; } },
  { id: "chalice", name: "Caliz Dorado", desc: "+16% oro", tag: "Eco", baseCost: 34, growth: 1.62,
    buy: () => { state.runUpgrades.chalice += 1; state.modifiers.goldMult *= 1.16; } },
  { id: "mirror", name: "Espejo Roto", desc: "+10% critico", tag: "Crit", baseCost: 42, growth: 1.68,
    buy: () => { state.runUpgrades.mirror += 1; state.modifiers.critChance += 0.1; } },
  { id: "rune", name: "Runa de Sangre", desc: "+18% dano de golpe", tag: "Run", baseCost: 58, growth: 1.72,
    buy: () => { state.runUpgrades.rune += 1; state.modifiers.tapMult *= 1.18; } },
  { id: "anvil", name: "Yunque Arcano", desc: "+20% DPS", tag: "Run", baseCost: 66, growth: 1.75,
    buy: () => { state.runUpgrades.anvil += 1; state.modifiers.dpsMult *= 1.2; } },
];

const metaShop = [
  { id: "tapBonus", name: "Guante de Hierro", desc: "+1 dano permanente", cost: (lvl) => Math.floor(10 * Math.pow(1.85, lvl)),
    buy: () => { state.meta.tapBonus += 1; } },
  { id: "dpsBonus", name: "Totem de Bronce", desc: "+1 DPS permanente", cost: (lvl) => Math.floor(12 * Math.pow(1.9, lvl)),
    buy: () => { state.meta.dpsBonus += 1; } },
  { id: "critChance", name: "Moneda Marcada", desc: "+4% critico permanente", cost: (lvl) => Math.floor(15 * Math.pow(2.0, lvl)),
    buy: () => { state.meta.critChance += 0.04; } },
  { id: "goldBonus", name: "Cofre Infinito", desc: "+10% oro permanente", cost: (lvl) => Math.floor(18 * Math.pow(2.05, lvl)),
    buy: () => { state.meta.goldBonus += 0.1; } },
  { id: "comboBonus", name: "Cadena de Titanio", desc: "+6% combo base", cost: (lvl) => Math.floor(20 * Math.pow(2.2, lvl)),
    buy: () => { state.meta.comboBonus += 0.06; } },
  { id: "furyPower", name: "Nucleo de Ira", desc: "+15% dano de Furia", cost: (lvl) => Math.floor(24 * Math.pow(2.35, lvl)),
    buy: () => { state.meta.furyPower += 0.15; } },
  { id: "overdrivePower", name: "Catalizador Neon", desc: "+12% Overdrive", cost: (lvl) => Math.floor(26 * Math.pow(2.4, lvl)),
    buy: () => { state.meta.overdrivePower += 0.12; } },
];

const relicPool = [
  { id: "joker", name: "Joker Roto", desc: "+42% dano", rarity: "rare", apply: () => { state.modifiers.tapMult *= 1.42; } },
  { id: "blood", name: "Sangre Fria", desc: "+60% DPS", rarity: "epic", apply: () => { state.modifiers.dpsMult *= 1.6; } },
  { id: "coin", name: "Moneda Negra", desc: "+40% oro", rarity: "rare", apply: () => { state.modifiers.goldMult *= 1.4; } },
  { id: "tear", name: "Lagrima Prismatica", desc: "+14% critico", rarity: "rare", apply: () => { state.modifiers.critChance += 0.14; } },
  { id: "rage", name: "Anillo de Furia", desc: "+35% dano critico", rarity: "epic", apply: () => { state.modifiers.critMult += 0.35; } },
  { id: "storm", name: "Punio de Trueno", desc: "+0.35 combo max", rarity: "epic", apply: () => { state.modifiers.comboMult += 0.35; } },
  { id: "furnace", name: "Corazon de Horno", desc: "Furia +40%", rarity: "legendary", apply: () => { state.modifiers.furyMult *= 1.4; } },
  { id: "miner", name: "Pico Fantasma", desc: "+18% chance esencias", rarity: "epic", apply: () => { state.modifiers.shardChance += 0.18; } },
  { id: "duelist", name: "Sello Duelista", desc: "+22% dano de golpe", rarity: "rare", apply: () => { state.modifiers.tapMult *= 1.22; } },
  { id: "engine", name: "Motor Obsidiana", desc: "+24% dano y +24% DPS", rarity: "legendary", apply: () => { state.modifiers.tapMult *= 1.24; state.modifiers.dpsMult *= 1.24; } },
  { id: "crown", name: "Corona Hueca", desc: "+1 reliquia extra en bosses", rarity: "legendary", apply: () => {} },
];

const cardPool = [
  { id: "glass-cannon", name: "Vidrio Rojo", desc: "+35% dano, enemigos +10% HP", apply: () => { state.modifiers.tapMult *= 1.35; state.modifiers.enemyHpMult *= 1.1; } },
  { id: "tempo", name: "Tempo Azul", desc: "+0.20 combo y +20% DPS", apply: () => { state.modifiers.comboMult += 0.2; state.modifiers.dpsMult *= 1.2; } },
  { id: "breaker", name: "Quebrador", desc: "+45% dano a escudos", apply: () => { state.modifiers.shieldBreak *= 1.45; } },
  { id: "siphon", name: "Sifon", desc: "+20% oro y +10% esencias", apply: () => { state.modifiers.goldMult *= 1.2; state.modifiers.shardChance += 0.1; } },
  { id: "afterburn", name: "Postcombustion", desc: "Overdrive +25%", apply: () => { state.modifiers.overdriveMult *= 1.25; } },
  { id: "frenzy", name: "Frenesi", desc: "Furia recarga 10% mas rapido", apply: () => { state.furyCooldown = Math.max(0, state.furyCooldown - 1.6); } },
  { id: "precision", name: "Precision", desc: "+9% critico", apply: () => { state.modifiers.critChance += 0.09; } },
  { id: "echo", name: "Eco", desc: "+14% dano y +14% DPS", apply: () => { state.modifiers.tapMult *= 1.14; state.modifiers.dpsMult *= 1.14; } },
];

const quests = {
  q_kills_30: { title: "Carnicero", goal: 30, text: "Elimina 30 enemigos en la run", rewardText: "+220 oro", reward: () => { state.gold += 220; }, readProgress: () => state.kills },
  q_room_25: { title: "Explorador", goal: 25, text: "Llega a la Sala 25", rewardText: "+4 esencias", reward: () => { state.shards += 4; }, readProgress: () => state.room },
  q_crits_20: { title: "Cirujano", goal: 20, text: "Realiza 20 golpes criticos", rewardText: "+35% dano critico (run)", reward: () => { state.modifiers.critMult += 0.35; }, readProgress: () => state.crits },
  q_boss_3: { title: "Cazador de Jefes", goal: 3, text: "Derrota 3 bosses", rewardText: "+1 reliquia", reward: () => { grantRandomRelic(); }, readProgress: () => state.bossesKilled },
  q_cards_4: { title: "Arquitecto", goal: 4, text: "Consigue 4 cartas", rewardText: "+300 oro", reward: () => { state.gold += 300; }, readProgress: () => state.ownedCardIds.length },
};

const events = [
  {
    title: "Mercader Pirata",
    desc: "Te ofrece un trato arriesgado.",
    choices: [
      { text: "Comprar Reliquia (120 oro)", effect: () => {
        if (state.gold < 120) return "No tienes suficiente oro";
        state.gold -= 120;
        grantRandomRelic();
        return "Trato cerrado";
      } },
      { text: "Robarle", effect: () => {
        if (Math.random() < 0.55) {
          state.gold += 170;
          return "Robo exitoso: +170 oro";
        }
        state.gold = Math.max(0, state.gold - 120);
        return "Te atraparon: -120 oro";
      } },
      { text: "Ignorar", effect: () => "Sigues tu camino" },
    ],
  },
  {
    title: "Fuente de Fuego",
    desc: "Una fuente arde con energia estable.",
    choices: [
      { text: "Bendecir arma", effect: () => { state.modifiers.tapMult *= 1.2; return "+20% dano de golpe"; } },
      { text: "Absorber calor", effect: () => { state.modifiers.dpsMult *= 1.2; return "+20% DPS"; } },
      { text: "Ofrecer esencias", effect: () => {
        if (state.shards < 2) return "Necesitas 2 esencias";
        state.shards -= 2;
        state.modifiers.goldMult *= 1.3;
        return "Pacto sellado: +30% oro";
      } },
    ],
  },
  {
    title: "Mesa de Cartas",
    desc: "Un dealer te deja elegir una carta.",
    choices: [
      { text: "Tomar carta", effect: () => { openCardDraft(); return "Elige tu carta"; } },
      { text: "Cobrar oro", effect: () => { state.gold += 130; return "+130 oro"; } },
      { text: "Intercambiar reliquia", effect: () => {
        if (!state.ownedRelicIds.length) return "No tienes reliquias";
        state.ownedRelicIds.pop();
        grantRandomRelic();
        return "Intercambio realizado";
      } },
    ],
  },
];

const $ = (id) => document.getElementById(id);
const ui = {
  gold: $("gold"), tapDamage: $("tapDamage"), dps: $("dps"), shards: $("shards"),
  prestige: $("prestige"), relicCount: $("relicCount"), comboValue: $("comboValue"), bossCount: $("bossCount"), cardCount: $("cardCount"),
  enemyName: $("enemyName"), enemyMods: $("enemyMods"), stageLabel: $("stageLabel"), hpText: $("hpText"), hpBar: $("hpBar"),
  overdriveBar: $("overdriveBar"), overdriveText: $("overdriveText"),
  attackBtn: $("attackBtn"), skillBtn: $("skillBtn"), skillText: $("skillText"), runInfo: $("runInfo"), damagePreview: $("damagePreview"),
  floatingLog: $("floatingLog"), shopGrid: $("shopGrid"), metaGrid: $("metaGrid"), questList: $("questList"), cardList: $("cardList"),
  relicDialog: $("relicDialog"), relicChoices: $("relicChoices"), relicSubtitle: $("relicSubtitle"),
  eventDialog: $("eventDialog"), eventTitle: $("eventTitle"), eventDesc: $("eventDesc"), eventChoices: $("eventChoices"),
  cardDialog: $("cardDialog"), cardSubtitle: $("cardSubtitle"), cardChoices: $("cardChoices"),
  resetRunBtn: $("resetRunBtn"), activeRelics: $("activeRelics"), prestigeBar: $("prestigeBar"),
};

function safeAssign(target, incoming) {
  Object.keys(target).forEach((k) => {
    if (incoming[k] !== undefined) {
      if (typeof target[k] === "object" && target[k] !== null && !Array.isArray(target[k])) {
        safeAssign(target[k], incoming[k] || {});
      } else {
        target[k] = incoming[k];
      }
    }
  });
}

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try { safeAssign(state, JSON.parse(raw)); } catch {}
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function num(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

function currentComboMult() {
  const base = 1 + Math.min(0.95, state.comboCount * 0.04 + state.meta.comboBonus);
  return base * state.modifiers.comboMult;
}

function currentOverdriveMult() {
  if (state.overdriveTime <= 0) return 1;
  return 1.65 * state.modifiers.overdriveMult * (1 + state.meta.overdrivePower);
}

function currentTapDamage() {
  const base = state.tapDamageBase + state.meta.tapBonus;
  return Math.max(1, base * state.modifiers.tapMult * currentComboMult() * currentOverdriveMult());
}

function currentDps() {
  const base = state.dpsBase + state.meta.dpsBonus;
  return Math.max(0, base * state.modifiers.dpsMult * currentOverdriveMult());
}

function currentCritChance() {
  return Math.min(0.92, state.modifiers.critChance + state.meta.critChance + state.prestige * 0.002);
}

function isBossRoom() {
  return state.room % 10 === 0;
}

function isEliteRoom() {
  return !isBossRoom() && state.room % 7 === 0;
}

function randomEnemyModId() {
  const keys = Object.keys(enemyMods);
  return keys[Math.floor(Math.random() * keys.length)];
}

function spawnEnemy() {
  const baseEnemy = enemies[(state.room - 1) % enemies.length];
  const roomScale = Math.pow(1.21, state.room - 1);

  state.enemy.isBoss = isBossRoom();
  state.enemy.isElite = isEliteRoom();
  state.enemy.modId = state.enemy.isBoss ? null : (Math.random() < Math.min(0.5, 0.06 + state.room * 0.012) ? randomEnemyModId() : null);

  const bossData = bosses[(Math.floor(state.room / 10) - 1 + bosses.length) % bosses.length];
  let hp = baseEnemy.baseHp * roomScale * state.modifiers.enemyHpMult;

  if (state.enemy.isBoss) {
    hp *= bossData.hpMult;
    state.enemy.name = `${bossData.name} - Boss ${state.room}`;
  } else if (state.enemy.isElite) {
    hp *= 2.2;
    state.enemy.name = `${baseEnemy.name} Elite`;
  } else {
    state.enemy.name = baseEnemy.name;
  }

  if (state.enemy.modId) {
    const mod = enemyMods[state.enemy.modId];
    hp *= mod.hpMult || 1;
  }

  state.enemy.maxHp = Math.floor(hp);
  state.enemy.hp = state.enemy.maxHp;
  state.enemy.shield = state.enemy.isElite ? Math.floor(state.enemy.maxHp * 0.3) : 0;
}

function rewardForKill() {
  const base = 12 + Math.floor(state.room * 1.45);
  let mult = state.modifiers.goldMult * (1 + state.meta.goldBonus + state.prestige * 0.01);
  if (state.enemy.modId && enemyMods[state.enemy.modId].goldBonus) mult *= 1 + enemyMods[state.enemy.modId].goldBonus;
  if (state.enemy.isElite) mult *= 1.5;
  if (state.enemy.isBoss) mult *= 2.4;
  return base * mult;
}

function shardDrop() {
  let gain = 0;
  if (state.room % 5 === 0 || state.enemy.isBoss) gain += 1 + Math.floor(state.room / 25);
  if (state.enemy.isElite) gain += 1;
  if (Math.random() < state.modifiers.shardChance) gain += 1;
  return gain;
}

function applyQuestProgress() {
  Object.keys(quests).forEach((id) => {
    if (state.quests[id]) state.quests[id].progress = quests[id].readProgress();
  });
}

function activateOverdrive() {
  state.overdriveCharge = 0;
  state.overdriveTime = 8.0;
  flash("Overdrive activado");
}

function applyEnemyDamage(amount) {
  let dmg = amount;
  if (state.enemy.modId && enemyMods[state.enemy.modId].dmgReduction) {
    dmg *= 1 - enemyMods[state.enemy.modId].dmgReduction;
  }

  if (state.enemy.shield > 0) {
    const shieldDmg = dmg * state.modifiers.shieldBreak;
    state.enemy.shield -= shieldDmg;
    if (state.enemy.shield < 0) {
      state.enemy.hp += state.enemy.shield;
      state.enemy.shield = 0;
    }
  } else {
    state.enemy.hp -= dmg;
  }

  if (state.enemy.hp < 0) state.enemy.hp = 0;
}

function onEnemyDefeated(source) {
  state.kills += 1;
  state.totalKills += 1;

  const reward = rewardForKill();
  const shard = shardDrop();
  state.gold += reward;
  state.shards += shard;

  if (state.enemy.isBoss) {
    state.bossesKilled += 1;
    grantRandomRelic();
    if (hasRelic("crown")) grantRandomRelic();
    flash(`${source}: Boss derrotado +${num(reward)} oro, +${shard} esencias`);
  } else if (state.enemy.isElite) {
    flash(`${source}: Elite derrotado +${num(reward)} oro, +${shard} esencias`);
  } else {
    flash(`${source}: +${num(reward)} oro${shard > 0 ? `, +${shard} esencias` : ""}`);
  }

  state.room += 1;
  applyQuestProgress();
  spawnEnemy();

  if (state.room % 6 === 0) openRelicDraft();
  if (state.room % 12 === 0) openCardDraft();
  if (state.room % 8 === 0 && Math.random() < 0.7) openEventDialog();

  render();
  save();
}

function damageEnemy(amount, source = "Golpe") {
  applyEnemyDamage(amount);
  render();
  if (state.enemy.hp <= 0) onEnemyDefeated(source);
}

function grantRelic(relicId) {
  if (state.ownedRelicIds.includes(relicId)) {
    state.gold += 120;
    return;
  }
  const relic = relicPool.find((r) => r.id === relicId);
  if (!relic) return;
  state.ownedRelicIds.push(relicId);
  relic.apply();
}

function grantRandomRelic() {
  const options = relicPool.filter((r) => !state.ownedRelicIds.includes(r.id));
  if (!options.length) {
    state.gold += 300;
    return;
  }
  const relic = options[Math.floor(Math.random() * options.length)];
  grantRelic(relic.id);
}

function grantCard(cardId) {
  if (state.ownedCardIds.includes(cardId)) {
    state.gold += 180;
    return;
  }
  const card = cardPool.find((c) => c.id === cardId);
  if (!card) return;
  state.ownedCardIds.push(cardId);
  card.apply();
  applyQuestProgress();
}

function attackTap() {
  state.taps += 1;
  state.comboCount += 1;
  state.comboTimer = 2.2;

  let dmg = currentTapDamage();
  const isCrit = Math.random() < currentCritChance();
  if (isCrit) {
    dmg *= state.modifiers.critMult;
    state.crits += 1;
    state.overdriveCharge += 9;
  } else {
    state.overdriveCharge += 6;
  }

  if (state.overdriveCharge >= 100) activateOverdrive();
  applyQuestProgress();
  damageEnemy(dmg, isCrit ? "CRIT" : "Golpe");
}

function useFury() {
  if (state.furyCooldown > 0) return;
  const furyBase = (currentTapDamage() * 12 + currentDps() * 7) * (1 + state.meta.furyPower);
  const furyDamage = furyBase * state.modifiers.furyMult;
  state.furyCooldown = 16;
  damageEnemy(furyDamage, "Furia");
  flash(`FURIA: ${num(furyDamage)} dano`);
}

function upgradeCost(item) {
  const lvl = state.runUpgrades[item.id] || 0;
  return Math.floor(item.baseCost * Math.pow(item.growth, lvl));
}

function buyRunUpgrade(id) {
  const item = runShop.find((x) => x.id === id);
  if (!item) return;
  const cost = upgradeCost(item);
  if (state.gold < cost) return;
  state.gold -= cost;
  item.buy();
  render();
  save();
}

function buyMetaUpgrade(id) {
  const item = metaShop.find((x) => x.id === id);
  if (!item) return;
  const lvl = state.meta[id] || 0;
  const cost = item.cost(lvl);
  if (state.shards < cost) return;
  state.shards -= cost;
  item.buy();
  render();
  save();
}

function claimQuest(id) {
  const quest = quests[id];
  const status = state.quests[id];
  if (!quest || !status || status.claimed) return;
  if (status.progress < quest.goal) return;
  status.claimed = true;
  quest.reward();
  flash(`Mision completada: ${quest.rewardText}`);
  render();
  save();
}

function drawShop() {
  ui.shopGrid.innerHTML = "";
  runShop.forEach((item) => {
    const cost = upgradeCost(item);
    const canBuy = state.gold >= cost;
    const div = document.createElement("article");
    div.className = "item";
    div.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
        <span class="color-tag rare">${item.tag}</span>
      </div>
      <button class="buy-btn" ${canBuy ? "" : "disabled"}>${num(cost)}</button>
    `;
    div.querySelector("button").addEventListener("click", () => buyRunUpgrade(item.id));
    ui.shopGrid.appendChild(div);
  });
}

function drawMetaShop() {
  ui.metaGrid.innerHTML = "";
  metaShop.forEach((item) => {
    const lvl = state.meta[item.id] || 0;
    const cost = item.cost(lvl);
    const canBuy = state.shards >= cost;
    const div = document.createElement("article");
    div.className = "item";
    div.innerHTML = `
      <div>
        <h4>${item.name} <span style="opacity:0.6;">Lv.${lvl}</span></h4>
        <p>${item.desc}</p>
        <span class="color-tag epic">Permanente</span>
      </div>
      <button class="buy-btn" ${canBuy ? "" : "disabled"}>${num(cost)}</button>
    `;
    div.querySelector("button").addEventListener("click", () => buyMetaUpgrade(item.id));
    ui.metaGrid.appendChild(div);
  });
}

function drawQuests() {
  ui.questList.innerHTML = "";
  Object.entries(quests).forEach(([id, quest]) => {
    const status = state.quests[id];
    const pct = Math.min(100, Math.floor((status.progress / quest.goal) * 100));
    const done = status.progress >= quest.goal;
    const claimed = status.claimed;

    const div = document.createElement("article");
    div.className = "item";
    div.innerHTML = `
      <div>
        <h4>${quest.title}</h4>
        <p>${quest.text}</p>
        <p>${status.progress} / ${quest.goal} (${pct}%)</p>
        <span class="color-tag ${done ? "legendary" : "rare"}">${quest.rewardText}</span>
      </div>
      <button class="buy-btn" ${done && !claimed ? "" : "disabled"}>${claimed ? "Cobrada" : "Cobrar"}</button>
    `;
    div.querySelector("button").addEventListener("click", () => claimQuest(id));
    ui.questList.appendChild(div);
  });
}

function drawCards() {
  ui.cardList.innerHTML = "";
  if (!state.ownedCardIds.length) {
    ui.cardList.innerHTML = "<p style='color: var(--muted); font-size: 0.9rem;'>Sin cartas aun. Aparecen cada 12 salas.</p>";
    return;
  }
  state.ownedCardIds.forEach((id) => {
    const card = cardPool.find((c) => c.id === id);
    if (!card) return;
    const div = document.createElement("div");
    div.className = "card-badge";
    div.innerHTML = `<strong>${card.name}</strong><p>${card.desc}</p>`;
    ui.cardList.appendChild(div);
  });
}

function drawActiveRelics() {
  ui.activeRelics.innerHTML = "";
  if (!state.ownedRelicIds.length) {
    ui.activeRelics.innerHTML = "<p style='color: var(--muted); font-size: 0.9rem;'>Sin reliquias todavia. Sube salas y derrota bosses.</p>";
    return;
  }

  state.ownedRelicIds.forEach((id) => {
    const relic = relicPool.find((r) => r.id === id);
    if (!relic) return;
    const div = document.createElement("div");
    div.className = "relic-badge";
    div.innerHTML = `<strong>${relic.name}</strong><p>${relic.desc}</p>`;
    ui.activeRelics.appendChild(div);
  });
}

function pickUniqueOptions(pool, owned, n) {
  const available = pool.filter((x) => !owned.includes(x.id));
  const bag = available.length ? available : [...pool];
  const copy = [...bag];
  const picks = [];
  while (picks.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    picks.push(copy.splice(i, 1)[0]);
  }
  return picks;
}

function openRelicDraft() {
  ui.relicChoices.innerHTML = "";
  ui.relicSubtitle.textContent = `Elige 1 de 3 - Reliquias: ${state.ownedRelicIds.length}`;

  pickUniqueOptions(relicPool, state.ownedRelicIds, 3).forEach((relic) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "relic-btn";
    btn.innerHTML = `<strong>${relic.name}</strong><p>${relic.desc}</p><span class="color-tag ${relic.rarity}">${relic.rarity}</span>`;
    btn.addEventListener("click", () => {
      grantRelic(relic.id);
      ui.relicDialog.close();
      flash(`Reliquia: ${relic.name}`);
      render();
      save();
    });
    ui.relicChoices.appendChild(btn);
  });

  if (!ui.relicDialog.open) ui.relicDialog.showModal();
}

function openCardDraft() {
  ui.cardChoices.innerHTML = "";
  ui.cardSubtitle.textContent = `Elige 1 de 3 - Cartas: ${state.ownedCardIds.length}`;

  pickUniqueOptions(cardPool, state.ownedCardIds, 3).forEach((card) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "event-btn";
    btn.innerHTML = `<strong>${card.name}</strong><p>${card.desc}</p>`;
    btn.addEventListener("click", () => {
      grantCard(card.id);
      ui.cardDialog.close();
      flash(`Carta: ${card.name}`);
      render();
      save();
    });
    ui.cardChoices.appendChild(btn);
  });

  if (!ui.cardDialog.open) ui.cardDialog.showModal();
}

function openEventDialog() {
  const event = events[Math.floor(Math.random() * events.length)];
  ui.eventTitle.textContent = event.title;
  ui.eventDesc.textContent = event.desc;
  ui.eventChoices.innerHTML = "";

  event.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "event-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => {
      const result = choice.effect();
      ui.eventDialog.close();
      flash(result);
      render();
      save();
    });
    ui.eventChoices.appendChild(btn);
  });

  if (!ui.eventDialog.open) ui.eventDialog.showModal();
}

function resetRun() {
  state.prestige += Math.floor(state.totalKills / 55);
  state.room = 1;
  state.kills = 0;
  state.crits = 0;
  state.taps = 0;
  state.comboCount = 0;
  state.comboTimer = 0;
  state.furyCooldown = 0;
  state.overdriveCharge = 0;
  state.overdriveTime = 0;
  state.tapDamageBase = 1;
  state.dpsBase = 0;
  state.runUpgrades = { blade: 0, familiar: 0, chalice: 0, mirror: 0, rune: 0, anvil: 0 };
  state.ownedRelicIds = [];
  state.ownedCardIds = [];
  state.modifiers = {
    tapMult: 1,
    dpsMult: 1,
    goldMult: 1,
    critChance: 0,
    critMult: 1.7,
    enemyHpMult: 1,
    comboMult: 1,
    furyMult: 1,
    overdriveMult: 1,
    shieldBreak: 1,
    shardChance: 0,
  };
  state.quests = {
    q_kills_30: { progress: 0, claimed: false },
    q_room_25: { progress: 0, claimed: false },
    q_crits_20: { progress: 0, claimed: false },
    q_boss_3: { progress: 0, claimed: false },
    q_cards_4: { progress: 0, claimed: false },
  };

  spawnEnemy();
  render();
  save();
}

function flash(text) {
  ui.floatingLog.textContent = text;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { ui.floatingLog.textContent = ""; }, 1800);
}

function hasRelic(id) {
  return state.ownedRelicIds.includes(id);
}

function render() {
  const tap = currentTapDamage();
  const dps = currentDps();
  const critChance = currentCritChance();

  ui.gold.textContent = num(state.gold);
  ui.tapDamage.textContent = num(tap);
  ui.dps.textContent = num(dps);
  ui.shards.textContent = num(state.shards);
  ui.prestige.textContent = num(state.prestige);
  ui.relicCount.textContent = state.ownedRelicIds.length;
  ui.comboValue.textContent = `x${currentComboMult().toFixed(2)}`;
  ui.bossCount.textContent = num(state.bossesKilled);
  ui.cardCount.textContent = num(state.ownedCardIds.length);

  ui.damagePreview.textContent = `+${num(tap)}`;
  ui.stageLabel.textContent = state.enemy.isBoss ? `BOSS ${state.room}` : `Sala ${state.room}`;
  ui.hpText.textContent = `${num(state.enemy.hp)} / ${num(state.enemy.maxHp)}${state.enemy.shield > 0 ? ` | Escudo ${num(state.enemy.shield)}` : ""}`;

  const hpPct = (state.enemy.hp / state.enemy.maxHp) * 100;
  ui.hpBar.style.width = `${Math.max(0, hpPct)}%`;

  const overPct = state.overdriveTime > 0 ? 100 : Math.min(100, state.overdriveCharge);
  ui.overdriveBar.style.width = `${overPct}%`;
  ui.overdriveText.textContent = state.overdriveTime > 0 ? `Overdrive activo ${state.overdriveTime.toFixed(1)}s` : `Overdrive ${Math.floor(state.overdriveCharge)}%`;

  ui.enemyName.textContent = `Enemigo: ${state.enemy.name}`;
  if (state.enemy.modId) {
    const mod = enemyMods[state.enemy.modId];
    ui.enemyMods.textContent = `[${mod.name}] ${mod.desc}`;
  } else {
    ui.enemyMods.textContent = state.enemy.isBoss ? "Enemigo jefe: recompensa especial" : (state.enemy.isElite ? "Enemigo elite: tiene escudo" : "");
  }

  if (state.furyCooldown <= 0) {
    ui.skillBtn.disabled = false;
    ui.skillText.textContent = "Lista";
  } else {
    ui.skillBtn.disabled = true;
    ui.skillText.textContent = `${state.furyCooldown.toFixed(1)}s`;
  }

  ui.runInfo.textContent = `Crit ${(critChance * 100).toFixed(1)}% | Combo ${state.comboCount} | Sala ${state.room}`;
  ui.prestigeBar.textContent = `Prestige ${state.prestige} | Kills totales ${state.totalKills}`;

  drawShop();
  drawMetaShop();
  drawQuests();
  drawCards();
  drawActiveRelics();
}

function tick(dt) {
  const dps = currentDps();
  if (dps > 0) damageEnemy(dps * dt, "DPS");

  if (state.enemy.modId && enemyMods[state.enemy.modId].regen) {
    state.enemy.hp += state.enemy.maxHp * enemyMods[state.enemy.modId].regen * dt;
    if (state.enemy.hp > state.enemy.maxHp) state.enemy.hp = state.enemy.maxHp;
  }

  state.comboTimer -= dt;
  if (state.comboTimer <= 0 && state.comboCount > 0) {
    state.comboCount = Math.max(0, state.comboCount - 1);
    state.comboTimer = 0.24;
  }

  if (state.furyCooldown > 0) state.furyCooldown -= dt;
  if (state.furyCooldown < 0) state.furyCooldown = 0;

  if (state.overdriveTime > 0) state.overdriveTime -= dt;
  if (state.overdriveTime < 0) state.overdriveTime = 0;

  render();
}

function bindTap(button, handler) {
  let locked = false;
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (locked) return;
    locked = true;
    handler();
    setTimeout(() => { locked = false; }, 30);
  });
}

function setupEvents() {
  bindTap(ui.attackBtn, attackTap);
  bindTap(ui.skillBtn, useFury);

  ui.resetRunBtn.addEventListener("click", () => {
    if (confirm("Reiniciar run. Mantienes esencias y mejoras permanentes.")) {
      resetRun();
      flash("Nueva run iniciada");
    }
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      const tabName = btn.dataset.tab;
      document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add("active");
      btn.classList.add("active");
    });
  });
}

function start() {
  loadSave();
  if (!state.enemy.hp || state.enemy.hp <= 0) spawnEnemy();
  applyQuestProgress();
  setupEvents();
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  let last = performance.now();
  setInterval(() => save(), 3000);

  function loop(now) {
    const dt = Math.min(0.2, (now - last) / 1000);
    last = now;
    tick(dt);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

start();
