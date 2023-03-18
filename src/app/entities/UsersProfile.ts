 
export default class UsersProfile {
  id: number = 0;
  user_id: number = 0;
  name: string = "";
  mobile_number: string = "";
  photo: string = "";
  gender: string = "";
  birthdate: string = "";
  address: string = "";
  address_coord: string = "";
  nationality: string = "";
  country: string = "";
  state: string = "";
  city: string = "";
  rating: number = 0;
  reviews: number = 0;
  status: string = "";
  ts: string = "";

  constructor(
    id: number,
    user_id: number,
    name: string,
    mobile_number: string,
    photo: string,
    gender: string,
    birthdate: string,
    address: string,
    address_coord: string,
    nationality: string,
    country: string,
    state: string,
    city: string,
    rating: number,
    reviews: number,
    status: string,
    ts: string

  ) {
    this.id = id;
    this.user_id = user_id;
    this.name = name;
    this.mobile_number = mobile_number;
    this.photo = photo;
    this.gender = gender;
    this.birthdate = birthdate;
    this.address = address;
    this.address_coord = address_coord;
    this.nationality = nationality;
    this.country = country;
    this.state = state;
    this.city = city;
    this.rating = rating;
    this.reviews = reviews;
    this.status = status;
    this.ts = ts;
  }
}
