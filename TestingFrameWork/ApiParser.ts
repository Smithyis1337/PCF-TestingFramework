import {TestData, ITestDataProps, testData} from "./TestData"

export class APIParser {
    private query: string;
    private rtype: string;
    private request: APIRequestType;
    operations: Array<any> = new Array<any>();

    constructor(query: string, rtype: string){
        this.query = query;
        this.rtype = rtype;
    }

    RunRequest(){
        for (var i = 0; i < requestTypes.length; i++){
            if (this.rtype === requestTypes[i].type){
                this.request = requestTypes[i];
                this.request.GetOperations();
                this.operations = this.request.ValidateOperations(this.query, testData);
                var r: Array<string[]> = this.request.RunOperations(this.query, testData);
                console.log(r);
            }
        }
        console.log(this.operations);
    }
}

abstract class APIRequestType{
    abstract type: string;
    results: Array<string[]>;
    operations: Array<any> = new Array<any>();
    operationsToBeRun: Array<any> = new Array<any>();
    opscheck: Array<boolean> = new Array<boolean>();

    GetOperations(){
        for (var i = 0; i < dataOperations.length; i++){
            let push: boolean = false;
            var op: string[] = dataOperations[i].ReturnRequestTypes();
            console.log(op)
            for (var ii = 0; ii < op.length; ii++){
                if (op[ii] === this.type){
                    console.log("Matching Type")
                    push = true;
                }
            }
            if (push){
                this.operations.push(dataOperations[i]);
                console.log(this.operations);
            }
        }
    }

    ValidateOperations(query: string, testData: TestData<ITestDataProps>): Array<any> {
        let check: boolean = true;
        for (var i = 0; i < this.operations.length; i++){
            var b: boolean = this.operations[i].CheckValidOperation(query);
            this.opscheck.push(b);
        }
        for (var ii = 0; ii < this.opscheck.length; ii++){
            if (this.opscheck[ii] === false){
                check = false;
            }
            else {
                this.operationsToBeRun.push(this.operations[ii]);
            }
        }
        return this.operationsToBeRun;
    }

    abstract RunOperations(query: string, td: TestData<ITestDataProps>): any;

}


class GetRequest extends APIRequestType{
    type: string = "GET";
    RunOperations(query: string, td: TestData<ITestDataProps>) {
        for (var i = 0; i < this.operationsToBeRun.length; i++){
            if (i === 0){
                this.results = this.operationsToBeRun[i].RunOperation(query, td, this.results, true);
            }
            else {
                this.results = this.operationsToBeRun[i].RunOperation(query, td, this.results, false);
            }
        }
        return this.results;
    }

}

class PostRequest extends APIRequestType{
    RunOperations(query: string, td: TestData<ITestDataProps>) {
        throw new Error("Method not implemented.");
    }
    type: string = "POST";  

}

class PatchRequest extends APIRequestType{
    RunOperations(query: string, td: TestData<ITestDataProps>) {
        throw new Error("Method not implemented.");
    }
    type: string = "PATCH"; 
    
}

class PutRequest extends APIRequestType{
    RunOperations(query: string, td: TestData<ITestDataProps>) {
        throw new Error("Method not implemented.");
    }
    type: string = "PUT"; 
    
}

class DeleteRequest extends APIRequestType{
    RunOperations(query: string, td: TestData<ITestDataProps>) {
        throw new Error("Method not implemented.");
    }
    type: string = "DELETE"; 
    
}

abstract class ParseOperation{
    abstract priority: number;
    abstract requestType: Array<string>;
    results: Array<string[]> = new Array<string[]>();

    ReturnRequestTypes(): Array<string>{
        return this.requestType;
    }

    abstract CheckValidOperation(query: string): boolean;
    abstract RunOperation(query: string, td: TestData<ITestDataProps>, results: Array<string[]>, first: boolean): Array<string[]>;
}

class MetaDataOperation extends ParseOperation{
    priority: number = 1
    requestType: string[] = ["GET"]
    CheckValidOperation(query: string): boolean {
        let check: boolean = false;
        
        return check;
    }
    RunOperation(): Array<string[]> {
        throw new Error("Method not implemented.");
    }
    

}

class EntityOperation extends ParseOperation{
    priority: number;
    requestType: string[] = ["GET", "PUT"];
    entityType: string;
    CheckValidOperation(query: string): boolean {
        let check: boolean = false;
        var q: number = query.indexOf("?");
        var ss: string = query.substring(0,q-1);
        console.log(ss);

        for (var i = 0; i < testData.recordtypes.length; i++){
            if (testData.recordtypes[i] === ss){
                check = true
                this.entityType = ss;
            }
        }
        return check;
    }
    RunOperation(query: string, td: TestData<ITestDataProps>, results: Array<string[]>, first: boolean): Array<string[]> {
        var recordseti: number = 999;
        console.log("running entity operation");
        if (first === true){
            console.log("First = true")
            for (var i = 0; i < testData.recordtypes.length; i++){
                console.log(testData.recordtypes[i]);
                console.log(this.entityType);
                if(testData.recordtypes[i] === this.entityType){
                    recordseti = i;
                }
            }
            console.log(recordseti);
            this.results.push(testData.data.dataset[recordseti].columns)
            for (var ii = 0; ii < testData.data.dataset[recordseti].records.length; ii++){
                this.results.push(testData.data.dataset[recordseti].records[ii])
            }
            console.log(this.results);
        }
        else{
            throw new Error("Entity Operation must be first")
        }
        return this.results;
    }

}

class SelectOperation extends ParseOperation{
    priority: number;
    requestType: string[] = ["GET"];
    results = new Array<string[]>();
    CheckValidOperation(query: string): boolean {
        let check: boolean = query.includes("$select=");

        return check;
    }
    RunOperation(query: string, td: TestData<ITestDataProps>, results: Array<string[]>, first: boolean): Array<string[]> {
        if (first === true){
            throw new Error("Select Operation must never be run first")
        }
        else{
            let n: number = query.indexOf("$select=");
            n = n + 8;
            let substr: string = query.slice(n)
            let cols: string[] = substr.split(",");

            let colsi: number[] = new Array<number> ();
            for (var i = 0; i < cols.length; i++){
                for (var ii = 0; ii < results[0].length; ii++){
                    var r = results[0]
                    if (r[ii] === cols[i]){
                        colsi.push(ii -1 )
                    }
                }
            }
            console.log(colsi);

            for (var re = 0; re < results.length; re++){
                let res: Array<string> = new Array<string>();
                if (re === 0){
                    for (var co = 0; co < colsi.length; co++){
                        var rec: string[] = results[re]
                        var ci = colsi[co] + 1
                        res.push(rec[ci])
                    }
                    this.results.push(res);
                }
                else{
                    for (var c = 0; c < colsi.length; c++){
                        var rec: string[] = results[re]
                        res.push(rec[colsi[c]])
                    }
                    this.results.push(res)
                }

            }
        }
        return this.results;
    }
    
}

const requestTypes: any[] = [new GetRequest(), new PostRequest(), new PutRequest(), new PatchRequest(), new DeleteRequest()];
const dataOperations: any[] = [new EntityOperation(), new SelectOperation()];