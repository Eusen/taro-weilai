export interface ParkBuildingPivotData {
  park_area_id: number;
  building_id: number;
  xaxis: number;
  yaxis: number;
  radius: number;
  fontsize: number;
}

export interface ParkBuildingData {
  id: number;
  estate_id: number;
  number: string;
  is_delete: number;
  pivot: ParkBuildingPivotData;
}

export interface ParkCountdownData {
  id: number;
  isclose: number;
  starttime: string;
}

export interface ParkData {
  id: number;
  park_area_id: number;
  number: string;
  xaxis: string;
  yaxis: string;
  show_status: number;
  ext_status: number;
}


export interface ParkResponseData {
  id: number;
  estate_id: number;
  name: string;
  pic: string;
  pic_width: number;
  pic_height: number;
  mask_width: number;
  mask_height: number;
  user_num: number;
  building: ParkBuildingData[];
  park: ParkData[];
  countdown: ParkCountdownData;
}

export function getParkData(): Promise<ParkResponseData> {
  return Promise.resolve(require('./data/park-data.json'));
}
