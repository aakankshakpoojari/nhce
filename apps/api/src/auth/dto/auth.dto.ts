export class SignUpDto {
  email!: string;
  password!: string;
  name?: string;
  role?: 'CLIENT' | 'FREELANCER';
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class ConnectWalletDto {
  walletAddress!: string;
}
