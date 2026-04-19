import { useEffect, useRef, useState } from "react";
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
  searchResources,
} from "../utils/api";

const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE", "INACTIVE"];

const pageStyles = {
  minHeight: "100vh",
  padding: "32px 20px 64px",
  color: "#f8fafc",
  background:
    "radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 28%), radial-gradient(circle at top right, rgba(245, 158, 11, 0.16), transparent 24%), linear-gradient(180deg, #06131f 0%, #0d1b2a 50%, #132238 100%)",
};

const containerStyles = {
  maxWidth: "1440px",
  margin: "0 auto",
  display: "grid",
  gap: "20px",
};

const cardStyles = {
  background: "rgba(15, 23, 42, 0.82)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  borderRadius: "24px",
  boxShadow: "0 24px 60px rgba(2, 8, 23, 0.28)",
  backdropFilter: "blur(16px)",
};

const fieldStyles = {
  width: "100%",
  background: "rgba(10, 18, 32, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  color: "#e2e8f0",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButtonStyles = {
  background: "linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)",
  color: "#04111d",
  border: "none",
  borderRadius: "999px",
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyles = {
  background: "rgba(15, 23, 42, 0.9)",
  color: "#dbeafe",
  border: "1px solid rgba(96, 165, 250, 0.24)",
  borderRadius: "999px",
  padding: "12px 18px",
  fontWeight: 600,
  cursor: "pointer",
};

const dangerButtonStyles = {
  background: "rgba(127, 29, 29, 0.18)",
  color: "#fecaca",
  border: "1px solid rgba(248, 113, 113, 0.25)",
  borderRadius: "999px",
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      <span
        style={{
          color: "#7dd3fc",
          fontSize: "12px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {eyebrow}
      </span>
      <h2 style={{ margin: 0, fontSize: "24px", color: "#f8fafc" }}>{title}</h2>
      <p style={{ margin: 0, color: "#94a3b8", lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span style={{ fontSize: "13px", color: "#cbd5e1", fontWeight: 600 }}>{label}</span>
      {children}
      {error && (
        <span style={{ color: "#fda4af", fontSize: "13px", lineHeight: 1.4 }}>{error}</span>
      )}
    </label>
  );
}

function StatusBadge({ status }) {
  const badgeMap = {
    ACTIVE: {
      background:
        "linear-gradient(135deg, rgba(22, 163, 74, 0.34) 0%, rgba(13, 148, 136, 0.3) 100%)",
      color: "#f0fdf4",
      border: "1px solid rgba(74, 222, 128, 0.32)",
      boxShadow: "0 6px 14px rgba(16, 185, 129, 0.14)",
    },
    OUT_OF_SERVICE: {
      background: "rgba(153, 27, 27, 0.28)",
      color: "#fecaca",
      border: "1px solid rgba(248, 113, 113, 0.28)",
      boxShadow: "0 6px 14px rgba(239, 68, 68, 0.1)",
    },
    INACTIVE: {
      background: "rgba(51, 65, 85, 0.72)",
      color: "#e2e8f0",
      border: "1px solid rgba(148, 163, 184, 0.22)",
      boxShadow: "0 6px 14px rgba(15, 23, 42, 0.14)",
    },
  };

  const badgeStyle = badgeMap[status] || badgeMap.INACTIVE;

  return (
    <span
      style={{
        ...badgeStyle,
        borderRadius: "999px",
        padding: status === "ACTIVE" ? "8px 13px 8px 11px" : "7px 11px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.05em",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {status === "ACTIVE" && (
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "999px",
            background: "#f0fdf4",
            boxShadow: "0 0 0 4px rgba(240, 253, 244, 0.12)",
          }}
        />
      )}
      {status.replaceAll("_", " ")}
    </span>
  );
}

function IconActionButton({ label, onClick, tone = "neutral", icon }) {
  const toneStyles = {
    neutral: {
      background: "rgba(15, 23, 42, 0.56)",
      color: "#cbd5e1",
      border: "1px solid rgba(148, 163, 184, 0.14)",
    },
    danger: {
      background: "rgba(127, 29, 29, 0.14)",
      color: "#fca5a5",
      border: "1px solid rgba(248, 113, 113, 0.16)",
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        ...(toneStyles[tone] || toneStyles.neutral),
        width: "34px",
        height: "34px",
        borderRadius: "12px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 180ms ease",
      }}
    >
      {icon}
    </button>
  );
}

function HealthMetricCard({ icon, label, value, description, tone = "neutral" }) {
  const toneMap = {
    success: {
      border: "1px solid rgba(74, 222, 128, 0.18)",
      background: "rgba(6, 24, 21, 0.78)",
      valueColor: "#dcfce7",
    },
    warning: {
      border: "1px solid rgba(250, 204, 21, 0.18)",
      background: "rgba(38, 24, 8, 0.72)",
      valueColor: "#fef3c7",
    },
    danger: {
      border: "1px solid rgba(248, 113, 113, 0.18)",
      background: "rgba(42, 14, 18, 0.74)",
      valueColor: "#fecaca",
    },
    neutral: {
      border: "1px solid rgba(148, 163, 184, 0.14)",
      background: "rgba(12, 18, 31, 0.82)",
      valueColor: "#f8fafc",
    },
  };

  const styles = toneMap[tone] || toneMap.neutral;

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "18px",
        border: styles.border,
        background: styles.background,
        display: "grid",
        gap: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#94a3b8",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: "14px", opacity: 0.9 }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: styles.valueColor }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>{description}</div>
    </div>
  );
}

function ResourceCard({
  resource,
  today,
  onEdit,
  onDelete,
  onExtendAvailability,
}) {
  const isExpired = resource.availableToDate && resource.availableToDate < today;

  return (
    <article
      style={{
        background: "rgba(9, 14, 26, 0.94)",
        border: isExpired
          ? "1px solid rgba(248, 113, 113, 0.18)"
          : "1px solid rgba(148, 163, 184, 0.12)",
        borderRadius: "22px",
        padding: "16px 16px 14px",
        display: "grid",
        gap: "10px",
        alignContent: "start",
        boxShadow: "0 10px 22px rgba(2, 8, 23, 0.14)",
        transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              width: "fit-content",
              padding: "5px 10px",
              borderRadius: "999px",
              background: "rgba(30, 41, 59, 0.82)",
              border: "1px solid rgba(125, 211, 252, 0.12)",
              color: "#93c5fd",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              opacity: 0.88,
            }}
          >
            {resource.type.replaceAll("_", " ")}
          </span>
          <StatusBadge status={resource.status} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {isExpired && (
            <IconActionButton
              label="Extend availability"
              onClick={() => onExtendAvailability(resource)}
              icon="📅"
            />
          )}
          <IconActionButton label="Edit resource" onClick={() => onEdit(resource)} icon="✎" />
          <IconActionButton
            label="Delete resource"
            onClick={() => onDelete(resource.id)}
            tone="danger"
            icon="🗑"
          />
        </div>
      </div>

      <h3
        style={{
          margin: 0,
          fontSize: "21px",
          color: "#f8fafc",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {resource.name}
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          color: "#94a3b8",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        <span style={{ color: "#64748b", fontSize: "12px" }}>📍</span>
        <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{resource.location}</span>
        <span style={{ color: "rgba(148, 163, 184, 0.35)" }}>•</span>
        <span style={{ color: "#64748b", fontSize: "12px" }}>👥</span>
        <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{resource.capacity ?? "N/A"}</span>
      </div>

      <div
        style={{
          display: "grid",
          gap: "6px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(148, 163, 184, 0.12)",
          color: "#94a3b8",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontSize: "12px" }}>🕒</span>
          <span style={{ fontWeight: 700, color: "#f8fafc" }}>
            {resource.availabilityStart || "--:--"} to {resource.availabilityEnd || "--:--"}
          </span>
          <span style={{ color: "rgba(148, 163, 184, 0.35)" }}>|</span>
          <span style={{ color: "#64748b", fontSize: "12px" }}>📅</span>
          <span style={{ fontWeight: 600, color: isExpired ? "#fecaca" : "#e2e8f0" }}>
            {resource.availableFromDate || "Not set"} to {resource.availableToDate || "Not set"}
          </span>
        </div>
        {isExpired && (
          <div style={{ color: "#fca5a5", fontSize: "12px", fontWeight: 700 }}>
            Availability has expired. Extend the dates to keep this resource current.
          </div>
        )}
      </div>

      <div
        style={{
          color: "rgba(148, 163, 184, 0.82)",
          fontSize: "12.5px",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "40px",
        }}
      >
        {resource.description || "No description provided."}
      </div>
    </article>
  );
}

function Resources() {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const emptyForm = {
    name: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    availableFromDate: "",
    availableToDate: "",
    availabilityStart: "",
    availabilityEnd: "",
    status: "ACTIVE",
    description: "",
  };

  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    location: "",
    capacity: "",
    availableFromDate: "",
    availableToDate: "",
    availabilityStart: "",
    availabilityEnd: "",
  });
  const formSectionRef = useRef(null);
  const resourceNameInputRef = useRef(null);
  const resultsSectionRef = useRef(null);

  const activeCount = resources.filter((resource) => resource.status === "ACTIVE").length;
  const outOfServiceCount = resources.filter(
    (resource) => resource.status === "OUT_OF_SERVICE"
  ).length;
  const inactiveCount = resources.filter((resource) => resource.status === "INACTIVE").length;
  const totalManagedCapacity = resources.reduce(
    (sum, resource) => sum + (Number(resource.capacity) || 0),
    0
  );
  const expiredResources = resources.filter(
    (resource) => resource.availableToDate && resource.availableToDate < today
  );
  const expiringSoonResources = resources.filter(
    (resource) =>
      resource.availableToDate &&
      resource.availableToDate >= today &&
      resource.availableToDate <= nextWeek
  );
  const resourcesMissingDescription = resources.filter(
    (resource) => !resource.description || !resource.description.trim()
  );
  const resourcesMissingAvailability = resources.filter(
    (resource) =>
      !resource.availableFromDate ||
      !resource.availableToDate ||
      !resource.availabilityStart ||
      !resource.availabilityEnd
  );
  const healthyResources = resources.filter(
    (resource) =>
      resource.status === "ACTIVE" &&
      (!resource.availableToDate || resource.availableToDate >= today) &&
      resource.description &&
      resource.description.trim() &&
      resource.availableFromDate &&
      resource.availableToDate &&
      resource.availabilityStart &&
      resource.availabilityEnd
  ).length;
  const healthScore = resources.length
    ? Math.round((healthyResources / resources.length) * 100)
    : 100;
  const healthAttentionItems = resources
    .map((resource) => {
      const isExpired = resource.availableToDate && resource.availableToDate < today;
      const missingAvailability =
        !resource.availableFromDate ||
        !resource.availableToDate ||
        !resource.availabilityStart ||
        !resource.availabilityEnd;
      const missingDescription = !resource.description || !resource.description.trim();
      const isExpiringSoon =
        resource.availableToDate &&
        resource.availableToDate >= today &&
        resource.availableToDate <= nextWeek;

      if (isExpired) {
        return {
          resource,
          tone: "danger",
          title: "Date extension required",
          detail: `Availability ended on ${resource.availableToDate}. Extend this resource to keep it bookable.`,
          actionLabel: "Extend Dates",
          action: () => handleExtendAvailability(resource),
        };
      }

      if (missingAvailability) {
        return {
          resource,
          tone: "warning",
          title: "Availability details incomplete",
          detail: "Complete the date and time window so this resource is ready for scheduling.",
          actionLabel: "Complete Availability",
          action: () => handleEdit(resource),
        };
      }

      if (missingDescription) {
        return {
          resource,
          tone: "neutral",
          title: "Description missing",
          detail: "Add a short description so admins can identify and compare this resource faster.",
          actionLabel: "Add Details",
          action: () => handleEdit(resource),
        };
      }

      if (isExpiringSoon) {
        return {
          resource,
          tone: "warning",
          title: "Expiry review recommended",
          detail: `Availability ends on ${resource.availableToDate}. Review it now if this resource should remain active.`,
          actionLabel: "Review Dates",
          action: () => handleEdit(resource),
        };
      }

      return null;
    })
    .filter(Boolean)
    .slice(0, 4);
  const statusPriority = {
    ACTIVE: 0,
    OUT_OF_SERVICE: 1,
    INACTIVE: 2,
  };
  const orderedResources = [...resources].sort((left, right) => {
    const leftExpired = left.availableToDate && left.availableToDate < today ? 0 : 1;
    const rightExpired = right.availableToDate && right.availableToDate < today ? 0 : 1;

    if (leftExpired !== rightExpired) {
      return leftExpired - rightExpired;
    }

    const leftStatus = statusPriority[left.status] ?? 99;
    const rightStatus = statusPriority[right.status] ?? 99;

    if (leftStatus !== rightStatus) {
      return leftStatus - rightStatus;
    }

    return (left.name || "").localeCompare(right.name || "");
  });

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getResources();
      setResources(response.data);
    } catch (err) {
      setError("Failed to load resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "capacity" ? value : value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
     }));
    };  

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.capacity !== "" && Number(filters.capacity) < 0) {
        setError("Minimum capacity cannot be less than 0.");
        setLoading(false);
        return;
      }
      if (filters.availableFromDate && filters.availableFromDate < today) {
        setError("Available from date cannot be in the past.");
        setLoading(false);
        return;
      }
      if (filters.availableToDate && filters.availableToDate < today) {
        setError("Available to date cannot be in the past.");
        setLoading(false);
        return;
      }
      if (
        filters.availableFromDate &&
        filters.availableToDate &&
        filters.availableFromDate > filters.availableToDate
      ) {
        setError("Available to date must be on or after the available from date.");
        setLoading(false);
        return;
      }
      if (filters.capacity !== "") params.capacity = Number(filters.capacity);
      if (filters.availableFromDate) {
        params.availableFromDate = filters.availableFromDate;
      }
      if (filters.availableToDate) {
        params.availableToDate = filters.availableToDate;
      }
      if (filters.availabilityStart) {
        params.availabilityStart = filters.availabilityStart;
      }
      if (filters.availabilityEnd) {
        params.availabilityEnd = filters.availabilityEnd;
      }

      const response = await searchResources(params);
      setResources(response.data);
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      });
    } catch (err) {
      setError("Failed to search resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setFilters({
      type: "",
      status: "",
      location: "",
      capacity: "",
      availableFromDate: "",
      availableToDate: "",
      availabilityStart: "",
      availabilityEnd: "",
    });
    await loadResources();
  };

  const validateForm = () => {
    const nextErrors = {};
    const isEquipment = form.type === "EQUIPMENT";

    if (!form.name.trim()) {
      nextErrors.name = "Resource name is required.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!form.availableFromDate) {
      nextErrors.availableFromDate = "Available from date is required.";
    } else if (form.availableFromDate < today) {
      nextErrors.availableFromDate = "Available from date cannot be in the past.";
    }

    if (!form.availableToDate) {
      nextErrors.availableToDate = "Available to date is required.";
    } else if (form.availableToDate < today) {
      nextErrors.availableToDate = "Available to date cannot be in the past.";
    }

    if (
      form.availableFromDate &&
      form.availableToDate &&
      form.availableFromDate > form.availableToDate
    ) {
      nextErrors.availableToDate =
        "Available to date must be on or after the available from date.";
    }

    if (!form.availabilityStart) {
      nextErrors.availabilityStart = "Availability start time is required.";
    }

    if (!form.availabilityEnd) {
      nextErrors.availabilityEnd = "Availability end time is required.";
    }

    if (
      form.availabilityStart &&
      form.availabilityEnd &&
      form.availabilityStart >= form.availabilityEnd
    ) {
      nextErrors.availabilityEnd =
        "Availability end time must be later than the start time.";
    }

    if (form.capacity !== "" && Number(form.capacity) < 0) {
      nextErrors.capacity = "Capacity cannot be less than 0.";
    } else if (!isEquipment && form.capacity === "") {
      nextErrors.capacity = "Capacity is required for lecture halls, labs, and meeting rooms.";
    } else if (!isEquipment && Number(form.capacity) === 0) {
      nextErrors.capacity =
        "Capacity must be greater than 0 for lecture halls, labs, and meeting rooms.";
    }

    return nextErrors;
  };

  const getSaveErrorMessage = (err) => {
    const responseData = err.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors.join(", ");
    }

    return "Failed to save resource";
  };

  const getSaveFieldErrors = (err) => {
    const responseErrors = err.response?.data?.errors;
    if (!responseErrors || Array.isArray(responseErrors)) {
      return {};
    }

    const nextErrors = { ...responseErrors };

    if (responseErrors.resource || responseErrors.availabilityWindowValid) {
      nextErrors.availabilityEnd =
        responseErrors.resource || responseErrors.availabilityWindowValid;
      delete nextErrors.resource;
      delete nextErrors.availabilityWindowValid;
    }

    if (responseErrors.availabilityDateRangeValid) {
      nextErrors.availableToDate = responseErrors.availabilityDateRangeValid;
      delete nextErrors.availabilityDateRangeValid;
    }

    if (responseErrors.availableFromDateNotInPast) {
      nextErrors.availableFromDate = responseErrors.availableFromDateNotInPast;
      delete nextErrors.availableFromDateNotInPast;
    }

    if (responseErrors.availableToDateNotInPast) {
      nextErrors.availableToDate = responseErrors.availableToDateNotInPast;
      delete nextErrors.availableToDateNotInPast;
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setError("Please fix the highlighted form errors.");
      return;
    }

    const payload = {
      ...form,
      capacity: form.capacity === "" ? null : Number(form.capacity),
    };

    try {
      setError("");
      setFormErrors({});

      if (editingId) {
        await updateResource(editingId, payload);
        setNotice(`Resource updated successfully.`);
      } else {
        await createResource(payload);
        setNotice(`New resource added successfully.`);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadResources();
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      });
    } catch (err) {
      const backendFieldErrors = getSaveFieldErrors(err);
      if (Object.keys(backendFieldErrors).length > 0) {
        setFormErrors(backendFieldErrors);
      }
      setError(getSaveErrorMessage(err));
      console.error(err);
    }
  };

  const openEditForm = (resource, options = {}) => {
    const shouldExtendExpiredDates = options.extendDates && resource.availableToDate < today;

    setEditingId(resource.id);
    setFormErrors({});
    setError("");
    setNotice(
      shouldExtendExpiredDates
        ? `"${resource.name}" has expired availability. Update the new dates below and save to extend it.`
        : `You are now editing "${resource.name}". Update the form below and save your changes.`
    );
    setForm({
      name: resource.name || "",
      type: resource.type || "LECTURE_HALL",
      capacity: resource.capacity ?? "",
      location: resource.location || "",
      availableFromDate: shouldExtendExpiredDates ? today : resource.availableFromDate || "",
      availableToDate: shouldExtendExpiredDates ? today : resource.availableToDate || "",
      availabilityStart: resource.availabilityStart || "",
      availabilityEnd: resource.availabilityEnd || "",
      status: resource.status || "ACTIVE",
      description: resource.description || "",
    });

    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        resourceNameInputRef.current?.focus();
      }, 350);
    });
  };

  const handleEdit = (resource) => {
    openEditForm(resource);
  };

  const handleExtendAvailability = (resource) => {
    openEditForm(resource, { extendDates: true });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) return;

    try {
      setError("");
      await deleteResource(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadResources();
    } catch (err) {
      setError("Failed to delete resource");
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setError("");
    setNotice("Edit cancelled. You can select another resource or add a new one.");
  };

  return (
    <div style={pageStyles}>
      <div style={containerStyles}>
        <section
          style={{
            ...cardStyles,
            padding: "32px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-80px auto auto -60px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(34, 197, 94, 0.14)",
              filter: "blur(12px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "auto -60px -80px auto",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(56, 189, 248, 0.12)",
              filter: "blur(10px)",
            }}
          />
          <div style={{ position: "relative", display: "grid", gap: "22px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.8fr)",
                gap: "20px",
                alignItems: "stretch",
              }}
            >
              <div style={{ display: "grid", gap: "12px" }}>
                <h1 style={{ margin: 0, fontSize: "42px", lineHeight: 1.1 }}>
                  Smart Resource Catalogue
                </h1>
                <p
                  style={{
                    margin: 0,
                    maxWidth: "760px",
                    color: "#cbd5e1",
                    lineHeight: 1.7,
                    fontSize: "16px",
                  }}
                >
                  Manage lecture halls, labs, meeting rooms, and equipment with clean
                  search, clear availability windows, and a more polished operations
                  dashboard.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  padding: "18px",
                  borderRadius: "22px",
                  background:
                    "linear-gradient(135deg, rgba(14, 116, 144, 0.18) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(125, 211, 252, 0.16)",
                  alignContent: "start",
                }}
              >
                <div style={{ color: "#7dd3fc", fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em" }}>
                  OPERATIONS SNAPSHOT
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#f8fafc" }}>
                  {resources.length} resources under management
                </div>
                <div style={{ color: "#cbd5e1", lineHeight: 1.7, fontSize: "14px" }}>
                  Track live availability, check service status, and keep the catalogue updated
                  from one place.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "999px",
                      background: "rgba(15, 23, 42, 0.78)",
                      border: "1px solid rgba(148, 163, 184, 0.14)",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {resourceTypes.length} resource types
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "999px",
                      background: "rgba(15, 23, 42, 0.78)",
                      border: "1px solid rgba(148, 163, 184, 0.14)",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {totalManagedCapacity} total capacity
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(30, 41, 59, 0.72) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(148, 163, 184, 0.14)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Total Resources</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px" }}>
                  {resources.length}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  All rooms and equipment currently available in your resource catalogue.
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(74, 222, 128, 0.18)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Active Resources</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px", color: "#dcfce7" }}>
                  {activeCount}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  Ready to use right now for normal operations and bookings.
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(248, 113, 113, 0.18)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Out of Service</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px", color: "#fecaca" }}>
                  {outOfServiceCount}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  Temporarily unavailable resources that may need repair or maintenance.
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(148, 163, 184, 0.14) 0%, rgba(15, 23, 42, 0.92) 100%)",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                  borderRadius: "20px",
                  padding: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>Inactive Resources</div>
                <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px", color: "#e2e8f0" }}>
                  {inactiveCount}
                </div>
                <div style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.5 }}>
                  Resources kept in the system but currently not open for active use.
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div
            style={{
              ...cardStyles,
              padding: "16px 18px",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              background: "rgba(69, 10, 10, 0.72)",
              color: "#fecaca",
            }}
          >
            {error}
          </div>
        )}

        {resources.length > 0 && (
          <section
            style={{
              ...cardStyles,
              padding: "22px 24px",
              display: "grid",
              gap: "18px",
              border:
                expiredResources.length > 0
                  ? "1px solid rgba(248, 113, 113, 0.2)"
                  : healthAttentionItems.length > 0
                    ? "1px solid rgba(250, 204, 21, 0.18)"
                    : "1px solid rgba(74, 222, 128, 0.16)",
            }}
          >
            <SectionTitle
              eyebrow="Resource Health & Expiry Alerts"
              title={
                healthAttentionItems.length > 0
                  ? `${healthAttentionItems.length} resources need admin attention`
                  : "Catalogue health looks stable"
              }
              description="This operational health panel highlights expired availability, upcoming expiry, and incomplete resource profiles so you can fix issues before they affect bookings."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px",
              }}
            >
              <HealthMetricCard
                icon="🛡"
                label="Health score"
                value={`${healthScore}%`}
                description="Resources that are active, current, and fully described."
                tone={healthScore >= 80 ? "success" : healthScore >= 55 ? "warning" : "danger"}
              />
              <HealthMetricCard
                icon="⚠"
                label="Expired"
                value={expiredResources.length}
                description="Resources whose availability has already ended."
                tone={expiredResources.length > 0 ? "danger" : "neutral"}
              />
              <HealthMetricCard
                icon="⏳"
                label="Expiring soon"
                value={expiringSoonResources.length}
                description="Resources that end within the next 7 days."
                tone={expiringSoonResources.length > 0 ? "warning" : "neutral"}
              />
              <HealthMetricCard
                icon="📝"
                label="Missing details"
                value={resourcesMissingDescription.length + resourcesMissingAvailability.length}
                description="Descriptions or availability fields that still need completion."
                tone={
                  resourcesMissingDescription.length + resourcesMissingAvailability.length > 0
                    ? "warning"
                    : "neutral"
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
              }}
            >
              {healthAttentionItems.length === 0 && (
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: "20px",
                    background: "rgba(8, 28, 21, 0.42)",
                    border: "1px solid rgba(74, 222, 128, 0.18)",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#f8fafc" }}>No urgent fixes needed</div>
                  <div style={{ color: "#bbf7d0", fontSize: "13px", lineHeight: 1.6 }}>
                    Your resource catalogue has no expired records in the current attention queue. Keep reviewing dates and details to maintain this state.
                  </div>
                </div>
              )}

              {healthAttentionItems.map((item) => (
                <div
                  key={`${item.resource.id}-${item.title}`}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "20px",
                    background:
                      item.tone === "danger"
                        ? "rgba(69, 10, 10, 0.38)"
                        : item.tone === "warning"
                          ? "rgba(120, 53, 15, 0.2)"
                          : "rgba(15, 23, 42, 0.75)",
                    border:
                      item.tone === "danger"
                        ? "1px solid rgba(248, 113, 113, 0.2)"
                        : item.tone === "warning"
                          ? "1px solid rgba(250, 204, 21, 0.2)"
                          : "1px solid rgba(148, 163, 184, 0.16)",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "grid", gap: "4px" }}>
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>{item.resource.name}</div>
                    <div style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: 600 }}>
                      {item.title}
                    </div>
                  </div>
                  <div
                    style={{
                      color:
                        item.tone === "danger"
                          ? "#fecaca"
                          : item.tone === "warning"
                            ? "#fde68a"
                            : "#cbd5e1",
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.detail}
                  </div>
                  <div>
                    <button type="button" onClick={item.action} style={secondaryButtonStyles}>
                      {item.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 0.95fr) minmax(420px, 1fr)",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <section style={{ ...cardStyles, padding: "24px", display: "grid", gap: "20px" }}>
            <SectionTitle
              eyebrow="Discover"
              title="Search and filter resources"
              description="Narrow the catalogue by type, status, location, or minimum capacity without leaving the page."
            />

            <div style={{ display: "grid", gap: "16px" }}>
              <Field label="Resource Type">
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                >
                  <option value="">All Types</option>
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                >
                  <option value="">All Statuses</option>
                  {resourceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Location">
                <input
                  name="location"
                  placeholder="Search by location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                />
              </Field>

              <Field label="Minimum Capacity">
                <input
                  name="capacity"
                  type="number"
                  placeholder="Minimum capacity"
                  min="0"
                  value={filters.capacity}
                  onChange={handleFilterChange}
                  style={fieldStyles}
                />
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                }}
              >
                <Field label="Available From Date">
                  <input
                    name="availableFromDate"
                    type="date"
                    min={today}
                    value={filters.availableFromDate}
                    onChange={handleFilterChange}
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available To Date">
                  <input
                    name="availableToDate"
                    type="date"
                    min={today}
                    value={filters.availableToDate}
                    onChange={handleFilterChange}
                    style={fieldStyles}
                  />
                </Field>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                }}
              >
                <Field label="Available From">
                  <input
                    name="availabilityStart"
                    type="time"
                    value={filters.availabilityStart}
                    onChange={handleFilterChange}
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available Until">
                  <input
                    name="availabilityEnd"
                    type="time"
                    value={filters.availabilityEnd}
                    onChange={handleFilterChange}
                    style={fieldStyles}
                  />
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button type="button" onClick={handleSearch} style={primaryButtonStyles}>
                Search Resources
              </button>
              <button type="button" onClick={handleResetFilters} style={secondaryButtonStyles}>
                Reset Filters
              </button>
            </div>
          </section>

          <section
            ref={formSectionRef}
            style={{ ...cardStyles, padding: "24px", display: "grid", gap: "20px" }}
          >
            <SectionTitle
              eyebrow={editingId ? "Edit" : "Create"}
              title={editingId ? "Update a resource" : "Add a new resource"}
              description="Keep the catalogue complete with location, capacity, status, and availability windows."
            />

            {notice && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "18px",
                  background: editingId
                    ? "rgba(59, 130, 246, 0.14)"
                    : "rgba(34, 197, 94, 0.14)",
                  border: editingId
                    ? "1px solid rgba(96, 165, 250, 0.24)"
                    : "1px solid rgba(74, 222, 128, 0.22)",
                  color: "#dbeafe",
                  lineHeight: 1.6,
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
              <Field label="Resource Name" error={formErrors.name}>
                <input
                  ref={resourceNameInputRef}
                  name="name"
                  placeholder="Resource name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={fieldStyles}
                />
              </Field>

              <Field label="Type">
                <select name="type" value={form.type} onChange={handleChange} style={fieldStyles}>
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                }}
              >
                <Field
                  label={
                    form.type === "EQUIPMENT"
                      ? "Capacity (optional for equipment)"
                      : "Capacity"
                  }
                  error={formErrors.capacity}
                >
                  <input
                    name="capacity"
                    type="number"
                    placeholder={
                      form.type === "EQUIPMENT"
                        ? "Optional, use 0 if not applicable"
                        : "Capacity"
                    }
                    min="0"
                    value={form.capacity}
                    onChange={handleChange}
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Location" error={formErrors.location}>
                  <input
                    name="location"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <Field label="Available From Date" error={formErrors.availableFromDate}>
                  <input
                    name="availableFromDate"
                    type="date"
                    min={today}
                    value={form.availableFromDate}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available To Date" error={formErrors.availableToDate}>
                  <input
                    name="availableToDate"
                    type="date"
                    min={today}
                    value={form.availableToDate}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available From" error={formErrors.availabilityStart}>
                  <input
                    name="availabilityStart"
                    type="time"
                    value={form.availabilityStart}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>

                <Field label="Available Until" error={formErrors.availabilityEnd}>
                  <input
                    name="availabilityEnd"
                    type="time"
                    value={form.availabilityEnd}
                    onChange={handleChange}
                    required
                    style={fieldStyles}
                  />
                </Field>
              </div>

              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={fieldStyles}
                >
                  {resourceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  placeholder="Short description about the resource"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  style={{ ...fieldStyles, resize: "vertical", minHeight: "120px" }}
                />
              </Field>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button type="submit" style={primaryButtonStyles}>
                  {editingId ? "Update Resource" : "Add Resource"}
                </button>

                {editingId && (
                  <button type="button" onClick={handleCancel} style={secondaryButtonStyles}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>

        <section
          ref={resultsSectionRef}
          style={{ ...cardStyles, padding: "24px", display: "grid", gap: "22px" }}
        >
          <SectionTitle
            eyebrow="Catalogue"
            title="All resources"
            description="A quick operational view of every resource currently available in the system."
          />

          {!loading && resources.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "rgba(30, 41, 59, 0.72)",
                  border: "1px solid rgba(148, 163, 184, 0.16)",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Showing {resources.length} resources
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(74, 222, 128, 0.18)",
                  color: "#dcfce7",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {activeCount} active
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(248, 113, 113, 0.18)",
                  color: "#fecaca",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {outOfServiceCount} out of service
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "999px",
                  background: "rgba(148, 163, 184, 0.12)",
                  border: "1px solid rgba(148, 163, 184, 0.18)",
                  color: "#e2e8f0",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {inactiveCount} inactive
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ color: "#93c5fd", fontSize: "15px" }}>Loading resources...</div>
          ) : resources.length === 0 ? (
            <div
              style={{
                padding: "26px",
                borderRadius: "18px",
                border: "1px dashed rgba(148, 163, 184, 0.22)",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              No resources found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {orderedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  today={today}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onExtendAvailability={handleExtendAvailability}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Resources;
