export type Role = 'admin' | 'client'

export interface UserName {
  firstname: string
  lastname: string
}

export interface UserAddressGeo {
  lat: string
  long: string
}

export interface UserAddress {
  city: string
  street: string
  number: number
  zipcode: string
  geolocation: UserAddressGeo
}

export interface User {
  id: number
  email: string
  username: string
  password: string
  name: UserName
  address: UserAddress
  phone: string
  role: Role
}

export type UserDraft = Omit<User, 'id'>
export type AuthUser = Omit<User, 'password'>
