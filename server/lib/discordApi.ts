import axios, { Method } from 'axios';


const botToken = process.env.DISCORD_BOT_TOKEN || '';

const callApi = async <T = any>(
  endpoint: string, options?: {
    body?: any,
    method?: Method,
    params?: { [index: string]: any },
    token?: string,
  },
) => {
  const { body, method, params, token } = options || {};

  const { data } = await axios.request<T>({
    baseURL: 'https://discord.com/api/v10',
    url: endpoint,
    method: method || 'get',
    headers: { Authorization: token ? `Bearer ${token}` : `Bot ${botToken}` },
    params,
    data: body,
  });

  return data;
};

export default callApi;
