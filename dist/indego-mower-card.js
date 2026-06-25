const _ = {
  entity: "",
  map_entity: "",
  battery_entity: "",
  charging_entity: "",
  state_detail_entity: "",
  mowed_entity: "",
  mowed_size_entity: "",
  stuck_entity: "",
  alert_entity: ""
};
function y(n, t = "") {
  if (!n) return null;
  const e = n.attributes.unit_of_measurement || t;
  return `${n.state}${e ? " " + e : ""}`;
}
function v(n) {
  return n > 70 ? "rgba(0,180,0,0.35)" : n > 30 ? "rgba(255,165,0,0.35)" : "rgba(200,0,0,0.35)";
}
function x(n) {
  return n > 50 ? "rgba(0,180,0,0.20)" : n > 25 ? "rgba(255,165,0,0.20)" : "rgba(255,0,0,0.20)";
}
function k(n) {
  var e;
  if (!n) return "";
  const t = (e = n.attributes) == null ? void 0 : e.access_token;
  return t ? `/api/camera_proxy/${n.entity_id}?token=${t}` : `/api/camera_proxy/${n.entity_id}`;
}
function C(n) {
  var s, d;
  if (!n) return 0;
  const t = Number(n.state);
  if (Number.isFinite(t))
    return t;
  const e = Number((s = n.attributes) == null ? void 0 : s.alerts_count);
  if (Number.isFinite(e))
    return e;
  const i = Number((d = n.attributes) == null ? void 0 : d.error_count);
  return Number.isFinite(i) ? i : 0;
}
const E = "Battery", S = "Mowed", M = "Errors", A = "Stuck", L = "Charge", N = "Yes", F = "No", z = "No map available", B = "Please select a mower entity in the card configuration.", T = {
  mower: "Mower",
  map: "Map",
  battery: "Battery",
  charging: "Charging",
  state_detail: "Status detail",
  mowed: "Mowed",
  mowed_size: "Mowed area",
  stuck: "Stuck",
  alert: "Alert",
  errors: "Errors"
}, H = {
  battery: E,
  mowed: S,
  errors: M,
  stuck: A,
  charge: L,
  yes: N,
  no: F,
  no_map: z,
  select_entity: B,
  editor: T
}, I = "Batterie", q = "Gemäht", G = "Fehler", K = "Fest", U = "Ladung", V = "Ja", D = "Nein", O = "Keine Karte verfügbar", R = "Bitte wähle im Karteneditor eine Mäher-Entität aus.", Y = {
  mower: "Mäher",
  map: "Karte",
  battery: "Batterie",
  charging: "Lädt",
  state_detail: "Status Detail",
  mowed: "Gemäht",
  mowed_size: "Gemähte Fläche",
  stuck: "Festgefahren",
  alert: "Alarm",
  errors: "Fehler"
}, J = {
  battery: I,
  mowed: q,
  errors: G,
  stuck: K,
  charge: U,
  yes: V,
  no: D,
  no_map: O,
  select_entity: R,
  editor: Y
}, f = { en: H, de: J };
function $(n) {
  const t = (n == null ? void 0 : n.language) || "en", e = t.split("-")[0];
  return f[t] || f[e] || f.en;
}
function r(n, t) {
  return t.split(".").reduce((e, i) => e == null ? void 0 : e[i], n) || t;
}
class P extends HTMLElement {
  set hass(t) {
    this._hass = t, this.querySelectorAll("ha-entity-picker").forEach((e) => {
      e.hass = t;
    }), this._rendered || this.render();
  }
  setConfig(t) {
    this._config = {
      ..._,
      ...t
    }, this._rendered || this.render();
  }
  render() {
    if (!this._config || this._rendering) return;
    this._rendering = !0;
    const t = $(this._hass), e = [
      ["entity", r(t, "editor.mower")],
      ["map_entity", r(t, "editor.map")],
      ["battery_entity", r(t, "editor.battery")],
      ["charging_entity", r(t, "editor.charging")],
      ["state_detail_entity", r(t, "editor.state_detail")],
      ["mowed_entity", r(t, "editor.mowed")],
      ["mowed_size_entity", r(t, "editor.mowed_size")],
      ["stuck_entity", r(t, "editor.stuck")],
      ["alert_entity", r(t, "editor.errors")]
    ];
    this.innerHTML = `
      <div style="padding:16px;">
        ${e.map(([i, s]) => `
          <ha-entity-picker
            label="${s}"
            value="${this._config[i] || ""}"
            config-value="${i}"
            allow-custom-entity
            style="display:block; margin-bottom:12px;"
          ></ha-entity-picker>
        `).join("")}
      </div>
    `, this.querySelectorAll("ha-entity-picker").forEach((i) => {
      i.hass = this._hass, i.addEventListener("value-changed", (s) => {
        const d = i.getAttribute("config-value"), a = s.detail.value, o = { ...this._config };
        a ? o[d] = a : delete o[d], this._config = o, this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: o },
            bubbles: !0,
            composed: !0
          })
        );
      });
    }), this._rendered = !0, this._rendering = !1;
  }
}
customElements.define("indego-mower-card-editor", P);
const j = `
  .header {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .battery {
    border: 1px solid rgba(0,150,136,0.2);
    border-radius: 8px;
    padding: 8px;
    font-weight: bold;
  }

  .image {
    width: 100%;
    display: block;
  }

  .status {
    text-align: center;
    padding: 10px;
    font-size: 16px;
    font-weight: bold;
  }

  .stats {
    display: grid;
    gap: 4px;
    padding: 8px;
  }

  .stat {
    border: 1px solid rgba(0,150,136,0.2);
    border-radius: 8px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    min-height: 70px;
  }

  .label {
    font-size: 12px;
    opacity: 0.7;
    text-align: center;
    flex: 0 0 auto;
  }

  .value {
    font-weight: bold;
    line-height: 1.3;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .warning {
    color: darkred;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 12px;
  }

  button {
    border: none;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    background: var(--card-background-color);
  }

  button ha-icon {
    --mdc-icon-size: 28px;
  }
`;
class Q extends HTMLElement {
  static getConfigElement() {
    return document.createElement("indego-mower-card-editor");
  }
  static getStubConfig() {
    return { ..._ };
  }
  setConfig(t) {
    this.config = {
      ..._,
      ...t
    };
  }
  getCardSize() {
    return 6;
  }
  set hass(t) {
    this._hass = t, this.render();
  }
  render() {
    const t = this._hass;
    if (!t || !this.config) return;
    const e = $(t);
    if (!this.content) {
      const p = document.createElement("ha-card");
      p.style.padding = "0", this.content = document.createElement("div"), p.appendChild(this.content), this.appendChild(p);
    }
    if (!this.config.entity) {
      this.content.innerHTML = `
        <div style="padding:16px;">
          ${r(e, "select_entity")}
        </div>
      `;
      return;
    }
    const i = t.states[this.config.entity], s = i == null ? void 0 : i.state, d = t.states[this.config.map_entity], a = t.states[this.config.battery_entity], o = t.states[this.config.charging_entity], u = t.states[this.config.state_detail_entity], l = t.states[this.config.mowed_entity], c = t.states[this.config.mowed_size_entity], h = t.states[this.config.stuck_entity], w = t.states[this.config.alert_entity], g = parseInt((a == null ? void 0 : a.state) || 0, 10), b = k(d), m = this.buildStats({
      translations: e,
      mowerState: s,
      battery: a,
      batteryPct: g,
      mowed: l,
      mowedSize: c,
      stuck: h,
      alerts: w
    });
    this.content.innerHTML = `
      <style>${j}</style>

      ${s !== "docked" && a ? `
        <div class="header">
          <div class="battery" style="
            background: linear-gradient(
              90deg,
              ${v(g)} 0%,
              ${v(g)} ${g}%,
              transparent ${g}%,
              transparent 100%
            );
          ">
            ${r(e, "battery")}: ${g}%
            ${(o == null ? void 0 : o.state) === "on" ? "⚡" : ""}
          </div>
        </div>
      ` : ""}

      ${b ? `<img class="image" src="${b}" alt="Mower map" />` : `<div class="status">${r(e, "no_map")}</div>`}

      <div class="status">
        ${(u == null ? void 0 : u.state) || (i == null ? void 0 : i.state) || "-"}
      </div>

      ${m.length ? `
        <div class="stats" style="grid-template-columns: repeat(${m.length}, 1fr);">
          ${m.join("")}
        </div>
      ` : ""}

      <div class="actions">
        ${this.renderActionButton("start", "mdi:play", s === "mowing")}
        ${this.renderActionButton("pause", "mdi:pause", s === "paused" || s === "docked")}
        ${this.renderActionButton("dock", "mdi:home-import-outline", s === "docked")}
      </div>
    `, this.addActionHandlers(t);
  }
  buildStats({
    translations: t,
    mowerState: e,
    battery: i,
    batteryPct: s,
    mowed: d,
    mowedSize: a,
    stuck: o,
    alerts: u
  }) {
    const l = [];
    if (d || a) {
      const c = d ? y(d, "%") : null, h = a ? y(a, "m²") : null;
      l.push(`
        <div class="stat">
          <div class="label">${r(t, "mowed")}</div>
          <div class="value">
            ${c || ""}
            ${c && h ? "<br>" : ""}
            ${h || ""}
          </div>
        </div>
      `);
    }
    if (u) {
      const c = C(u);
      l.push(`
        <div class="stat">
          <div class="label">${r(t, "errors")}</div>
          <div class="value ${c > 0 ? "warning" : ""}">
            ${c}
          </div>
        </div>
      `);
    }
    if (o && e !== "docked" && l.push(`
        <div class="stat">
          <div class="label">${r(t, "stuck")}</div>
          <div class="value ${o.state === "on" ? "warning" : ""}">
            ${o.state === "on" ? r(t, "yes") : r(t, "no")}
          </div>
        </div>
      `), i && e === "docked") {
      const c = x(s);
      l.push(`
        <div class="stat battery-stat" style="
          background: linear-gradient(
            to top,
            ${c} 0%,
            ${c} ${s}%,
            transparent ${s}%,
            transparent 100%
          );
        ">
          <div class="label">${r(t, "charge")}</div>
          <div class="value">${y(i, "%")}</div>
        </div>
      `);
    }
    return l;
  }
  renderActionButton(t, e, i) {
    return `
      <button id="${t}" type="button">
        <ha-icon
          icon="${e}"
          style="color:${i ? "var(--disabled-text-color)" : "var(--primary-color)"}">
        </ha-icon>
      </button>
    `;
  }
  addActionHandlers(t) {
    var e, i, s;
    (e = this.content.querySelector("#start")) == null || e.addEventListener("click", () => {
      t.callService("lawn_mower", "start_mowing", {
        entity_id: this.config.entity
      });
    }), (i = this.content.querySelector("#pause")) == null || i.addEventListener("click", () => {
      t.callService("lawn_mower", "pause", {
        entity_id: this.config.entity
      });
    }), (s = this.content.querySelector("#dock")) == null || s.addEventListener("click", () => {
      t.callService("lawn_mower", "dock", {
        entity_id: this.config.entity
      });
    });
  }
}
customElements.define("indego-mower-card", Q);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "indego-mower-card",
  name: "Indego Mower Card",
  description: "Bosch Indego robotic mower card"
});
