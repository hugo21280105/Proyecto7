const SAVE_KEY = "arcanaTap_v2";

const state = {
  gold: 0,
  shards: 0,
  prestige: 0,
  room: 1,
  kills: 0,
  totalKills: 0,
  tapDamageBase: 1,
  dpsBase: 0,
  enemyMaxHp: 22,
  enemyHp: 22,
  relics: [],
  meta: {
    tapBonus: 0,
    dpsBonus: 0,
    critChance: 0,
    goldBonus: 0,
  },
  modifiers: {
    tapMult: 1,
    dpsMult: 1,
    goldMult: 1,
    critChance: 0,
    critMult: 1.7,
    maxHpMult: 1,
  },
  runUpgrades: {
    blade: 0,
    familiar: 0,
    chalice: 0,
    mirror: 0,
  },
};

const enemies = [
  { name: "Slime del Sótano", baseHp: 22 },
  { name: "Murciélago Ciego", baseHp: 18 },
  { name: "Payaso de Cartón", baseHp: 28 },
  { name: "Cuervo Oxidado", baseHp: 25 },
  { name: "Mago de Ceniza", baseHp: 32 },
  { name: "Ángel de Plomo", baseHp: 40 },
  { name: "Jefe Tentáculo", baseHp: 55 },
];

const enemyMods = [
  { name: "Acelerado", desc: "Ataca 2x más rápido", hpMult: 1.1, dpsMult: 2 },
  { name: "Blindado", desc: "-30% daño recibido", hpMult: 1.4, dmgReduction: 0.3 },
  { name: "Regenerador", desc: "Recupera 8% HP", hpMult: 1.2, regen: 0.08 },
  { name: "Explosivo", desc: "Boom al morir", hpMult: 0.85, explosive: true },
];

const runShop = [
  { id: "blade", name: "Cuchilla Astillada", desc: "+1.5 daño", baseCost: 16, growth: 1.5,
    buy: () => { state.runUpgrades.blade += 1; state.tapDamageBase += 1.5; } },
  { id: "familiar", name: "Familiar de Latón", desc: "+1.2 DPS", baseCost: 24, growth: 1.55,
    buy: () => { state.runUpgrades.familiar += 1; state.dpsBase += 1.2; } },
  { id: "chalice", name: "Cáliz Dorado", desc: "+18% oro", baseCost: 32, growth: 1.62,
    buy: () => { state.runUpgrades.chalice += 1; state.modifiers.goldMult *= 1.18; } },
  { id: "mirror", name: "Espejo Roto", desc: "+12% crítico", baseCost: 40, growth: 1.68,
    buy: () => { state.runUpgrades.mirror += 1; state.modifiers.critChance += 0.12; } },
];

const metaShop = [
  { id: "tapBonus", name: "Guante de Hierro", desc: "+1 daño base",
    cost: (lvl) => Math.floor(8 * Math.pow(1.8, lvl)),
    buy: () => { state.meta.tapBonus += 1; } },
  { id: "dpsBonus", name: "Totem de Bronce", desc: "+1 DPS base",
    cost: (lvl) => Math.floor(10 * Math.pow(1.9, lvl)),
    buy: () => { state.meta.dpsBonus += 1; } },
  { id: "critChance", name: "Moneda Marcada", desc: "+5% crítico",
    cost: (lvl) => Math.floor(12 * Math.pow(2.1, lvl)),
    buy: () => { state.meta.critChance += 0.05; } },
  { id: "goldBonus", name: "Cofre Infinito", desc: "+12% oro",
    cost: (lvl) => Math.floor(14 * Math.pow(2.0, lvl)),
    buy: () => { state.meta.goldBonus += 0.12; } },
];

const relicPool = [
  { name: "Joker Roto", desc: "+48% daño", apply: () => { state.modifiers.tapMult *= 1.48; } },
  { name: "Sangre Fría", desc: "+65% DPS", apply: () => { state.modifiers.dpsMult *= 1.65; } },
  { name: "Moneda Marcada", desc: "+45% oro", apply: () => { state.modifiers.goldMult *= 1.45; } },
  { name: "Lagrima Prismática", desc: "+16% crítico", apply: () => { state.modifiers.critChance += 0.16; } },
  { name: "Furia del Pobre", desc: "+38% daño", apply: () => { state.modifiers.critMult += 0.25; } },
  { name: "Visión Eterna", desc: "+8% daño/reliquia", apply: () => { state.modifiers.tapMult += (state.relics.length * 0.08); } },
  { name: "Puño de Trueno", desc: "+1.2x crítico", apply: () => { state.modifiers.critMult *= 1.2; } },
  { name: "Anillo de Poder", desc: "+55% daño+DPS", apply: () => { state.modifiers.tapMult *= 1.3; state.modifiers.dpsMult *= 1.3; } },
  { name: "Gema del Vacío", desc: "+28% oro", apply: () => { state.modifiers.goldMult *= 1.28; } },
  { name: "Espada de Hielo", desc: "+35% daño", apply: () => { state.modifiers.tapMult *= 1.35; } },
];

