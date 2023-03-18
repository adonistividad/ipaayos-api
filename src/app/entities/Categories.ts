export default class Categories {
  id: number = 0;
  name: string = "";
  icon: string = "";
  class_name: string = "";
  width: number = 0;
  status: string = "";
  ts: string = "";
  constructor(
    id: number,
    name: string,
    icon: string,
    class_name: string,
    width: number,
    status: string,
    ts: string
  ) {
    this.id = id;
    (this.name = name),
      (this.icon = icon),
      (this.class_name = class_name),
      (this.width = width),
      (this.status = status),
      (this.ts = ts);
  }
}
