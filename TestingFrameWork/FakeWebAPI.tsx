import { IInputs } from './generated/ManifestTypes';
import {TestData, ITestDataProps, FetchJSON} from "./TestData"
import {createRecord, retrieveMultiple, updateRecord, deleteRecord, retrieveRecord} from "./TestFramework";

export class FakeWebAPI{
    private context: ComponentFramework.Context<IInputs>;
    private testData: TestData<ITestDataProps>;
    readonly istestenv: boolean = false;

    constructor(context: ComponentFramework.Context<IInputs>, testData: TestData<ITestDataProps>){
        this.context = context;
        this.testData = testData;
        if (this.context.userSettings.userId === "{00000000-0000-0000-0000-000000000000}"){
            this.istestenv = true;
        }
    }

    ReturnEnvironment(): string{
        if (this.istestenv){
            return "Test Environment"
        }
        return "Live Environment";
    }

    async CreateRecord(entitytype: string, data: any): Promise<any>{
        let results: any;
        const tgcr = (d: any): d is TestData<ITestDataProps> => {return true}
        let datatype: boolean = tgcr(data);
        if (this.istestenv && datatype){
            results = await createRecord(this.testData, entitytype, data);
            return results;
        }
        else {
            results = await this.context.webAPI.createRecord(entitytype, data);
            return results;
        }
    }

    async RetrieveMultiple(entitytype: string, options: any, maxpagesize: number): Promise<any>{
        let results: any;
        const tgrm = (d: any): d is FetchJSON => {return true}
        let optionstype: boolean = tgrm(options)
        if (this.istestenv && optionstype){
            results = await retrieveMultiple(this.testData, options);
            return results;
        }
        else {
            results = await this.context.webAPI.retrieveMultipleRecords(entitytype, options, maxpagesize);
            return results;
        }
    }

    async DeleteRecord(guid: string, entitytype: string): Promise<any>{
        let results: any;
        if (this.istestenv){
            results = await deleteRecord(this.testData, entitytype, guid);
            return results;
        }
        else {
            results = await this.context.webAPI.deleteRecord(entitytype, guid);
            return results;
        }
    }

    async RetrieveRecord(guid: string, entitytype: string, options: string): Promise<any>{
        let results: any;
        if (this.istestenv){
            results = await retrieveRecord(this.testData, entitytype, guid);
            return results;
        }
        else {
            results = await this.context.webAPI.retrieveRecord(entitytype, guid, options);
            return results
        }
    }

    async UpdateRecord(guid: string, entitytype: string, data: any): Promise<any>{
        let results: any;
        if (this.istestenv){
           results = await updateRecord(this.testData, entitytype, guid, data)
           return results; 
        }
        else {
            results = await this.context.webAPI.updateRecord(entitytype, guid, data);
            return results;
        }
    }

    async XMLRequest(query: string, rtype: string): Promise<any>{
        let results: any;
        if (this.istestenv){

        }
        else {
            results = await this.RealXML(query, rtype)
        }
    }

    async RealXML(query: string, rtype: string): Promise<any>{
        var req = new XMLHttpRequest()
        var baseurl: string = Xrm.Utility.getGlobalContext().getClientUrl();
        return new Promise(function (resolve, reject) {
            req.open(rtype, baseurl + query, true);
            req.onreadystatechange = function () {
                if (req.readyState !== 4) return;
                if (req.status >= 200 && req.status < 300){
                    try{
                        var result = JSON.parse(req.responseText);
                        if (req.status < 0 ) {
                            reject({
                                status: "rejected",
                                statusText: result.StatusMessage 
                            });
                        }
                        resolve(result);
                    }
                    catch (error) {
                        throw error;
                    }
                }
                else {
                    reject({
                        status: "didnt work",
                        statusText: result.StatusMessage
                    })
                }
            }
            req.setRequestHeader("OData-MaxVersion", "4.0");
			req.setRequestHeader("OData-Version", "4.0");
			req.setRequestHeader("Accept", "application/json");
			req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			req.send();
        })
    }
}