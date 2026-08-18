// FormField.jsx — reusable input field with a label and error message.
//
// Login and Signup use the same label, input, and error setup several times.
// This component keeps that code in one place.
//
// Accessibility:
// htmlFor + id — clicking the label focuses the input.
// aria-invalid — tells screen readers when the field has an error.
// aria-describedby — connects the input to its error message.
export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  ...inputProps // Pass extra input settings like placeholder and required.
}) {
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-(--text-h)">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border bg-transparent px-3 py-2 outline-none transition
          focus:border-(--accent) focus:ring-2 focus:ring-(--accent-bg)
          ${error ? "border-red-500" : "border-(--border)"}`}
        {...inputProps}
      />

      {/* Makes screen readers announce the error when it appears. */}
      {error && (
        <span id={errorId} role="alert" className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