const events = [
  { title: "👹 Encuentro Inesperado", desc: "Un ladrón aparece. ¿Qué haces?",
    choices: [
      { text: "Atacar", effect: () => { state.gold *= 0.8; return "Ganas pero pierdes 20% oro"; } },
      { text: "Escapar", effect: () => { return "Escapas ileso"; } },
      { text: "Negociar", effect: () => { state.gold += 50; return "+50 oro"; } },
    ] },
  { title: "✨ Portal Mágico", desc: "¿Cruzas el portal?",
    choices: [
      { text: "Entrar", effect: () => { state.modifiers.tapMult *= 1.2; return "+20% daño"; } },
      { text: "Ignorar", effect: () => { return "Sigues adelante"; } },
      { text: "Investigar", effect: () => { const r = relicPool[Math.floor(Math.random()*relicPool.length)]; state.relics.push(r); r.apply(); return "¡Reliquia!"; } },
    ] },
];

const $ = (id) => document.getElementById(id);
const ui = {
  gold: $("gold"), tapDamage: $("tapDamage"), dps: $("dps"), shards: $("shards"),
  prestige: $("prestige"), relicCount: $("relicCount"), enemyName: $("enemyName"),
  enemyMods: $("enemyMods"), stageLabel: $("stageLabel"), hpText: $("hpText"),
  hpBar: $("hpBar"), attackBtn: $("attackBtn"), damagePreview: $("damagePreview"),
  floatingLog: $("floatingLog"), shopGrid: $("shopGrid"), metaGrid: $("metaGrid"),
  relicDialog: $("relicDialog"), relicChoices: $("relicChoices"), relicSubtitle: $("relicSubtitle"),
  eventDialog: $("eventDialog"), eventTitle: $("eventTitle"), eventDesc: $("eventDesc"),
  eventChoices: $("eventChoices"), resetRunBtn: $("resetRunBtn"), activeRelics: $("activeRelics"),
  prestigeBar: $("prestigeBar"),
};

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try { Object.assign(state, JSON.parse(raw)); } catch (e) {}
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function num(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

function currentTapDamage() {
  const base = state.tapDamageBase + state.meta.tapBonus;
  return Math.max(1, base * state.modifiers.tapMult);
}

function currentDps() {
  const base = state.dpsBase + state.meta.dpsBonus;
  return Math.max(0, base * state.modifiers.dpsMult);
}

function spawnEnemy() {
  const enemyBase = enemies[state.room % enemies.length];
  const baseHp = enemyBase.baseHp * Math.pow(1.2, state.room - 1);
  state.enemyMaxHp = Math.floor(baseHp * state.modifiers.maxHpMult);
  state.enemyHp = state.enemyMaxHp;
}

function rewardForKill() {
  const base = 10 + Math.floor(state.room * 1.3);
  const mult = 1 + state.meta.goldBonus + state.modifiers.goldMult - 1;
  return base * mult;
}

function damageEnemy(amount, from = "Golpe") {
  state.enemyHp -= amount;
  if (state.enemyHp < 0) state.enemyHp = 0;
  render();

  if (state.enemyHp <= 0) {
    state.kills += 1;
    state.totalKills += 1;
    const reward = rewardForKill();
    state.gold += reward;

    if (state.room % 5 === 0) {
      const shardGain = 1 + Math.floor(state.room / 25);
      state.shards += shardGain;
      flash(`${from}: +${num(reward)} oro, +${shardGain} esencias`);
    } else {
      flash(`${from}: +${num(reward)} oro`);
    }

    state.room += 1;
    spawnEnemy();

    if (state.room % 8 === 0 && Math.random() < 0.6) openEventDialog();
    if (state.room % 6 === 0) openRelicDraft();
  }
}

function attackTap() {
  let dmg = currentTapDamage();
  const isCrit = Math.random() < (state.modifiers.critChance + state.meta.critChance);
  if (isCrit) dmg *= state.modifiers.critMult;
  damageEnemy(dmg, isCrit ? "CRIT!" : "Golpe");
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

function drawShop() {
  ui.shopGrid.innerHTML = "";
  runShop.forEach((item) => {
    const cost = upgradeCost(item);
    const canBuy = state.gold >= cost;
    const div = document.createElement("article");
    div.className = "item";
    div.innerHTML = `
      <div><h4>${item.name}</h4><p>${item.desc}</p><span class="color-tag rare">Run</span></div>
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
      <div><h4>${item.name} <span style="opacity: 0.6;">Lv.${lvl}</span></h4><p>${item.desc}</p><span class="color-tag epic">Permanente</span></div>
      <button class="buy-btn" ${canBuy ? "" : "disabled"}>${num(cost)}</button>
    `;
    div.querySelector("button").addEventListener("click", () => buyMetaUpgrade(item.id));
    ui.metaGrid.appendChild(div);
  });
}

function drawActiveRelics() {
  ui.activeRelics.innerHTML = "";
  if (state.relics.length === 0) {
    ui.activeRelics.innerHTML = "<p style='color: var(--muted); font-size: 0.9rem;'>Sin reliquias. Derrota enemigos para conseguir.</p>";
    return;
  }
  state.relics.forEach((relic) => {
    const div = document.createElement("div");
    div.className = "relic-badge";
    div.innerHTML = `<strong>⭐ ${relic.name}</strong><p>${relic.desc}</p>`;
    ui.activeRelics.appendChild(div);
  });
}

function pickRandomRelics(n) {
  const copy = [...relicPool];
  const result = [];
  while (result.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(i, 1)[0]);
  }
  return result;
}

function openRelicDraft() {
  ui.relicChoices.innerHTML = "";
  ui.relicSubtitle.textContent = `Elige 1 de 3 (Ya tienes ${state.relics.length})`;
  
  pickRandomRelics(3).forEach((relic) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "relic-btn";
    btn.innerHTML = `<strong>${relic.name}</strong><p>${relic.desc}</p>`;
    btn.addEventListener("click", () => {
      relic.apply();
      state.relics.push(relic);
      ui.relicDialog.close();
      flash(`✨ ${relic.name}`);
      render();
      save();
    });
    ui.relicChoices.appendChild(btn);
  });

  if (!ui.relicDialog.open) ui.relicDialog.showModal();
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
  state.prestige += Math.floor(state.totalKills / 50);
  state.room = 1;
  state.kills = 0;
  state.tapDamageBase = 1;
  state.dpsBase = 0;
  state.runUpgrades = { blade: 0, familiar: 0, chalice: 0, mirror: 0 };
  state.relics = [];
  state.modifiers = { tapMult: 1, dpsMult: 1, goldMult: 1, critChance: 0, critMult: 1.7, maxHpMult: 1 };
  spawnEnemy();
  render();
  save();
}

