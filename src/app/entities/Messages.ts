export default class Messages {
  id: number = 0;
  task_id: number = 0;
  provider_id: number = 0;
  user_id: number = 0;
  message: string = "";
  message_type: string = "";
  size: number = 0;
  sender: string = "";
  status: string = "";
  ts: string = "";
  constructor(
    id: number,
    task_id: number,
    provider_id: number,
    user_id: number,
    message: string,
    message_type: string,
    size: number,
    sender: string,
    status: string,
    ts: string
  ) {
    this.id = id;
    (this.task_id = task_id),
      (this.provider_id = provider_id),
      (this.user_id = user_id),
      (this.message = message),
      (this.message_type = message_type),
      (this.size = size),
      (this.sender = sender),
      (this.status = status),
      (this.ts = ts);
  }
}
