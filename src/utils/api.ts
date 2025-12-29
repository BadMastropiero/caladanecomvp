export const unwrapApiData = (input: any) => {
  if (input && typeof input === "object" && "data" in input) {
    return (input as any).data;
  }
  return input;
};
