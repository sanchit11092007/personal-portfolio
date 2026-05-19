document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contactForm");
  if (!form) return;

  const status = document.querySelector("#formStatus");
  const fields = [...form.querySelectorAll("input, textarea")];

  fields.forEach((field) => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setStatus(status, "Please complete the highlighted fields before sending.", "error");
      return;
    }
    // Validation passed. Reset status and let main.js handle the backend submission.
    setStatus(status, "", "neutral");
  });
});

function validateField(field) {
  const row = field.closest(".form-row");
  const error = row?.querySelector(".field-error");
  let message = "";

  if (field.validity.valueMissing) {
    message = `${field.previousElementSibling?.textContent || "This field"} is required.`;
  } else if (field.type === "email" && field.validity.typeMismatch) {
    message = "Enter a valid email address.";
  } else if (field.name === "message" && field.value.trim().length < 12) {
    message = "Please share a little more context.";
  } else if (field.name === "subject" && field.value.trim().length < 3) {
    message = "Use a clear subject.";
  }

  row?.classList.toggle("invalid", Boolean(message));
  if (error) {
    error.textContent = message;
  }

  return !message;
}



function setStatus(statusElement, message, type) {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.dataset.type = type;
}
