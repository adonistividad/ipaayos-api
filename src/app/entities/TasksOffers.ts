 
export default class TasksOffers {
  id: number = 0;
  task_id: number = 0;
  provider_id: number = 0;
  category: string = "";
  currency: string = "";
  estimated_cost: number = 0;
  estimated_time: number = 0;
  remarks: string = "";
  documents: string = "";
  images: string = "";
  offer_datetime: string = "";
  offer_status: string = "";
  status: string = "";
  ts: string = "";

  constructor(
    id: number,
    task_id: number,
    provider_id: number,
    category: string,
    currency: string,
    estimated_cost: number,
    estimated_time: number,
    remarks: string,
    documents: string,
    images: string,
    offer_datetime: string,
    offer_status: string,
    status: string,
    ts: string
  ) {
    this.id = id;
    this.task_id = task_id;
    this.provider_id = provider_id;
    this.category = category;
    this.currency = currency;
    this.estimated_cost = estimated_cost;
    this.estimated_time = estimated_time;
    this.remarks = remarks;
    this.documents = documents;
    this.images = images;
    this.offer_datetime = offer_datetime;
    this.offer_status = offer_status;
    this.status = status;
    this.ts = ts;
  }
}
