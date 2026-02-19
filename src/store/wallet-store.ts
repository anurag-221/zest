import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    addFunds: (amount: number, description: string) => void;
    deductFunds: (amount: number, description: string) => boolean;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            balance: 500, // Default mock balance
            transactions: [
                {
                    id: '1',
                    amount: 500,
                    type: 'credit',
                    description: 'Welcome Bonus',
                    date: new Date().toLocaleDateString()
                }
            ],
            addFunds: (amount, description) => {
                set(state => ({
                    balance: state.balance + amount,
                    transactions: [
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            amount,
                            type: 'credit',
                            description,
                            date: new Date().toLocaleDateString()
                        },
                        ...state.transactions
                    ]
                }));
            },
            deductFunds: (amount, description) => {
                const { balance } = get();
                if (balance < amount) return false;

                set(state => ({
                    balance: state.balance - amount,
                    transactions: [
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            amount,
                            type: 'debit',
                            description,
                            date: new Date().toLocaleDateString()
                        },
                        ...state.transactions
                    ]
                }));
                return true;
            }
        }),
        {
            name: 'user-wallet-storage',
        }
    )
);
