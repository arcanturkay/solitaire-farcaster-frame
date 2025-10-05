interface FarcasterContext {
  user?: {
    fid?: number;
    username?: string;
  };
}

interface FarcasterWindow {
  context?: FarcasterContext;
}

// Window global tipini genişlet
interface Window {
  farcaster?: FarcasterWindow;
}
