import { IStudentDataFields, IStudentDataField } from './studentdatafields.types';

export function deimmutifyStudentDataFields(state: IStudentDataFields): IStudentDataField[] {
    let fetchedStudentDataFields = new Array();
    /*
    state.forEach(studentdataField => {
        fetchedStudentDataFields.push(<IStudentDataField>{studentSurname: studentdataField.studentFirstname,
          studentFirstname: studentdataField.studentSurname, guardianSurname: studentdataField.guardianFirstname,
          guardianFirstname: studentdataField.guardianSurname,
          studentAmka: studentdataField.studentAmka, regionAddress: studentdataField.regionAddress,
          regionTK: studentdataField.regionTK,regionArea: studentdataField.regionArea,
          certificateType: studentdataField.certificateType, relationToStudent: studentdataField.relationToStudent

        });
    */
    state.forEach(studentdataField => {
        fetchedStudentDataFields.push(<IStudentDataField>{epaluser_id:studentdataField.epaluser_id,
          name: studentdataField.name, studentsurname: studentdataField.studentsurname, studentbirthdate: studentdataField.studentbirthdate,
          fatherfirstname: studentdataField.fatherfirstname, fathersurname: studentdataField.fathersurname,
          motherfirstname: studentdataField.motherfirstname, mothersurname: studentdataField.mothersurname,
          studentamka: studentdataField.studentamka, regionaddress: studentdataField.regionaddress,
          regiontk: studentdataField.regiontk,regionarea: studentdataField.regionarea,
          certificatetype: studentdataField.certificatetype, relationtostudent: studentdataField.relationtostudent,
          currentclass: studentdataField.currentclass, points: studentdataField.points
        });
    });
    return fetchedStudentDataFields;
};

/* export function reimmutifyCourseFields(plain): ICourseFields {
  return List<ICourseField>(plain ? plain.map(CourseFieldRecord) : []);
} */