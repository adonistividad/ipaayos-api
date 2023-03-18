export default class Providers {
  id: number = 0;
  user_name: string = "";
  email: string = "";
  password: string = "";
  name: string = "";
  mobile_number: string = "";
  datestarted: string = "";
  address: string = "";
  location: string = "";
  latitude: number = 0;
  longitude: number = 0;
  nationality: string = "";
  country: string = "";
  state: string = "";
  city: string = "";
  region: string = "";
  municipality: string = "";
  neighbourhood: string = "";
  road: string = "";
  postcode: string = "";
  categories: string = "";
  ip_address: string = "";
  about: string = "";
  transport: string = "";
  email_status: string = "";
  status: string = "";
  rating: number = 0;
  reviews: number = 0;
  photo: string = "";
  profile_images: string = "";
  price_per_hour: number = 0;
  social_login: string = "";
  ts: string = "";

  constructor(
    id: number,
    user_name: string,
    email: string,
    password: string,
    name: string,
    mobile_number: string,
    datestarted: string,
    address: string,
    location: string,
    latitude: number,
    longitude: number,
    nationality: string,
    country: string,
    state: string,
    city: string,
    region: string,
    municipality: string,
    neighbourhood: string,
    road: string,
    postcode: string,
    categories: string,
    ip_address: string,
    about: string,
    transport: string,
    email_status: string,
    status: string,
    rating: number,
    reviews: number,
    photo: string,
    profile_images: string,
    price_per_hour: number,
    social_login: string,
    ts: string
  ) {
    this.id = id;
    this.user_name = user_name;
    this.email = email;
    this.password = password;
    this.name = name;
    this.mobile_number = mobile_number;
    this.datestarted = datestarted;
    this.address = address;
    this.location = location;
    this.latitude = latitude;
    this.longitude = longitude;
    this.nationality = nationality;
    this.country = country;
    this.state = state;
    this.city = city;
    this.region = region;
    this.municipality = municipality;
    this.neighbourhood = neighbourhood;
    this.road = road;
    this.postcode = postcode;
    this.categories = categories;
    this.ip_address = ip_address;
    this.about = about;
    this.transport = transport;
    this.email_status = email_status;
    this.status = status;
    this.rating = rating;
    this.reviews = reviews;
    this.photo = photo;
    this.profile_images = profile_images;
    this.price_per_hour = price_per_hour;
    this.social_login = social_login;
    this.ts = ts;
  }
}
