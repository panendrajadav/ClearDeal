import { createConfig, http } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'ClearDeal',
        url: 'https://cleardeal.app',
        iconUrl: 'https://cleardeal.app/icon.png',
      },
    }),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});