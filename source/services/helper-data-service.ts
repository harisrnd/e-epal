import "rxjs/add/operator/map";

import { NgRedux } from "@angular-redux/store";
import { Injectable, OnDestroy, OnInit } from "@angular/core";
import { Headers, Http, RequestOptions, ResponseContentType } from "@angular/http";
import { CookieService } from "ngx-cookie";
import { BehaviorSubject, Subscription } from "rxjs/Rx";

import { AppSettings } from "../app.settings";
import { DIDE_ROLE, MINISTRY_ROLE, PDE_ROLE, SCHOOL_ROLE } from "../constants";
import { LOGININFO_INITIAL_STATE } from "../store/logininfo/logininfo.initial-state";
import { ILoginInfoRecords } from "../store/logininfo/logininfo.types";
import { IRRegionSchool } from "../store/regionschools/regionschools.types";
import { ISectorCourse } from "../store/sectorcourses/sectorcourses.types";
import { ISectorField } from "../store/sectorfields/sectorfields.types";
import { IAppState } from "../store/store";

import * as FileSaver from "file-saver";

const HEADER = { headers: new Headers({ "Content-Type": "application/json" }) };

@Injectable()
export class HelperDataService implements OnInit, OnDestroy {

    private authToken: string;
    private loginInfoSub: Subscription;
    private authRole: string;
    private minedu_userName: string;
    private minedu_userPassword: string;
    private loginInfo$: BehaviorSubject<ILoginInfoRecords>;

    constructor(
        private http: Http,
        private _ngRedux: NgRedux<IAppState>,
        private _cookieService: CookieService) {
        this.loginInfo$ = new BehaviorSubject(LOGININFO_INITIAL_STATE);
    };

    ngOnInit() {
        this.loginInfoSub = this._ngRedux.select("loginInfo")
            .map(loginInfo => <ILoginInfoRecords>loginInfo)
            .subscribe(loginInfo => {
                if (loginInfo.size > 0) {
                    loginInfo.reduce(({ }, loginInfoObj) => {
                        this.authToken = loginInfoObj.get("auth_token");
                        this.authRole = loginInfoObj.get("auth_role");
                        return loginInfoObj;
                    }, {});
                }
                this.loginInfo$.next(loginInfo);
            });

    }

    ngOnDestroy() {
        if (this.loginInfoSub)
            this.loginInfoSub.unsubscribe();
    }

    createAuthorizationHeader(headers: Headers) {
        headers.append("Authorization", "Basic " + btoa(this.authToken + ":" + this.authToken));
    }

    createMinistryAuthorizationHeader(headers: Headers, username: string, passwd: string) {
        headers.append("Authorization", "Basic " + btoa(username + ":" + passwd));
    }

