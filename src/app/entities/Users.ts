export default class Users {
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
  ip_address: string = "";
  about: string = "";
  email_status: string = "";
  status: string = "";
  rating: number = 0;
  reviews: number = 0;
  photo: string = "";
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
    ip_address: string,
    about: string,
    email_status: string,
    status: string,
    rating: number,
    reviews: number,
    photo: string,
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
    this.longitude = longitude;
    this.latitude = latitude;
    this.nationality = nationality;
    this.country = country;
    this.state = state;
    this.city = city;
    this.region = region;
    this.municipality = municipality;
    this.neighbourhood = neighbourhood;
    this.road = road;
    this.postcode = postcode; 
    this.ip_address = ip_address;
    this.about = about;
    this.email_status = email_status;
    this.status = status;
    this.rating = rating;
    this.reviews = reviews;
    this.photo = photo;
    this.social_login = social_login;
    this.ts = ts;
  }
}
