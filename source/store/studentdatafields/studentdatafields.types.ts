import { List } from 'immutable';

/*
export interface IStudentDataField {
  studentFirstname: string;
  studentSurname: string;
  guardianFirstname: string;
  guardianSurname: string;
  studentAmka: string;
  regionAddress: string;
  regionTK: string;
  regionArea: string;
  certificateType: string;
  relationToStudent: string;
}
*/
export interface IStudentDataField {
  epaluser_id: number;
  name: string;
  studentsurname: string;
  fatherfirstname:string;
  fathersurname:string;
  motherfirstname:string;
  mothersurname:string;
  studentbirthdate: Date;
  studentamka: string;
  regionaddress: string;
  regiontk: string;
  regionarea: string;
  certificatetype: string;
  relationtostudent: string;
  currentclass: string;
  points: number;
}

export type IStudentDataFields = List<IStudentDataField>;