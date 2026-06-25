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
  return `/api/camera_proxy/${camera.entity_id}?token=${camera.attributes.access_token || ""}`;
}

export function getErrorCount(entity) {
  if (!entity) return null;

  const stateCount = Number.parseInt(entity.state, 10);
  if (!Number.isNaN(stateCount)) {
    return stateCount;
  }

  const attributeCount = Number.parseInt(entity.attributes?.alerts_count, 10);
  if (!Number.isNaN(attributeCount)) {
    return attributeCount;
  }

  return 0;
}
