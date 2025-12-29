export {};
declare global {
  interface Window {
    ethereum: any;
  }
}

declare module "@testing-library/react" {
  export const screen: any;
}
