"use client";

import React, { useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { inAppWallet, smartWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
	clientId: "e75f0c13884e4a3be8d27a8ca43b89b8",
});

// Use a custom RPC for Paxeer chain (id 229) instead of thirdweb's default endpoint
const chain = defineChain({
	id: 229,
	name: "Paxeer",
	nativeCurrency: {
		name: "Paxeer",
		symbol: "PAX",
		decimals: 18,
	},
	rpc: import.meta.env.PUBLIC_PAXEER_RPC_URL as string,
});

const personalWallet = inAppWallet();
const smartWalletConfig = smartWallet({
	chain,
	factoryAddress: "0x82bd8459C3328F0CfE047B4b1c9e2d1e262D7411",
	gasless: true,
});

export default function DashboardShell() {
	const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
	const [error, setError] = useState<string | null>(null);
	const [personalAddress, setPersonalAddress] = useState<string | null>(null);
	const [smartAddress, setSmartAddress] = useState<string | null>(null);

	async function handleGoogleConnect() {
		setStatus("connecting");
		setError(null);

		try {
			const personalAccount: any = await personalWallet.connect({
				client,
				chain,
				strategy: "google",
			});

			const smartAccount: any = await (smartWalletConfig as any).connect({
				client,
				personalAccount,
			} as any);

			setPersonalAddress(personalAccount?.address ?? null);
			// Prefer direct address property, fall back to getAddress if needed
			if (smartAccount?.address) {
				setSmartAddress(smartAccount.address);
			} else if (typeof smartAccount?.getAddress === "function") {
				const addr = await smartAccount.getAddress();
				setSmartAddress(addr);
			}

			setStatus("connected");
		} catch (err: any) {
			console.error("Smart wallet connect failed", err);
			setError(err?.message ?? "Failed to connect wallet");
			setStatus("error");
		}
	}

	return (
		<div className="w-full flex flex-col items-center gap-6">
			<button
				type="button"
				onClick={handleGoogleConnect}
				className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors min-w-[220px]"
			>
				{status === "connecting" ? "Connecting..." : "Continue with Google"}
			</button>

			{error && (
				<p className="text-sm text-red-400 mt-2 max-w-md text-center">
					{error}
				</p>
			)}

			{status === "connected" && (
				<div className="w-full max-w-xl mt-6 p-6 rounded-xl border border-white/10 bg-white/5 text-left">
					<p className="text-xs uppercase tracking-wide text-white/40 mb-2">
						Connected smart accounts
					</p>
					<p className="text-xs text-white/60 mb-1">Personal wallet</p>
					<p className="font-mono text-sm break-all mb-3">{personalAddress}</p>
					<p className="text-xs text-white/60 mb-1">Smart account</p>
					<p className="font-mono text-sm break-all">{smartAddress}</p>
				</div>
			)}
		</div>
	);
}
