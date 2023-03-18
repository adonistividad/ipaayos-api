export default class Notifications {
  id: number = 0;
  provider_id: number = 0;
  user_id: number = 0;
  message: string = "";
  recipient: string = "";
  url_param: string = "";
  status: string = "";
  ts: string = "";
  constructor(
    id: number,
    provider_id: number,
    user_id: number,
    message: string,
    recipient: string,
    url_param: string,
    status: string,
    ts: string
  ) {
    this.id = id;
      (this.provider_id = provider_id),
      (this.user_id = user_id),
      (this.message = message),
      (this.recipient = recipient),
      (this.url_param = url_param),
      (this.status = status),
      (this.ts = ts);
  }
}
