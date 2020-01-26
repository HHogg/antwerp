// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (...refs: React.Ref<any>[]) => (value: any) => {
  for (const ref of refs) {
    if (typeof ref === 'function') {
      ref(value);
    } else if (ref !== null) {
      ref.current = value;
    }
  }
};
