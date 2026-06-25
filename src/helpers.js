export const DEFAULT_CONFIG = {
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

export function formatValue(entity, fallbackUnit = "") {
  if (!entity) return null;
  const unit = entity.attributes.unit_of_measurement || fallbackUnit;
  return `${entity.state}${unit ? " " + unit : ""}`;
}

export function batteryHeaderColor(percent) {
  if (percent > 70) return "rgba(0,180,0,0.35)";
  if (percent > 30) return "rgba(255,165,0,0.35)";
  return "rgba(200,0,0,0.35)";
}

export function batteryFillColor(percent) {
  if (percent > 50) return "rgba(0,180,0,0.20)";
  if (percent > 25) return "rgba(255,165,0,0.20)";
  return "rgba(255,0,0,0.20)";
}

export function cameraProxyUrl(camera) {
  if (!camera) return "";

  const token = camera.attributes?.access_token;

  return token
    ? `/api/camera_proxy/${camera.entity_id}?token=${token}`
    : `/api/camera_proxy/${camera.entity_id}`;
}

export function getErrorCount(entity) {
  if (!entity) return 0;

  const state = Number(entity.state);
  if (Number.isFinite(state)) {
    return state;
  }

  const alertsCount = Number(entity.attributes?.alerts_count);
  if (Number.isFinite(alertsCount)) {
    return alertsCount;
  }

  const errorCount = Number(entity.attributes?.error_count);
  if (Number.isFinite(errorCount)) {
    return errorCount;
  }

  return 0;
}
