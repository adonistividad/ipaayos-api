export default class Reviews {
  id: number = 0;
  task_id: number = 0;
  user_id: number = 0;
  provider_id: number = 0;
  rating: number = 0;
  remarks: string = "";
  status: string = "";
  ts: string = "";
  constructor(
    id: number,
    task_id: number,
    user_id: number,
    provider_id: number,
    rating: number,
    remarks: string,
    status: string,
    ts: string
  ) {
    this.id = id;
    this.task_id = task_id;
    this.user_id = user_id;
    this.provider_id = provider_id;
    this.rating = rating;
    this.remarks = remarks;
    this.status = status;
    this.ts = ts;
  }
}
