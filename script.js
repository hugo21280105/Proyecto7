const SAVE_KEY = "arcanaTapSave_v1";

const state = {
  gold: 0,
  shards: 0,
  room: 1,
  kills: 0,
  tapDamageBase: 1,
  dpsBase: 0,
  enemyMaxHp: 22,
  enemyHp: 22,
  relicPicks: 0,
  meta: {
    tapBonus: 0,
    dpsBonus: 0,
  },
  relicEffects: {
    tapMult: 1,
    dpsMult: 1,
    goldMult: 1,
    critChance: 0,
    critMult: 1.7,
  },
  runUpgrades: {
    sword: 0,
    drone: 0,
    greed: 0,
  },
};

const enemyNames = [
  "Slime del Sotano",
  "Mosca Ciega",
  "Payaso Roto",
  "Cabra de Carton",
  "Mago de Ceniza",
  "Angel de Plomo",
];

const runShop = [
  {
    id: "sword",
    name: "Cuchilla Astillada",
    desc: "+1 daño por toque",
    baseCost: 12,
    growth: 1.52,
    buy: () => {
      state.runUpgrades.sword += 1;
      state.tapDamageBase += 1;
    },
  },
  {
    id: "drone",
    name: "Familiar Laton",
    desc: "+1 DPS",
    baseCost: 20,
    growth: 1.58,
    buy: () => {
      state.runUpgrades.drone += 1;
      state.dpsBase += 1;
    },
  },
  {
    id: "greed",
    name: "Dado Dorado",
    desc: "+8% oro ganado",
    baseCost: 28,
    growth: 1.65,
    buy: () => {
      state.runUpgrades.greed += 1;
      state.relicEffects.goldMult += 0.08;
    },
  },
];

const metaShop = [
  {
    id: "tapBonus",
    name: "Guante de Hierro",
    desc: "+1 daño base permanente",
    cost: (lvl) => Math.floor(8 * Math.pow(1.8, lvl)),
    buy: () => {
      state.meta.tapBonus += 1;
    },
  },
  {
    id: "dpsBonus",
    name: "Totem de Bronce",
    desc: "+1 DPS base permanente",
    cost: (lvl) => Math.floor(10 * Math.pow(1.9, lvl)),
    buy: () => {
      state.meta.dpsBonus += 1;
    },
  },
];

const relicPool = [
  {
    name: "Joker Roto",
    desc: "+45% dano por toque",
    apply: () => {
      state.relicEffects.tapMult += 0.45;
    },
  },
  {
    name: "Sangre Fria",
    desc: "+55% DPS",
    apply: () => {
      state.relicEffects.dpsMult += 0.55;
    },
  },
  {
    name: "Moneda Marcada",
    desc: "+40% oro ganado",
    apply: () => {
      state.relicEffects.goldMult += 0.4;
    },
  },
  {
    name: "Lagrima Prismatica",
    desc: "+10% critico",
    apply: () => {
      state.relicEffects.critChance += 0.1;
    },
  },
  {
    name: "Furia del Pobre",
    desc: "Si oro < 50: +90% dano por toque",
    apply: () => {
      state.relicEffects.tapMult += 0.2;
      state.relicEffects.critMult += 0.2;
    },
  },
];

const $ = (id) => document.getElementById(id);
const ui = {
  gold: $("gold"),
  tapDamage: $("tapDamage"),
  dps: $("dps"),
  shards: $("shards"),
  enemyName: $("enemyName"),
  stageLabel: $("stageLabel"),
  hpText: $("hpText"),
  hpBar: $("hpBar"),
  attackBtn: $("attackBtn"),
  floatingLog: $("floatingLog"),
  shopGrid: $("shopGrid"),
  metaGrid: $("metaGrid"),
  relicDialog: $("relicDialog"),
  relicChoices: $("relicChoices"),
  resetRunBtn: $("resetRunBtn"),
};

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (typeof data.gold === "number") Object.assign(state, data);
  } catch {
    // Ignore broken saves.
  }
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
  return Math.max(1, base * state.relicEffects.tapMult);
}

function currentDps() {
  const base = state.dpsBase + state.meta.dpsBonus;
  return Math.max(0, base * state.relicEffects.dpsMult);
}

function enemyNameForRoom(room) {
  return enemyNames[room % enemyNames.length];
}

