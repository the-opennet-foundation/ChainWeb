"use client";

import { ethereum } from "thirdweb/chains";
import { ConnectButton, darkTheme, ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
	clientId: "e75f0c13884e4a3be8d27a8ca43b89b8",
});

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "email",
        "x",
        "passkey",
        "phone",
        "guest",
        "apple",
        "coinbase",
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("com.binance.wallet"),
  createWallet("com.safepal"),
  createWallet("com.bitget.web3"),
  createWallet("com.okex.wallet"),
  createWallet("com.trustwallet.app"),
  createWallet("org.uniswap"),
  createWallet("com.ledger"),
  createWallet("com.bybit"),
  createWallet("com.bestwallet"),
  createWallet("pro.tokenpocket"),
];

export default function ThirdwebConnect() {
	return (
		<ThirdwebProvider client={client}>
			<ConnectButton
				client={client}
				accountAbstraction={{
					chain: ethereum,
					sponsorGas: true,
				}}
				auth={{
					async doLogin() {
						// TODO: integrate with your backend authentication endpoint
					},
					async doLogout() {
						// TODO: optionally notify your backend on logout
					},
					async getLoginPayload() {
						// TODO: fetch a login payload from your backend
						return {
							payload: "",
						} as any;
					},
					async isLoggedIn() {
						// TODO: check login state with your backend
						return false;
					},
				}}
				connectModal={{
					privacyPolicyUrl: "https://chainflowtrading.com/privacy",
					showThirdwebBranding: false,
					size: "wide",
					termsOfServiceUrl: "https://chainflowtrading.com/terms",
					title: "ChainFlow Smart Wallets",
					titleIcon: "https://chainflowtrading.com/Logo.svg",
				}}
				theme={darkTheme({
					colors: {
						modalBg: "hsl(0, 0%, 0%)",
						borderColor: "hsl(0, 0%, 0%)",
						accentText: "hsl(0, 46%, 98%)",
						separatorLine: "hsl(0, 0%, 0%)",
						tertiaryBg: "hsl(174, 10%, 37%)",
						skeletonBg: "hsl(0, 0%, 100%)",
						accentButtonText: "hsl(0, 0%, 0%)",
					},
				})}
				wallets={wallets}
			/>
		</ThirdwebProvider>
	);
}
