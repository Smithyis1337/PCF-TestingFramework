import { IInputs } from './generated/ManifestTypes';
import {TestData, ITestDataProps, FetchJSON} from "./TestData"
import {createRecord, retrieveMultiple, updateRecord, deleteRecord} from "./TestFramework";

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
}