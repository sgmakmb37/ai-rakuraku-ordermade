export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="spinner-apple"
      style={{
        width: size,
        height: size,
        borderColor: "rgba(0,0,0,0.15)",
        borderTopColor: "var(--color-primary)",
      }}
    />
  );
}

export function PageSpinner() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spinner size={24} />
    </div>
  );
}
