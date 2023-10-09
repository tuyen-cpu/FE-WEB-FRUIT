export enum EStatusShipping {
  CANCELED = 'CANCELED',
  UNVERIFIED = 'UNVERIFIED',
  VERIFIED = 'VERIFIED',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELING = 'CANCELING',
}
export enum Status {
  INACTIVE,
  ACTIVE,
}
export interface ShippingStatus{
  id:number
  name:EStatusShipping
}
