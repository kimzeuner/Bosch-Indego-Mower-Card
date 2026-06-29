import { LitElement, html, css } from "lit";
import { DEFAULT_CONFIG, autoDetectIndegoEntities } from "./helpers.js";
import { getTranslations, t } from "./translations.js";

const ACTION_OPTIONS = [
  ["more-info", "More info"],
  ["navigate", "Navigate"],
  ["url", "URL"],
  ["call-service", "Call service"],
  ["assist", "Assist"],
  ["none", "None"],
];

const ACTION_FIELDS = {
  map_entity: "map",
  battery_entity: "battery",
  state_detail_entity: "status",
  mowed_entity: "mowed",
  stuck_entity: "stuck",
  alert_entity: "alerts",
};

export class IndegoMowerCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _openSections: { state: true },
  };

  static styles = css`
    .editor {
      padding: 16px;
    }

    .field {
      margin-bottom: 16px;
    }

    .field-header,
    .actions-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .field-header {
      margin-bottom: 6px;
    }

    .label {
      font-size: 14px;
      font-weight: 500;
    }

    .section-title {
      margin-top: 24px;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 500;
    }

    .switch-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .switch-label,
    .sub-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .sub-label {
      margin-bottom: 4px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .actions-toggle {
      width: 100%;
      margin-top: 10px;
      padding: 8px 0;
      border: 0;
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font: inherit;
    }

    .actions-toggle-label {
      font-size: 14px;
      font-weight: 500;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 4px;
    }

    .extra-fields {
      margin-top: 8px;
      display: grid;
      gap: 8px;
    }

    ha-form,
    ha-entity-picker {
      display: block;
      width: 100%;
    }

    textarea {
      width: 100%;
      min-height: 76px;
      box-sizing: border-box;
      padding: 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
      resize: vertical;
    }

    @media (max-width: 600px) {
      .grid-2,
      .action-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  constructor() {
    super();
    this._openSections = {};
  }

  setConfig(config) {
    this._config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  render() {
    if (!this.hass || !this._config) return html``;

    const translations = getTranslations(this.hass);

    const fields = [
      ["entity", t(translations, "editor.mower")],
      ["map_entity", t(translations, "editor.map"), "show_map"],
      ["battery_entity", t(translations, "editor.battery"), "show_battery_header"],
      ["charging_entity", t(translations, "editor.charging")],
      ["state_detail_entity", t(translations, "editor.state_detail"), "show_status"],
      ["mowed_entity", t(translations, "editor.mowed")],
      ["mowed_size_entity", t(translations, "editor.mowed_size")],
      ["stuck_entity", t(translations, "editor.stuck")],
      ["alert_entity", t(translations, "editor.errors")],
    ];

    const colorFields = [
      ["theme_primary_color", t(translations, "editor.theme_primary_color")],
      ["theme_border_color", t(translations, "editor.theme_border_color")],
      ["theme_warning_color", t(translations, "editor.theme_warning_color")],
      ["theme_error_color", t(translations, "editor.theme_error_color")],
      ["theme_button_background", t(translations, "editor.theme_button_background")],
    ];

    const actionLayoutOptions = [
      ["icon", t(translations, "editor.action_layout_icon")],
      ["text", t(translations, "editor.action_layout_text")],
      ["icon_text", t(translations, "editor.action_layout_icon_text")],
      ["text_icon", t(translations, "editor.action_layout_text_icon")],
    ];

    return html`
      <div class="editor">
        ${fields.map(([key, label, toggleKey]) =>
          this.renderEntityField(translations, key, label, toggleKey)
        )}

        <div class="section-title">${t(translations, "editor.colors")}</div>

        <div class="grid-2">
          ${colorFields.map(([key, label]) =>
            this.renderTextForm(this._config[key] || "", label, (value) =>
              this.updateSimpleConfigValue(key, value)
            )
          )}
        </div>

        <div class="section-title">${t(translations, "editor.action_layout")}</div>

        ${this.renderSelect(
          this._config.action_layout || "icon",
          actionLayoutOptions,
          (value) => this.updateConfig({ action_layout: value || "icon" })
        )}
      </div>
    `;
  }

  renderEntityField(translations, key, label, toggleKey) {
    return html`
      <div class="field">
        <div class="field-header">
          <div class="label">${label}</div>

          ${toggleKey
            ? html`
                <div class="switch-row">
                  <span class="switch-label">
                    ${t(translations, `editor.${toggleKey}`)}
                  </span>
                  <ha-switch
                    .checked=${this._config[toggleKey] !== false}
                    @change=${(event) =>
                      this.updateConfig({ [toggleKey]: event.target.checked })}
                  ></ha-switch>
                </div>
              `
            : html``}
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${this._config[key] || ""}
          .includeDomains=${key === "entity" ? ["lawn_mower"] : undefined}
          allow-custom-entity
          @value-changed=${(event) => this.handleEntityChanged(key, event)}
        ></ha-entity-picker>

        ${ACTION_FIELDS[key] ? this.renderActionSection(ACTION_FIELDS[key]) : html``}
      </div>
    `;
  }

  renderActionSection(prefix) {
    const isOpen = this._openSections[prefix] === true;

    return html`
      <button
        type="button"
        class="actions-toggle"
        @click=${() => this.toggleSection(prefix)}
      >
        <span class="actions-toggle-label">Aktionen</span>
        <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-right"}></ha-icon>
      </button>

      ${isOpen
        ? html`
            <div class="action-grid">
              ${this.renderActionSelect(prefix, "tap", "Tap action")}
              ${this.renderActionSelect(prefix, "double_tap", "Double tap")}
              ${this.renderActionSelect(prefix, "hold", "Hold action")}
            </div>
          `
        : html``}
    `;
  }

  renderActionSelect(prefix, actionType, label) {
    const configKey = `${prefix}_${actionType}_action`;
    const actionConfig = this._config[configKey] || {};
    const value = actionConfig.action || (actionType === "tap" ? "more-info" : "none");

    return html`
      <div>
        <div class="sub-label">${label}</div>

        ${this.renderSelect(value, ACTION_OPTIONS, (selectedValue) =>
          this.updateConfig({
            [configKey]: { action: selectedValue },
          })
        )}

        ${this.renderActionExtraFields(configKey, actionConfig, value)}
      </div>
    `;
  }

  renderActionExtraFields(configKey, actionConfig, action) {
    if (action === "navigate") {
      return html`
        <div class="extra-fields">
          ${this.renderTextForm(
            actionConfig.navigation_path || "",
            "Navigation path",
            (value) => this.updateActionConfigValue(configKey, "navigation_path", value)
          )}
        </div>
      `;
    }

    if (action === "url") {
      return html`
        <div class="extra-fields">
          ${this.renderTextForm(actionConfig.url_path || "", "URL path", (value) =>
            this.updateActionConfigValue(configKey, "url_path", value)
          )}
        </div>
      `;
    }

    if (action === "call-service") {
      return html`
        <div class="extra-fields">
          ${this.renderTextForm(actionConfig.service || "", "Service", (value) =>
            this.updateActionConfigValue(configKey, "service", value)
          )}

          <div>
            <div class="sub-label">Service data JSON</div>
            <textarea
              .value=${this.stringifyServiceData(actionConfig.service_data)}
              placeholder='{"entity_id":"switch.example"}'
              @change=${(event) =>
                this.updateServiceData(configKey, event.target.value)}
            ></textarea>
          </div>
        </div>
      `;
    }

    return html``;
  }

  renderTextForm(value, label, onChange) {
    const schema = [
      {
        name: "value",
        selector: {
          text: {},
        },
      },
    ];

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ value }}
        .schema=${schema}
        .computeLabel=${() => label}
        @value-changed=${(event) => {
          const nextValue = event.detail.value?.value ?? "";
          onChange(nextValue);
        }}
      ></ha-form>
    `;
  }

  renderSelect(value, options, onChange) {
    const schema = [
      {
        name: "value",
        selector: {
          select: {
            mode: "dropdown",
            options: options.map(([optionValue, label]) => ({
              value: optionValue,
              label,
            })),
          },
        },
      },
    ];

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${{ value }}
        .schema=${schema}
        .computeLabel=${() => ""}
        @value-changed=${(event) => {
          const selectedValue = event.detail.value?.value;

          if (selectedValue !== undefined && selectedValue !== value) {
            onChange(selectedValue);
          }
        }}
      ></ha-form>
    `;
  }

  handleEntityChanged(key, event) {
    const value = event.detail.value;
    const config = { ...this._config };

    if (value) {
      config[key] = value;

      if (key === "entity") {
        const detected = autoDetectIndegoEntities(this.hass, value);

        Object.entries(detected).forEach(([detectedKey, detectedValue]) => {
          if (!config[detectedKey]) {
            config[detectedKey] = detectedValue;
          }
        });
      }
    } else {
      delete config[key];
    }

    this.setAndDispatchConfig(config);
  }

  toggleSection(prefix) {
    this._openSections = {
      ...this._openSections,
      [prefix]: this._openSections[prefix] !== true,
    };
  }

  updateSimpleConfigValue(key, value) {
    const config = { ...this._config };
    const cleanValue = value?.trim();

    if (cleanValue) {
      config[key] = cleanValue;
    } else {
      delete config[key];
    }

    this.setAndDispatchConfig(config);
  }

  updateActionConfigValue(configKey, field, value) {
    const config = { ...this._config };
    const actionConfig = { ...(config[configKey] || {}) };
    const cleanValue = value?.trim();

    if (cleanValue) {
      actionConfig[field] = cleanValue;
    } else {
      delete actionConfig[field];
    }

    config[configKey] = actionConfig;
    this.setAndDispatchConfig(config);
  }

  updateServiceData(configKey, value) {
    const cleanValue = value?.trim();

    if (!cleanValue) {
      this.updateActionConfigValue(configKey, "service_data", "");
      return;
    }

    try {
      const parsed = JSON.parse(cleanValue);
      const config = { ...this._config };
      const actionConfig = { ...(config[configKey] || {}) };

      actionConfig.service_data = parsed;
      config[configKey] = actionConfig;

      this.setAndDispatchConfig(config);
    } catch {
      // Invalid JSON is not saved.
    }
  }

  stringifyServiceData(serviceData) {
    if (!serviceData) return "";

    try {
      return JSON.stringify(serviceData, null, 2);
    } catch {
      return "";
    }
  }

  updateConfig(changes) {
    this.setAndDispatchConfig({
      ...this._config,
      ...changes,
    });
  }

  setAndDispatchConfig(config) {
    this._config = config;

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get("indego-mower-card-editor")) {
  customElements.define("indego-mower-card-editor", IndegoMowerCardEditor);
}