    getEpalUserData() {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/userdata`, options)
            .map(response => response.json());
    };

    sendVerificationCode(email) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
            //            "Accept": "*/*",
            //            "Access-Control-Allow-Credentials": "true",
        });
        this.createAuthorizationHeader(headers);
        //        let options = new RequestOptions({ headers: headers, withCredentials: true });
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/user/sendvercode`, { userEmail: email }, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(data);
                },
                error => {
                    console.log("Error Sending Verification Code");
                    reject("Error Sending Verification Code");
                });
        });
    }

    verifyVerificationCode(verificationCode) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        //        let options = new RequestOptions({ headers: headers, withCredentials: true });
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/user/verifyvercode`, { verificationCode: verificationCode }, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(<any>data);
                },
                error => {
                    console.log("Error Verifying Verification Code");
                    reject("Error Verifying Verification Code");
                });
        });
    }

    saveProfile(userProfile) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/user/save`, { userProfile: userProfile }, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(data);
                },
                error => {
                    console.log("Error Saving Profile");
                    reject("Error Saving Profile");
                });
        });
    }

    deleteApplication(appId) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        //        let options = new RequestOptions({ headers: headers, withCredentials: true });
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/application/delete`, { applicationId: appId }, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(<any>data);
                },
                error => {
                    console.log("Error Removing Application");
                    reject("Error Removing Application");
                });
        });
    }

    getSectorFields() {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.get(`${AppSettings.API_ENDPOINT}/sectorfields/list`, options)
                .map(response => <ISectorField[]>response.json())
                .subscribe(data => {
                    resolve(data);
                },
                error => {
                    console.log("Error HTTP GET Service");
                    reject("Error HTTP GET Service");
                });
        });
    };

    getRegionsWithSchools(classActive, courseActive) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            let getConnectionString = null;

            if (classActive === 1)
                getConnectionString = `${AppSettings.API_ENDPOINT}/regions/list`;
            else if (classActive === 2)
                getConnectionString = `${AppSettings.API_ENDPOINT}/sectorsperschool/list?sector_id=${courseActive}`;
            else if (classActive === 3)
                getConnectionString = `${AppSettings.API_ENDPOINT}/coursesperschool/list?course_id=${courseActive}`;
            else if (classActive === 4)
                getConnectionString = `${AppSettings.API_ENDPOINT}/coursesperschool_night/list?course_id=${courseActive}`;

            this.http.get(getConnectionString, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(this.transformRegionSchoolsSchema(data));
                },
                error => {
                    console.log("Error HTTP GET Service in getRegionsWithSchools method");
                    reject("Error HTTP GET Service");
                });
        });
    };

    getSectorsWithCourses() {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.get(`${AppSettings.API_ENDPOINT}/coursesectorfields/list`, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(this.transformSectorCoursesSchema(data));
                },
                error => {
                    console.log("Error HTTP GET Service");
                    reject("Error HTTP GET Service");
                });
        });
    };

    transformRegionSchoolsSchema(regionSchools: any) {
        let rsa = Array<any>();
        let trackRegionId: string;
        let trackIndex: number;

        trackRegionId = "";
        trackIndex = -1;

        let j = 0;
        regionSchools.forEach(regionSchool => {
            if (trackRegionId !== regionSchool.region_id) {
                trackIndex++;
                rsa.push(<any>{ "region_id": regionSchool.region_id, "region_name": regionSchool.region_name, "epals": Array<any>() });
                trackRegionId = regionSchool.region_id;
            }
            rsa[trackIndex].epals.push(<IRRegionSchool>{ "epal_id": regionSchool.epal_id, "epal_name": regionSchool.epal_name, "epal_special_case": regionSchool.epal_special_case, "globalIndex": j, "selected": false, "order_id": 0 });
            j++;
        });
        return rsa;
    }

    transformSectorCoursesSchema(sectorCourses: any) {
        let rsa = Array<any>();
        let trackSectorId: string;
        let trackIndex: number;

        trackSectorId = "";
        trackIndex = -1;

        let j = 0;
        sectorCourses.forEach(sectorCourse => {
            if (trackSectorId !== sectorCourse.sector_id) {
                trackIndex++;
                rsa.push(<any>{ "sector_id": sectorCourse.sector_id, "sector_name": sectorCourse.sector_name, "sector_selected": false, "courses": Array<any>() });
                trackSectorId = sectorCourse.sector_id;
            }
            rsa[trackIndex].courses.push(<ISectorCourse>{ "course_id": sectorCourse.course_id, "course_name": sectorCourse.course_name, "globalIndex": j, "selected": false });
            j++;
        });
        return rsa;
    }

    getCurrentUser(oauthtoken, oauthrole) {

        this.authToken = oauthtoken;
        this.authRole = oauthrole;

        let headers = new Headers({
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": "true",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.get(`${AppSettings.API_ENDPOINT}/epal/curuser`, options)
                .map(response => response.json())
                .subscribe(data => {
                    window.onbeforeunload = function(e) {
                        let confirmationMessage = "\o/";
                        e.returnValue = confirmationMessage;
                        return confirmationMessage;
                    };
                    resolve(this.transformUserSchema(data, oauthtoken, oauthrole));
                },
                error => {
                    console.log("Error HTTP GET Service");
                    reject("Error HTTP GET Service");
                });
        });
    }

    setMineduCurrentUser(minedu_username, minedu_pwd, role) {
        this.minedu_userName = minedu_username;
        this.minedu_userPassword = minedu_pwd;
        this.authRole = role;
    }


    transformUserSchema(userlogin: any, oauthtoken: string, oauthrole: string) {
        let rsa = Array<any>();

        rsa.push(<any>{
            "auth_token": oauthtoken,
            "auth_role": oauthrole,
            "cu_name": userlogin.cu_name,
            "cu_surname": userlogin.cu_surname,
            "cu_fathername": userlogin.cu_fathername,
            "cu_mothername": userlogin.cu_mothername,
            "cu_email": userlogin.cu_email,
            "minedu_username": userlogin.minedu_username,
            "minedu_userpassword": userlogin.minedu_userpassword,
            "lock_capacity": parseInt(userlogin.lock_capacity),
            "lock_students": parseInt(userlogin.lock_students),
            "lock_application": parseInt(userlogin.lock_application),
            "disclaimer_checked": parseInt(userlogin.disclaimer_checked)
        });
        return rsa;

    }

    signOut() {
        // loginInfo$ take values only in case getCurrentUser (epal module) has been used ...WHY? TO BE CHECKED..
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        let options = new RequestOptions({ headers: headers, withCredentials: true });
        let logoutRoute = "/oauth/logout";
        if (this.authRole === MINISTRY_ROLE) {
            this.createMinistryAuthorizationHeader(headers, this.minedu_userName, this.minedu_userPassword);
        } else {
            this.createAuthorizationHeader(headers);
        }
        if (this.authRole === SCHOOL_ROLE || this.authRole === PDE_ROLE || this.authRole === DIDE_ROLE) {
            logoutRoute = "/cas/logout";
        } else if (this.authRole === MINISTRY_ROLE) {
            logoutRoute = "/ministry/logout";
        }

        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}${logoutRoute}${AppSettings.API_ENDPOINT_PARAMS}`, {}, options)
                .map(response => response.json())
                .subscribe(data => {
                    this._cookieService.removeAll();
                    window.onbeforeunload = function() { console.log("unloading"); };
                    resolve(data);
                },
                error => {
                    console.log("Error Logout");
                    reject("Error Logout");
                });
        });
    }

    casSignOut() {
        let headers = new Headers({
            "Content-Type": "application/json"
        });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/cas/logoutcas${AppSettings.API_ENDPOINT_PARAMS}`, {}, { headers: headers })
                .map(response => response.json())
                .subscribe(data => {
                    this._cookieService.removeAll();
                    window.onbeforeunload = function() { console.log("unloading"); };
                    resolve(data);
                },
                error => {
                    console.log("Error Logout");
                    reject("Error Logout");
                });
        });
    }

    getSubmittedPreviw() {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/subapplic`, options)
            .map(response => response.json());
    }


    getStudentDetails(headerid) {
        let headerIdNew = headerid.toString();
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/application/` + headerIdNew, options)
            .map(response => response.json());
    }


    getEpalchosen(headerid) {
        let headerIdNew = headerid.toString();
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/epalchosen/` + headerIdNew, options)
            .map(response => response.json());
    }



    getStudentPerSchool(classId, sector, specialit) {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });

        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/studentperschool/` + classId + "/" + sector + "/" + specialit, options)
            .map(response => response.json());
    }



    saveConfirmStudents(students, type) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(`${AppSettings.API_ENDPOINT}/epal/confirmstudent`, { students, type }, options)
            .map(response => response.json());


    }



    saveCapacity(taxi, tomeas, specialit, capacity) {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.post(`${AppSettings.API_ENDPOINT}/epal/savecapacity/` + taxi + "/" + tomeas + "/" + specialit, { capacity }, options)
            .map(response => response.json());

    }

    sendMinisrtyCredentials(username, userpassword) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/ministry/login`, { username: username, userpassword: userpassword }, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(data);
                },
                error => {
                    reject("Error Sending Ministry Credentials");
                });
        });

    }

    makeDistribution(username, userpassword) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/distribution`, {}, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(data);
                },
                error => {
                    reject("Error POST in makeDistribution");
                });
        });

    }

    makeDistributionSecondPeriod(username, userpassword) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/distribution-secondperiod`, {}, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(data);
                },
                error => {
                    reject("Error POST in makeDistributionSecondPeriod");
                });
        });

    }


    makeReport(username, userpassword, routepath, regionsel, adminsel, schsel, clsel, secsel, coursel, distribfinal) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        if (routepath === "/ministry/report-users/") {
            return this.http.get(`${AppSettings.API_ENDPOINT}` + routepath, options)
                .map(response => response.json());
        }
        else if (routepath === "/ministry/general-report/") {
            return this.http.get(`${AppSettings.API_ENDPOINT}` + routepath, options)
                .map(response => response.json());
        }
        else if (routepath === "/ministry/report-completeness/") {
            return this.http.get(`${AppSettings.API_ENDPOINT}` + routepath + regionsel + "/" + adminsel + "/" + schsel, options)
                .map(response => response.json());
        }
        else if (routepath === "/ministry/report-all-stat/") {
            return this.http.get(`${AppSettings.API_ENDPOINT}` + routepath + regionsel + "/" + adminsel + "/" + schsel + "/" +
                clsel + "/" + secsel + "/" + coursel + "/" + distribfinal, options)
                .map(response => response.json());
        }
        else if (routepath === "/ministry/report-no-capacity/") {
            let capacityFilter = 0;
            if (regionsel)
                capacityFilter = 1;
            return this.http.get(`${AppSettings.API_ENDPOINT}` + routepath + capacityFilter, options)
                .map(response => response.json());
        }

    }

    informUnlocatedStudents(username, userpassword, unallocated, period) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        let route = "";
        if (unallocated === 1) {
            route = "ministry/send-unallocated-massive-mail/" + period;
        } else if (unallocated === 2) {
            route = "ministry/send-unallocated-sc-massive-mail/" + period;
        } else if (unallocated === 3) {
            route = "ministry/send-located-massive-mail/" + period;
        }

        return this.http.get(`${AppSettings.API_ENDPOINT}/` + route, options)
            .map(response => response.json());
    }


    getSchools() {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/schools-per-perf/`, options)
            .map(response => response.json());
    }

    getCoursePerPerfecture(PerfectureId) {
        let PerfectureIdNew = PerfectureId.toString();

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });

        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/coursespersch/` + PerfectureIdNew, options)
            .map(response => response.json());
    }

    getRegions(username, userpassword) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        // return this.http.get(`${AppSettings.API_ENDPOINT}` + routepath , options)
        //    .map(response => response.json());
        return this.http.get(`${AppSettings.API_ENDPOINT}/regionfields/list`, options)
            .map(response => response.json());

    }

    getAdminAreas(username, userpassword, regionid) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/adminfields/list/?region=` + regionid, options)
            .map(response => response.json());
    }

    getSchoolsPerRegion(username, userpassword, regionid) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/schoolfields_per_region/list/?region=` + regionid, options)
            .map(response => response.json());
    }

    getSchoolsPerAdminArea(username, userpassword, adminid) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/schoolfields_per_admin/list/?adminarea=` + adminid, options)
            .map(response => response.json());
    }


    getUserRegistryNo(username, userpassword) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/ministry/retrieve-registry-id`, options)
            .map(response => response.json());
    }

    retrieveAdminSettings(username, userpassword) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/ministry/retrieve-settings`, options)
            .map(response => response.json());
    }

    storeAdminSettings(username, userpassword, capac, dirview, applogin, appresults, secondperiod) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/ministry/store-settings/` +
            Number(capac) + "/" + Number(dirview) + "/" + Number(applogin) + "/" + Number(appresults) + "/" + Number(secondperiod), options)
            .map(response => response.json());
    }


    getSectors(username, userpassword, classid) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/sectorfields/list`, options)
            .map(response => response.json());
    }

    getCourses(username, userpassword, sectorid) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });

        this.createMinistryAuthorizationHeader(headers, username, userpassword);
        let options = new RequestOptions({ headers: headers });

        return this.http.get(`${AppSettings.API_ENDPOINT}/coursefields/list/?sector_id=` + sectorid, options)
            .map(response => response.json());
    }

    getCritiria(headerid, type) {
        let headerIdNew = headerid.toString();
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/critiriachosen/` + headerIdNew + "/" + type, options)
            .map(response => response.json());
    }

    getSchoolId() {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/getschool/`, options)
            .map(response => response.json());

    }

    FindCapacityPerSchool() {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/findcapacityperschool/`, options)

            .map(response => response.json());

    }

    FindCoursesPerSchool() {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/findcoursesperschool/`, options)

            .map(response => response.json());

    }

    getServiceAllDidacticYears() {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/get-didactic-years`, options)
            .map(response => response.json());
    }

    getServiceStudentPromotion(didactic_year_id, lastname, firstname, father_firstname, mother_firstname, birthdate, registry_no, level_name) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        let rpath = [didactic_year_id, lastname, firstname, father_firstname, mother_firstname, birthdate, registry_no, level_name].join("/");
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/get-student-promotion/` + rpath, options)
            .map(response => response.json());
    }

    getServiceStudentCertification(didactic_year_id, lastname, firstname, father_firstname, mother_firstname, birthdate, registry_no, level_name) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        let rpath = [didactic_year_id, lastname, firstname, father_firstname, mother_firstname, birthdate, registry_no, level_name].join("/");
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/get-student-certification/` + rpath, options)
            .map(response => response.json());
    }

    createPdfServerSide(headerid) {

        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);

        let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
        let headerIdStr = headerid.toString();
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/pdf-application/` + headerIdStr, options)
            .map((res) => {
                return new Blob([res["_body"]], { type: "application/octet-stream" });
            })
            .subscribe(
            data => {
                FileSaver.saveAs(data, "appConfirmation.pdf");
            },
            err => console.error(err));
    }


    sendmail(email, name, surname, message) {
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/user/sendmail`, { userEmail: email, userName: name, userSurname: surname, userMessage: message }, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(data);
                },
                error => {
                    console.log("Error Sending Email");
                    reject("Error Sending email");
                });
        });
    }

    findTotalStudents() {

        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        let options = new RequestOptions({ headers: headers });
        return this.http.get(`${AppSettings.API_ENDPOINT}/epal/totalstudent`, options)

            .map(response => response.json());
    }

    deleteApplicationforDirector(appId) {
        this.loginInfo$.getValue().forEach(loginInfoToken => {
            this.authToken = loginInfoToken.auth_token;
            this.authRole = loginInfoToken.auth_role;
        });
        let headers = new Headers({
            "Content-Type": "application/json",
        });
        this.createAuthorizationHeader(headers);
        //        let options = new RequestOptions({ headers: headers, withCredentials: true });
        let options = new RequestOptions({ headers: headers });
        return new Promise((resolve, reject) => {
            this.http.post(`${AppSettings.API_ENDPOINT}/epal/application/deleteFromDirector`, { applicationId: appId }, options)
                .map(response => response.json())
                .subscribe(data => {
                    resolve(<any>data);
                },
                error => {
                    console.log("Error Removing Application");
                    reject("Error Removing Application");
                });
        });
    }

}
