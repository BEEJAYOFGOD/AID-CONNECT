export enum WalletError {
    NOT_INSTALLED = 'NOT_INSTALLED',
    CONNECTION_REJECTED = 'CONNECTION_REJECTED',
    WRONG_NETWORK = 'WRONG_NETWORK',
    TRANSACTION_FAILED = 'TRANSACTION_FAILED',
    INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'
}

export interface WalletErrorDetails {
    type: WalletError;
    message: string;
    details?: any;
}