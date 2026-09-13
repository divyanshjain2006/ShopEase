export default function Loader({ size = 40 }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: '4px solid #e5e4e7',
          borderTop: '4px solid #8b1a2b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}