function flash(text) {
  ui.floatingLog.textContent = text;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { ui.floatingLog.textContent = ""; }, 1800);
}

function render() {
  const tap = currentTapDamage();
  const dps = currentDps();
  ui.gold.textContent = num(state.gold);
  ui.tapDamage.textContent = num(tap);
  ui.dps.textContent = num(dps);
  ui.shards.textContent = num(state.shards);
  ui.prestige.textContent = num(state.prestige);
  ui.relicCount.textContent = state.relics.length;
  ui.damagePreview.textContent = `+${num(tap)}`;
  ui.stageLabel.textContent = `Sala ${state.room}`;
  ui.hpText.textContent = `${num(state.enemyHp)} / ${num(state.enemyMaxHp)}`;
  const hpPct = (state.enemyHp / state.enemyMaxHp) * 100;
  ui.hpBar.style.width = `${Math.max(0, hpPct)}%`;

  const enemyBase = enemies[state.room % enemies.length];
  ui.enemyName.textContent = `Enemigo: ${enemyBase.name}`;

  const modChance = Math.min(0.3, (state.room - 1) * 0.02);
  if (state.room > 5 && Math.random() < modChance) {
    const mod = enemyMods[Math.floor(Math.random() * enemyMods.length)];
    ui.enemyMods.textContent = `[${mod.name}] ${mod.desc}`;
  } else {
    ui.enemyMods.textContent = "";
  }

  drawShop();
  drawMetaShop();
  drawActiveRelics();
  ui.prestigeBar.textContent = `Prestige: ${state.prestige} (${state.totalKills} kills)`;
}

function tick(dt) {
  const dps = currentDps();
  if (dps > 0) damageEnemy(dps * dt, "DPS");
}

function setupEvents() {
  ui.attackBtn.addEventListener("click", attackTap);
  ui.attackBtn.addEventListener("touchstart", (e) => { e.preventDefault(); }, { passive: false });

  ui.resetRunBtn.addEventListener("click", () => {
    if (confirm("Reiniciar run. Mantienes esencias y mejoras.")) {
      resetRun();
      flash("Nueva run");
    }
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      const tabName = btn.dataset.tab;
      document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
      btn.classList.add("active");
    });
  });
}

function start() {
  loadSave();
  if (!state.enemyHp || state.enemyHp <= 0) spawnEnemy();
  setupEvents();
  render();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  let last = performance.now();
  setInterval(() => save(), 3000);

  function loop(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    tick(dt);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

start();
