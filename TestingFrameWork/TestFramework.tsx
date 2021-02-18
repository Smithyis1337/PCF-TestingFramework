import * as React from 'react';
import { IInputs } from './generated/ManifestTypes';
import {TestData, ITestDataProps, FetchJson, FetchJSON, recordset, testData} from "./TestData"
import {FetchResults} from "./FetchAlgorithm"

let context: ComponentFramework.Context<IInputs>;

export class TestDiv extends React.Component <ITestDivProps> {
    static defaultProps = {
        environment: "live",
        data: {
            recordtypes: ['contact','account'],
            relationshipsenabled: true,
            relationships: [
                {
                    entityone: "contact",
                    entitytwo: "account",
                    field: "acc_relationship"
                }],
            data: {dataset: [
                {
                    columns: ['contact','contactid','firstname','lastname','acc_relationship'],
                    records: [['075e76a5-4d24-44ab-80b3-d4c788b375bf','Matt','Smith','02fbf207-9e8e-4cde-bb23-9a0edec55543'],['79e16aff-a864-483f-b573-be9081f50c4d','Joe','Bloggs','1c9c6f0a-1767-4d43-8e88-419527c4717b']]
                },
                {
                    columns: ['account','accountid','name','address1'],
                    records: [['02fbf207-9e8e-4cde-bb23-9a0edec55543','SuperSoftware','10 Open Source Road'],['1c9c6f0a-1767-4d43-8e88-419527c4717b','Hardly Hackers','1 Sneak Street']]
                }
            ]}
        }
    }
    
    constructor(props: any){
        super(props);   
    }

    render() {
        let currData: TestData<ITestDataProps> = this.props.data;
        let recordtypescount = currData.recordtypes.length;
        let recordtypes: string;
        let relationshiptext: JSX.Element;

        if (currData.relationshipsenabled === true){
            relationshiptext = <div>
                                    Relationships are enabled.{this.props.data.relationships.length} relationship(s) found.
                                </div>
        }
        else {
            relationshiptext = <div>
                                    Relationships are disabled
                                </div>
        }

        recordtypes = readData(currData)
        return <div>
                    Hello {this.props.environment}.
                    <div>
                        There are {recordtypescount} types of records in the mock data ({recordtypes}).
                    </div>
                    <div>
                        {relationshiptext}
                    </div>
                    <div>
                        <button onClick={() => createRecord(this.props.data, "contact", ['95fe5ef5-1bf5-49e0-9745-ca9c02fac52f','New','Record','02fbf207-9e8e-4cde-bb23-9a0edec55543'])}>
                            Create Record
                        </button>
                        <button onClick={() => deleteRecord(this.props.data, "contact", "075e76a5-4d24-44ab-80b3-d4c788b375bf")}>
                            DeleteRecord
                        </button>
                        <button onClick={() => retrieveRecord(currData, "account", "02fbf207-9e8e-4cde-bb23-9a0edec55543")}>
                            Retrieve Record
                        </button>
                    </div>
                </div>
                
    }
}

interface ITestDivProps {
    environment: string;
    data: TestData<ITestDataProps>;
}

//Read the test data for debugging purposes
function readData(TestData: TestData<ITestDataProps>){
    let recordtypesRD: string;
    recordtypesRD = "";
    let test = TestData;

    for (var i = 0; i < TestData.recordtypes.length; i++ ) {
        if (i == 0){
            recordtypesRD = TestData.recordtypes[i];
        }
        else{
            recordtypesRD = recordtypesRD + ", " + TestData.recordtypes[i]
        }
    }



    return recordtypesRD;
}

export function createRecord(TestData: TestData<ITestDataProps>, entitytype: string, recorddata: string[]){

    console.log("Running createRecord");
    let recordtypeexists: boolean;
    recordtypeexists = false;
    let recordtypei: number;
    recordtypei = 0;

    //check if the record is defined in TestData
    for (var i = 0; i < TestData.recordtypes.length; i++) {
        let rtype = TestData.recordtypes[i];
        if (rtype == entitytype){
            recordtypeexists = true;
            recordtypei = i;
        }
    }

    //Validation steps:
    if (recordtypeexists == false){
        console.log("ERROR: record type does not exist in test data")
        return;
    }

    //-1 ignores the record type identifier column
    if (TestData.data.dataset[recordtypei].columns.length - 1 !== recorddata.length)
    {
        console.log("Error: Incorrect Data format. Data does not match the entities defined columnset")
        return;
    }

    console.log("Valid Data detected. Processing....");

    TestData.data.dataset[recordtypei].records.push(recorddata);
    console.log(TestData.data.dataset[recordtypei].records)
}

export function deleteRecord(TestData: TestData<ITestDataProps>, entitytype: string, recordid: string){
    console.log("Running deleteRecord")
    let recordtypeexists: boolean = false;
    let recordtypei: number = 0;
    let recordnumberi: number = 0;

     //check if the record is defined in TestData
     for (var i = 0; i < TestData.recordtypes.length; i++) {
        let rtype = TestData.recordtypes[i];
        if (rtype == entitytype){
            recordtypeexists = true;
            recordtypei = i;
        }
    }

        //Validation steps:
    if (recordtypeexists == false){
        console.log("ERROR: record type does not exist in test data")
        return;
    }
    else if (recordid.length !== 36){
        console.log("Invalid Guid format")
        return;
    }

    //find record number
    for (var i = 0; i < TestData.data.dataset[recordtypei].records.length -1; i++){
        let record = TestData.data.dataset[recordtypei].records[i];
        if (record[0] == recordid){
            recordnumberi = i;
            console.log("Record with matching ID and Entity found");
        }
    }

    //delete record
    TestData.data.dataset[recordtypei].records.splice(recordnumberi, 1);
    console.log("Record of id:" + recordid + " has been deleted");
}

