import { add } from "cheerio/lib/api/traversing";

export default class ProvidersProfile {
  id: number = 0;
  user_id: number = 0;
  name: string = "";
  mobile_number: string = "";
  photo: string = "";
  about: string = "";
  categories: string = "";
  transport: string = "";
  address: string = "";
  address_coord: string = "";
  country: string = "";
  state: string = "";
  city: string = "";
  rating: number = 0;
  reviews: number = 0;
  profile_images: string = "";
  doc_status: string = "";
  status: string = "";
  ts: string = "";
  constructor(
    id: number,
    user_id: number,
    name: string,
    mobile_number: string,
    photo: string,
    about: string,
    categories: string,
    transport: string,
    address: string,
    address_coord: string,
    country: string,
    state: string,
    city: string,
    rating: number,
    reviews: number,
    profile_images: string,
    doc_status: string,
    status: string,
    ts: string,
  ) {
    this.id = id;
    this.user_id = user_id;
    this.name = name;
    this.mobile_number = mobile_number;
    this.photo = photo;
    this.about = about;
    this.categories = categories;
    this.transport = transport;
    this.address = address;
    this.address_coord = address_coord;
    this.country = country;
    this.state = state;
    this.city = city;
    this.rating = rating;
    this.reviews = reviews;
    this.profile_images = profile_images;
    this.doc_status = doc_status;
    this.status = status;
    this.ts = ts;
  }
}
