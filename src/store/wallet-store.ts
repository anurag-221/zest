import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncUserWallet } from '@/actions/sync-actions';

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    date: string;
}

interface WalletState {
    balance: number;
    transactions: Transaction[];
    addFunds: (amount: number, description: string, userId?: string) => void;
    deductFunds: (amount: number, description: string, userId?: string) => boolean;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            balance: 500,
            transactions: [
                {
                    id: '1',
                    amount: 500,
                    type: 'credit',
                    description: 'Welcome Bonus',
                    date: new Date().toLocaleDateString()
                }
            ],
            addFunds: (amount, description, userId) => {
                set(state => {
                    const newTxns = [
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            amount,
                            type: 'credit' as const,
                            description,
                            date: new Date().toLocaleDateString()
                        },
                        ...state.transactions
                    ];
                    const newBalance = state.balance + amount;
                    if (userId) syncUserWallet(userId, newBalance, newTxns).catch(console.error);
                    return { balance: newBalance, transactions: newTxns };
                });
            },
            deductFunds: (amount, description, userId) => {
                const { balance } = get();
                if (balance < amount) return false;

                set(state => {
                    const newTxns = [
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            amount,
                            type: 'debit' as const,
                            description,
                            date: new Date().toLocaleDateString()
                        },
                        ...state.transactions
                    ];
                    const newBalance = state.balance - amount;
                    if (userId) syncUserWallet(userId, newBalance, newTxns).catch(console.error);
                    return { balance: newBalance, transactions: newTxns };
                });
                return true;
            }
        }),
        { name: 'user-wallet-storage' }
    )
);

