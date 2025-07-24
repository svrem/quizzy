function PulseLoader() {
  const wrapper: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
  };

  const style = (i: number): React.CSSProperties => {
    return {
      backgroundColor: 'currentColor',
      width: '15px',
      height: '15px',
      margin: '2px',
      borderRadius: '100%',
      display: 'inline-block',
      animation: `pulse2 ${0.75}s ${i * 0.12}s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08)`,
      animationFillMode: 'both',
    };
  };

  return (
    <span style={wrapper}>
      <span style={style(1)} />
      <span style={style(2)} />
      <span style={style(3)} />
    </span>
  );
}

export default PulseLoader;
