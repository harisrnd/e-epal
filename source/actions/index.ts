import { CourseFieldsActions } from './coursefields.actions';
import { SectorFieldsActions } from './sectorfields.actions';
import { RegionSchoolsActions } from './regionschools.actions';
import { SectorCoursesActions } from './sectorcourses.actions';
import { StudentDataFieldsActions } from './studentdatafields.actions';
import { EpalClassesActions } from './epalclass.actions';
const ACTION_PROVIDERS = [ CourseFieldsActions, SectorFieldsActions, RegionSchoolsActions, SectorCoursesActions, StudentDataFieldsActions, EpalClassesActions ];

export {
  CourseFieldsActions,
  SectorFieldsActions,
  RegionSchoolsActions,
  SectorCoursesActions,
  StudentDataFieldsActions,
  EpalClassesActions,
  ACTION_PROVIDERS,
};