export function retrieveMultiple(TestData: TestData<ITestDataProps>, query: FetchJSON): string[][]{
    let validated: boolean = ValidateFetch(testData, query);
    let results: string[][] = new Array<string[]>();

    if (validated){
        let getresults = new FetchResults();
        results = getresults.GatherResults(testData, query);
    }
    else {
        console.log("Fetch Validation Errors");
    }

    return results;
}

export function retrieveRecord(TestData: TestData<ITestDataProps>, entity: string, guid: string){
    console.log("Running retrieve record")
    let recordtypeexists: boolean = false;
    let recordtypei: number = 0;
    let recordf: string[] = ["No record found"];

     //check if the record is defined in TestData
     for (var i = 0; i < TestData.recordtypes.length; i++) {
        let rtype = TestData.recordtypes[i];
        if (rtype == entity){
            recordtypeexists = true;
            recordtypei = i;
        }
    }

        //Validation steps:
    if (recordtypeexists == false){
        console.log("ERROR: record type does not exist in test data")
        return;
    }
    else if (guid.length !== 36){
        console.log("Invalid Guid format")
        return;
    }

    //find record number
    for (var i = 0; i < TestData.data.dataset[recordtypei].records.length -1; i++){
        let record = TestData.data.dataset[recordtypei].records[i];
        if (record[0] == guid){
            recordf = TestData.data.dataset[recordtypei].records[i];
            console.log("Record with matching ID and Entity found");
        }
    }
    console.log(recordf);
    return recordf;
}

export function updateRecord(TestData: TestData<ITestDataProps>, entity: string, guid: string, record: recordset){
    console.log("Running update record")
    let recordtypeexists: boolean = false;
    let recordtypei: number = 0;
    let recordnumberi: number = 0;
    let colnumbers: number[] = new Array<number>();

     //check if the record is defined in TestData
     for (var i = 0; i < TestData.recordtypes.length; i++) {
        let rtype = TestData.recordtypes[i];
        if (rtype == entity){
            recordtypeexists = true;
            recordtypei = i;
        }
    }

        //Validation steps:
    if (recordtypeexists == false){
        console.log("ERROR: record type does not exist in test data")
        return;
    }
    else if (guid.length !== 36){
        console.log("Invalid Guid format")
        return;
    }

    //find record number
    for (var i = 0; i < TestData.data.dataset[recordtypei].records.length -1; i++){
        let record = TestData.data.dataset[recordtypei].records[i];
        if (record[0] == guid){
            recordnumberi = i;
            console.log("Record with matching ID and Entity found");
        }
    }

    //Convert columns to array values
    for (var i = 0; i < record.columns.length; i++)
    {
        let col: string = record.columns[i];
        for (var ii = 0; ii < TestData.data.dataset[recordtypei].columns.length; ii++){
            let cn: number = 0;
            if (col === TestData.data.dataset[recordtypei].columns[ii]){
                cn = ii -1;
                colnumbers.push(cn)
            }
        }
    }

    for (var i = 0; i < colnumbers.length; i++){
        var field: string[] = TestData.data.dataset[recordtypei].records[recordnumberi];
        var col: number = colnumbers[i];
        var rvals: string[] = record.records[0];
        field[col] = rvals[i]; 
    }
    console.log("Record updated:");
    console.log(TestData.data.dataset[recordtypei].records[recordnumberi]);
    
}

function ValidateFetch(TestData: TestData<ITestDataProps>, query: FetchJSON):boolean{

    let entitytype: string = query.entity['@name']
    let entitytypei: number = 0;
    let matchedentity: boolean = false;
    let conditions: number = query.entity.filter.condition.length;
    let columncheck: Array<boolean[]> = new Array<boolean[]>(conditions);
    let columnchecktwo : Array<boolean> = new Array<boolean>(conditions);
    let columncheckfinal: boolean = true;

    //Check for entity type
    for (var i = 0; i < TestData.recordtypes.length; i++)
    {
        let rtype = TestData.recordtypes[i];
        if (rtype == entitytype){
            matchedentity = true;
            entitytypei = i;
        }
    }

    if (matchedentity === false){
        return false;
    }

    //Check fields exist
    for (var i = 0; i < query.entity.filter.condition.length; i++){
        let attr = query.entity.filter.condition[i]['@attribute'];
        let check: boolean[] = new Array<boolean>();
        for (var ii = 0; ii < TestData.data.dataset.length; ii++){
            for (var iii = 0; iii < TestData.data.dataset[ii].columns.length; iii++){
                let field = TestData.data.dataset[ii].columns[iii]
                if (attr == field) {
                    check.push(true);
                }
                else {
                    check.push(false);
                }
            }
        }
        columncheck[i] = check;
    }

    for (var i = 0; i < columncheck.length; i++){
        let fieldcheck: boolean = false;
        for (var ii = 0; ii < columncheck[i].length; ii++){
            var c = columncheck[i];
            if (c[ii] === true){
                fieldcheck = true;
            }
        };
        columnchecktwo[i] = fieldcheck;
    }

    for (var i = 0; i < columnchecktwo.length; i++){
        if (columnchecktwo[i] === false){
            columncheckfinal = false;
        }
    }

    return columncheckfinal;
}

export function SetContext(cont: ComponentFramework.Context<IInputs>){
    context = cont;
}

export function ReturnContext(){
    console.log(context.parameters.sampleDataSet);
}