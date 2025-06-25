export interface ICsvUser {
  name: string;
  phone: string;
  dob: string; // This will be a string from CSV that we'll parse to Date
}
