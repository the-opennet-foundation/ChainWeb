"use client";

import React, { useEffect, useState } from "react";
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
	gasless: false,
});

type Holding = {
	symbol: string;
	name: string;
	balance: string;
	valueUsd: string;
};

type NetworkStatsSummary = {
	totalTransactions: string;
	transactionsToday: string;
	tvlUsd: string;
	avgBlockTime: string;
};

type BalancePoint = {
	date: string;
	amount: number;
};

type TxItem = {
	hash: string;
	timestamp: string;
	tokenSymbol: string;
	amount: string;
	direction: "in" | "out";
};

type NativePaxBalance = {
	amountPax: number;
	amountPaxFormatted: string;
	usdValue: number;
	usdValueFormatted: string;
};

const SAMPLE_HOLDINGS: Holding[] = [
	{ symbol: "PAX", name: "Paxeer", balance: "48,230.12", valueUsd: "$382,000" },
	{ symbol: "ETH", name: "Ether", balance: "12.04", valueUsd: "$38,400" },
	{ symbol: "USDT", name: "Tether", balance: "95,000", valueUsd: "$95,000" },
];

const SAMPLE_NETWORK_STATS: NetworkStatsSummary = {
	transactionsToday: "8,857",
	totalTransactions: "83,703",
	tvlUsd: "$3.97B",
	avgBlockTime: "5.0s",
};

const PAXEER_TEST_ADDRESS = import.meta.env.PUBLIC_PAXEER_TEST_ADDRESS as string | undefined;

function paxeerViaAllOrigins(path: string): string {
	const base = "https://scan.paxeer.app";
	const target = `${base}${path}`;
	const encoded = encodeURIComponent(target);
	return `https://api.allorigins.win/raw?url=${encoded}`;
}

function viaAllOriginsAbsolute(url: string): string {
	const encoded = encodeURIComponent(url);
	return `https://api.allorigins.win/raw?url=${encoded}`;
}

