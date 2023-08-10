export interface Credentials {
  server: string;
  loginName: string;
  appPassword: string;
}

export interface LoginPoll {
  poll: {
    token: string;
    endpoint: string;
  };
  login: string;
}
