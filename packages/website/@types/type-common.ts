export interface MenuT {
  id: string;
  label: string;
  path: string;
}

export interface AsideItemT {
  id: string;
  icon: any;
  label: string;
  path: string;
  children?: MenuT[];
}

export interface OptionItemT {
  label: string;
  value: string | number;
}

export interface SigItemT {
  email_list: string;
  etherpad: string;
  group_name: string;
  id: string;
}