export default function DashboardShell() {
	const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
	const [error, setError] = useState<string | null>(null);
	const [personalAddress, setPersonalAddress] = useState<string | null>(null);
	const [smartAddress, setSmartAddress] = useState<string | null>(null);
	const [holdings, setHoldings] = useState<Holding[] | null>(null);
	const [networkStats, setNetworkStats] = useState<NetworkStatsSummary | null>(null);
	const [dataLoading, setDataLoading] = useState(false);
	const [dataError, setDataError] = useState<string | null>(null);
	const [balanceSeries, setBalanceSeries] = useState<BalancePoint[] | null>(null);
	const [transactions, setTransactions] = useState<TxItem[]>([]);
	const [nativePaxBalance, setNativePaxBalance] = useState<NativePaxBalance | null>(null);

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

	// Load Paxeer portfolio + network stats once the smart account is connected
	useEffect(() => {
		const addressForData = PAXEER_TEST_ADDRESS || smartAddress;
		if (status !== "connected" || !addressForData) return;

		let cancelled = false;

		async function loadData() {
			setDataLoading(true);
			setDataError(null);
			try {
				// Network stats (global)
				const statsRes = await fetch(paxeerViaAllOrigins("/api/v2/stats"));
				if (statsRes.ok) {
					const stats: any = await statsRes.json();
					if (!cancelled) {
						setNetworkStats({
							totalTransactions: String(stats.total_transactions ?? ""),
							transactionsToday: String(stats.transactions_today ?? ""),
							tvlUsd: stats.tvl != null ? `$${Number(stats.tvl).toLocaleString()}` : SAMPLE_NETWORK_STATS.tvlUsd,
							avgBlockTime:
								stats.average_block_time != null
										? `${Number(stats.average_block_time).toFixed(1)}s`
										: SAMPLE_NETWORK_STATS.avgBlockTime,
						});
					}
				}

				// Basic holdings for the connected smart account (or test address)
				const holdingsRes = await fetch(
					paxeerViaAllOrigins(`/api/v2/addresses/${addressForData}/token-balances`),
				);
				if (holdingsRes.ok) {
					const raw: any[] = await holdingsRes.json();
					if (!cancelled) {
						const mapped: Holding[] = raw.slice(0, 3).map((item) => {
							const symbol = item?.token?.symbol ?? "";
							const name = item?.token?.name ?? symbol;
							const valueRaw = Number(item?.value ?? 0);
							const decimals = Number(item?.token?.decimals ?? 18);
							const rate = Number(item?.token?.exchange_rate ?? 0);
							const amount =
								Number.isFinite(valueRaw) && Number.isFinite(decimals)
									? valueRaw / Math.pow(10, decimals)
									: 0;
							const usd = amount * (Number.isFinite(rate) ? rate : 0);
							return {
								symbol,
								name,
								balance: amount ? amount.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0",
								valueUsd: usd ? `$${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "-",
							};
						});
						setHoldings(mapped);
					}
				} else if (holdingsRes.status === 404 && !cancelled) {
					setHoldings([]);
				}

				// Native PAX coin balance (Paxeer address endpoint)
				const nativeRes = await fetch(
					paxeerViaAllOrigins(`/api/v2/addresses/${addressForData}`),
				);
				let nativeAmountPax: number | null = null;
				if (nativeRes.ok) {
					const nativeJson: any = await nativeRes.json();
					const rawBalance = Number(nativeJson.coin_balance ?? 0);
					if (Number.isFinite(rawBalance) && rawBalance > 0) {
						// coin_balance is in wei-like units (10^18)
						nativeAmountPax = rawBalance / Math.pow(10, 18);
					}
				}

				// Native balance history (for simple chart)
				const balanceRes = await fetch(
					paxeerViaAllOrigins(
						`/api/v2/addresses/${addressForData}/coin-balance-history-by-day`,
					),
				);
				if (balanceRes.ok) {
					const hist: any = await balanceRes.json();
					const items: any[] = hist.items || [];
					if (!cancelled && items.length) {
						const series: BalancePoint[] = items.map((pt) => ({
							date: String(pt.date),
							amount: Number(pt.value ?? 0) / Math.pow(10, 18),
						}));
						setBalanceSeries(series);
					}
				} else if (balanceRes.status === 404 && !cancelled) {
					setBalanceSeries([]);
				}

				// Recent token transfers for this smart account (or test address)
				const txRes = await fetch(
					paxeerViaAllOrigins(`/api/v2/addresses/${addressForData}/token-transfers`),
				);
				if (txRes.ok) {
					const txPayload: any = await txRes.json();
					const items: any[] = txPayload.items || [];
					if (!cancelled && items.length) {
						const lower = (addressForData || smartAddress || "").toLowerCase();
						const mappedTx: TxItem[] = items.slice(0, 4).map((tx) => {
							const from = tx.from?.hash?.toLowerCase?.() || "";
							const to = tx.to?.hash?.toLowerCase?.() || "";
							const direction: "in" | "out" = to === lower ? "in" : "out";
							const decimals = Number(tx.total?.decimals ?? 18);
							const rawVal = Number(tx.total?.value ?? 0);
							const amount =
								Number.isFinite(rawVal) && Number.isFinite(decimals)
									? rawVal / Math.pow(10, decimals)
									: 0;
							return {
								hash: String(tx.transaction_hash ?? ""),
								timestamp: String(tx.timestamp ?? ""),
								tokenSymbol: String(tx.token?.symbol ?? ""),
								amount: amount
									? amount.toLocaleString(undefined, { maximumFractionDigits: 4 })
									: "0",
								direction,
							};
						});
						setTransactions(mappedTx);
					}
				} else if (txRes.status === 404 && !cancelled) {
					setTransactions([]);
				}

				// If we have a native PAX amount, fetch USD price from Sidiora and compute value
				if (!cancelled && nativeAmountPax != null) {
					try {
						const priceRes = await fetch(
							viaAllOriginsAbsolute("https://sidiora.exchange/api/price/stats"),
						);
						if (priceRes.ok) {
							const priceJson: any = await priceRes.json();
							const price = Number(priceJson.current ?? 0);
							if (Number.isFinite(price) && price > 0) {
								const usd = nativeAmountPax * price;
								setNativePaxBalance({
									amountPax: nativeAmountPax,
									amountPaxFormatted: nativeAmountPax.toLocaleString(undefined, {
										maximumFractionDigits: 4,
									}),
									usdValue: usd,
									usdValueFormatted: `$${usd.toLocaleString(undefined, {
										maximumFractionDigits: 2,
									})}`,
								});
							}
						}
					} catch (priceErr) {
						// Swallow price errors; nativePaxBalance will just remain null
					}
				}
			} catch (err: any) {
				if (!cancelled) {
					console.error("Failed to load dashboard data", err);
					setDataError(err?.message ?? "Failed to load dashboard data");
				}
			} finally {
				if (!cancelled) {
					setDataLoading(false);
				}
			}
		}

		loadData();
		return () => {
			cancelled = true;
		};
	}, [status, smartAddress]);

	return (
		<div className="w-full flex flex-col items-center gap-8">
			<button
				type="button"
				onClick={handleGoogleConnect}
				disabled={status === "connecting"}
				className="px-6 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transition-colors min-w-[240px]"
			>
				{status === "connecting"
					? "Connecting..."
					: status === "connected"
					? "Connected with Google"
					: "Continue with Google"}
			</button>

			{error && (
				<p className="text-sm text-red-400 mt-2 max-w-md text-center">
					{error}
				</p>
			)}

			{dataError && (
				<p className="text-xs text-amber-300/90 mt-1 max-w-md text-center">
					{dataError}
				</p>
			)}

			{status === "connected" && (
				<div className="w-full max-w-6xl mt-8 grid gap-6 lg:grid-cols-[2.1fr,1fr]">
					{/* Left: wallet value, chart, quick actions, mini stats */}
					<div className="space-y-6">
						<div className="p-6 rounded-2xl border border-white/10 bg-black/40 text-left flex flex-col gap-4">
							<p className="text-xs uppercase tracking-wide text-white/40">Wallet value</p>
							<p className="text-4xl md:text-5xl font-semibold">
								{(() => {
									const holdingsUsd = (holdings || []).reduce((acc: number, h: Holding) => {
										const v = Number(h.valueUsd.replace(/[^0-9.]/g, "")) || 0;
										return acc + v;
									}, 0);
									const nativeUsd = nativePaxBalance?.usdValue ?? 0;
									const total = holdingsUsd + nativeUsd;
									if (!Number.isFinite(total) || total <= 0) return "$0.00";
									return `~$${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
								})()}
							</p>
							{nativePaxBalance && (
								<p className="text-sm text-emerald-300/90">
									{nativePaxBalance.amountPaxFormatted} PAX
									<span className="text-white/60">  b7 </span>
									<span className="text-white/80">{nativePaxBalance.usdValueFormatted}</span>
								</p>
							)}
							<p className="text-sm text-white/60">
								Estimated total value across tokens held by your ChainFlow smart account.
							</p>

							{/* Balance history mini-chart */}
							<div className="mt-4 h-40 w-full rounded-xl bg-black/60 border border-white/5 overflow-hidden flex items-end gap-[2px] px-2 py-3">
								{balanceSeries && balanceSeries.length ? (
									balanceSeries.map((pt, idx) => {
										const max = Math.max(...balanceSeries.map((p) => p.amount || 0)) || 1;
										const height = Math.max(8, (pt.amount / max) * 100);
										return (
											<div
												key={pt.date + idx}
												className="flex-1 bg-gradient-to-t from-emerald-400/60 via-emerald-300/40 to-emerald-200/10 rounded-t-full"
												style={{ height: `${height}%` }}
											/>
										);
									})
								) : (
									<p className="text-xs text-white/50 m-auto text-center">
										Balance history will render here once the account has on-chain activity.
									</p>
								)}
							</div>

							{/* Quick actions inside main panel */}
							<div className="mt-4 flex flex-wrap gap-3">
								<button className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-gray-200 transition-colors">
									Send
								</button>
								<button className="px-4 py-2 rounded-lg border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
									Receive
								</button>
								<button className="px-4 py-2 rounded-lg border border-white/20 text-xs font-semibold text-white hover:bg-white/10 transition-colors">
									Bridge
								</button>
							</div>
						</div>

						{/* Mini stats row similar to realized / projected / net */}
						<div className="grid gap-4 md:grid-cols-3">
							<div className="p-4 rounded-xl border border-white/10 bg-white/5">
								<p className="text-xs uppercase tracking-wide text-white/40 mb-1">Realized P/L</p>
								<p className="text-lg font-semibold text-emerald-300">+$0.00</p>
								<p className="text-[11px] text-white/50">
									Payouts accrued via this smart account.
								</p>
							</div>
							<div className="p-4 rounded-xl border border-white/10 bg-white/5">
								<p className="text-xs uppercase tracking-wide text-white/40 mb-1">Projected growth</p>
								<p className="text-lg font-semibold">—</p>
								<p className="text-[11px] text-white/50">
									Will be driven by the risk engine & portfolio score.
								</p>
							</div>
							<div className="p-4 rounded-xl border border-white/10 bg-white/5">
								<p className="text-xs uppercase tracking-wide text-white/40 mb-1">Net change</p>
								<p className="text-lg font-semibold">—</p>
								<p className="text-[11px] text-white/50">
									Day-over-day change in wallet value.
								</p>
							</div>
						</div>
					</div>

					{/* Right: account, risk, transactions, network stats, payout */}
					<div className="space-y-6">
						{/* Account overview & rating */}
						<div className="p-6 rounded-xl border border-white/10 bg-white/5 text-left flex flex-col gap-3">
							<p className="text-xs uppercase tracking-wide text-white/40">Account</p>
							<p className="text-sm text-white/60">Smart account</p>
							<p className="font-mono text-xs break-all mb-2">{smartAddress}</p>
							<p className="text-sm text-white/60">Personal wallet</p>
							<p className="font-mono text-xs break-all mb-3">{personalAddress}</p>
							<div className="flex items-center justify-between mt-1">
								<span className="text-xs text-white/50">Portfolio risk score</span>
								<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
									A-
									<span className="text-[10px] text-emerald-200/80">(pilot)</span>
								</span>
							</div>
							<p className="mt-2 text-xs text-white/50">
								Risk score will be computed from your on-chain activity and drawdown profile once
								the engine is live.
							</p>
						</div>

						{/* Transactions feed */}
						<div className="p-6 rounded-xl border border-white/10 bg-white/5 text-left flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<p className="text-xs uppercase tracking-wide text-white/40">Transactions</p>
								<span className="text-[11px] text-white/40">Last 4</span>
							</div>
							<div className="space-y-3">
								{transactions.length ? (
									transactions.map((tx) => (
										<div
											key={tx.hash}
											className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs"
										>
											<div className="flex flex-col">
												<span className="font-medium text-white">
													{tx.direction === "in" ? "Receive" : "Send"} {tx.tokenSymbol}
												</span>
												<span className="text-[11px] text-white/50">
													{new Date(tx.timestamp).toLocaleString()}
												</span>
											</div>
											<span
												className={
													tx.direction === "in"
														? "text-emerald-300 font-semibold"
														: "text-red-300 font-semibold"
												}
											>
												{tx.direction === "in" ? "+" : "-"}
												{tx.amount}
											</span>
										</div>
									))
								) : (
									<p className="text-xs text-white/50">
										Recent token transfers for this smart account will appear here.
									</p>
								)}
							</div>
						</div>

						{/* Network stats */}
						<div className="p-6 rounded-xl border border-white/10 bg-white/5 text-left flex flex-col gap-3">
							<p className="text-xs uppercase tracking-wide text-white/40">Network stats</p>
							<div className="flex items-center justify-between text-sm text-white/70">
								<span>Total transactions</span>
								<span className="font-semibold">{(networkStats || SAMPLE_NETWORK_STATS).totalTransactions}</span>
							</div>
							<div className="flex items-center justify-between text-sm text-white/70">
								<span>Transactions today</span>
								<span className="font-semibold">{(networkStats || SAMPLE_NETWORK_STATS).transactionsToday}</span>
							</div>
							<div className="flex items-center justify-between text-sm text-white/70">
								<span>TVL</span>
								<span className="font-semibold">{(networkStats || SAMPLE_NETWORK_STATS).tvlUsd}</span>
							</div>
							<div className="flex items-center justify-between text-sm text-white/70">
								<span>Avg. block time</span>
								<span className="font-semibold">{(networkStats || SAMPLE_NETWORK_STATS).avgBlockTime}</span>
							</div>
							<p className="mt-2 text-xs text-white/50">
								These values mirror the Paxeer stats endpoints and will be hydrated from live
								API responses.
							</p>
						</div>

						{/* Payout qualification */}
						<div className="p-6 rounded-xl border border-white/10 bg-white/5 text-left flex flex-col gap-3">
							<p className="text-xs uppercase tracking-wide text-white/40">Payout qualification</p>
							<p className="text-sm text-white/70">
								You are currently in <span className="font-semibold">pre-qualification</span>.
								Once your smart account crosses internal risk and activity thresholds, this
								module will show payout windows, currencies, and settlement preferences.
							</p>
							<div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
								<div className="h-full w-1/6 bg-amber-400" />
							</div>
							<p className="text-xs text-white/50">
								Backend will provide a normalized payout score (0–100) that we map into these
								bands.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
