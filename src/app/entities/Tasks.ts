 
export default class Tasks {
  id: number = 0;
  user_id: number = 0;
  task_offer_id: number = 0;
  category: string = "";
  images: string = "";
  task_datetime: string = "";
  location: string = "";
  location_coord: string = "";
  remarks: string = "";
  offers: number = 0;
  shortlisted: number = 0;
  declined: number = 0;
  rating: number = 0;
  review_text: string = "";
  status: string = "";
  ts: string = "";

  constructor(
    id: number,
    user_id: number,
    task_offer_id: number,
    category: string,
    images: string,
    task_datetime: string,
    location: string,
    location_coord: string,
    remarks: string,
    offers: number,
    shortlisted: number,
    declined: number,
    rating: number,
    review_text: string,
    status: string,
    ts: string
  ) {
    this.id = id;
    this.user_id = user_id;
    this.task_offer_id = task_offer_id;
    this.category = category;
    this.images = images;
    this.task_datetime = task_datetime;
    this.location = location;
    this.location_coord = location_coord;
    this.remarks = remarks;
    this.offers = offers;
    this.shortlisted = shortlisted;
    this.declined = declined;
    this.rating = rating;
    this.review_text = review_text;
    this.status = status;
    this.ts = ts;
  }
}
