// Bu tanım, MetaMask'in tarayıcıya enjekte ettiği 'window.ethereum' nesnesini içerir.
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] | object }) => Promise<any>;
    // Gerekirse diğer standart EIP-1193 özelliklerini ekleyebilirsiniz
    on: (eventName: string, listener: (...args: any[]) => void) => void;
    removeListener: (eventName: string, listener: (...args: any[]) => void) => void;
  };
}