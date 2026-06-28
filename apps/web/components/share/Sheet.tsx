import { colors } from "@/lib/theme";

export function Sheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(20,20,20,0.32)",
        }}
      />
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxWidth: 440,
          margin: "0 auto",
          background: colors.card,
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.18)",
          padding: "12px 26px 34px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 14,
          }}
        >
          <span
            style={{
              width: 38,
              height: 5,
              borderRadius: 3,
              background: "#E2E2DD",
            }}
          />
        </div>
        {children}
      </div>
    </>
  );
}
