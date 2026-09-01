import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH';

export const PAYMENT_METHODS: PaymentMethod[] = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH'];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Débito',
  CASH: 'Dinheiro',
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, ComponentType<SvgIconProps>> = {
  PIX: BoltRoundedIcon,
  CREDIT_CARD: CreditCardRoundedIcon,
  DEBIT_CARD: AccountBalanceRoundedIcon,
  CASH: PaymentsRoundedIcon,
};