function spawnEnemy() {
  const scale = 1 + (state.room - 1) * 0.19;
  state.enemyMaxHp = Math.floor(22 * Math.pow(scale, 1.18));
  state.enemyHp = state.enemyMaxHp;
  ui.enemyName.textContent = `Enemigo: ${enemyNameForRoom(state.room)}`;
}

function rewardForKill() {
  const base = 8 + Math.floor(state.room * 1.2);
  return base * state.relicEffects.goldMult;
}

function damageEnemy(amount, from) {
  state.enemyHp -= amount;
  if (state.enemyHp < 0) state.enemyHp = 0;
  render();

  if (state.enemyHp <= 0) {
    state.kills += 1;
    const reward = rewardForKill();
    state.gold += reward;
    if (state.room % 5 === 0) {
      const shardGain = 1 + Math.floor(state.room / 20);
      state.shards += shardGain;
      flash(`${from}: +${num(reward)} oro, +${shardGain} fragmento`);
    } else {
      flash(`${from}: +${num(reward)} oro`);
    }

    state.room += 1;
    spawnEnemy();

    if (state.room % 7 === 0) {
      openRelicDraft();
    }
  }
}

function attackTap() {
  let dmg = currentTapDamage();
  const isCrit = Math.random() < state.relicEffects.critChance;
  if (isCrit) dmg *= state.relicEffects.critMult;
  damageEnemy(dmg, isCrit ? "CRIT" : "Golpe");
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
      <div>
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
      </div>
      <button class="buy-btn" ${canBuy ? "" : "disabled"}>${num(cost)} oro</button>
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
        <h4>${item.name} (Nv. ${lvl})</h4>
        <p>${item.desc}</p>
      </div>
      <button class="buy-btn" ${canBuy ? "" : "disabled"}>${num(cost)} frag</button>
    `;
    div.querySelector("button").addEventListener("click", () => buyMetaUpgrade(item.id));
    ui.metaGrid.appendChild(div);
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
  state.relicPicks += 1;
  ui.relicChoices.innerHTML = "";
  pickRandomRelics(3).forEach((relic) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "relic-btn";
    btn.textContent = `${relic.name} - ${relic.desc}`;
    btn.addEventListener("click", () => {
      relic.apply();
      ui.relicDialog.close();
      flash(`Reliquia: ${relic.name}`);
      render();
      save();
    });
    ui.relicChoices.appendChild(btn);
  });

  if (!ui.relicDialog.open) {
    ui.relicDialog.showModal();
  }
}

function resetRun() {
  state.room = 1;
  state.kills = 0;
  state.tapDamageBase = 1;
  state.dpsBase = 0;
  state.runUpgrades = { sword: 0, drone: 0, greed: 0 };
  state.relicEffects = {
    tapMult: 1,
    dpsMult: 1,
    goldMult: 1,
    critChance: 0,
    critMult: 1.7,
  };
  spawnEnemy();
  render();
  save();
}

function flash(text) {
  ui.floatingLog.textContent = text;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => {
    ui.floatingLog.textContent = "";
  }, 1600);
}

function render() {
  const tap = currentTapDamage();
  const dps = currentDps();
  ui.gold.textContent = num(state.gold);
  ui.tapDamage.textContent = num(tap);
  ui.dps.textContent = num(dps);
  ui.shards.textContent = num(state.shards);
  ui.stageLabel.textContent = `Sala ${state.room}`;
  ui.hpText.textContent = `${num(state.enemyHp)} / ${num(state.enemyMaxHp)}`;
  const hpPct = (state.enemyHp / state.enemyMaxHp) * 100;
  ui.hpBar.style.width = `${Math.max(0, hpPct)}%`;
  drawShop();
  drawMetaShop();
}

function tick(dt) {
  const dps = currentDps();
  if (dps > 0) {
    damageEnemy(dps * dt, "DPS");
  }
}

function setupEvents() {
  ui.attackBtn.addEventListener("click", attackTap);
  ui.attackBtn.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
  ui.resetRunBtn.addEventListener("click", () => {
    if (confirm("Esto reinicia la run actual. Mantienes fragmentos y mejoras permanentes.")) {
      resetRun();
      flash("Nueva run iniciada");
    }
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
