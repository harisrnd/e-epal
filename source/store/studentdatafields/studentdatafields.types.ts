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
  graduation_year: number;
  lastschool_schoolname: any;
  lastschool_schoolyear: string;
  lastschool_class: string;
  relationtostudent: string;
  currentclass: string;
  points: number;
  telnum: string;
}

export type IStudentDataFields = List<IStudentDataField>;
