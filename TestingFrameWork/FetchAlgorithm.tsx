import {TestData, ITestDataProps, FetchJson, FetchJSON, Condition, recordset, Filter} from "./TestData"


// This Class Exists for expansion to use multiple Filters. Change GatherResults to search through multiple filters
export class FetchResults{
    private results: string[][];
    private resultsset: string[][][];
    private resultsGatherer: RetrieveMultipleResults;

    GatherResults(testData: TestData<ITestDataProps>, query: FetchJSON){
        this.resultsGatherer = new RetrieveMultipleResults();
        this.results = this.resultsGatherer.filter(query.entity.filter, testData, query.entity["@name"]);
        console.log("GatherResults: ");
        console.log(this.results)
        return this.results;

    }

}

class RetrieveMultipleResults{
    private filterresults: string[][][] = new Array<string[][]>();;
    private results: string[][] = new Array<string[]>();;

    filter(filter: Filter, testData: TestData<ITestDataProps>, entity: string): string[][]{
        let filtertype: string = filter["@type"];

        for (var i = 0; i < filter.condition.length; i++){
            let r: string[][];
            let conditionResultsFinder: ConditionResultsFinder = new ConditionResultsFinder()
            conditionResultsFinder.SetType(filter.condition[i]["@operator"]);
            r = conditionResultsFinder.RunCondition(testData, filter.condition[i], entity);
            this.filterresults.push(r);
        }

        if (filtertype === "and"){
            //...take each result from the first condition...
            for (var ii = 0; ii < this.filterresults[0].length; ii++){
                //...and check it exists in other conditions
                let r: string[][] = this.filterresults[0]
                let singleresult: string[] = r[ii]
                let exists: boolean = AndFilterCheck(this.filterresults, singleresult);
                if (exists === true){
                    this.results.push(singleresult);
                }
            }
            return this.results;
        }
        else if (filtertype === "or"){
            //For each results set
            for (var iii = 0; iii < this.filterresults.length; iii++){
                let resultsset: string[][] = this.filterresults[iii];
                for (var r = 0; r < resultsset.length; r++){
                    let exists: boolean = OrFilterCheck(resultsset[r], this.results);
                    if (exists === false){
                        this.results.push(resultsset[r])
                    }
                }
            }
            //Add code for sorting OR results
            return this.results
        }
        return this.results;
    }

}

// Add In new Condition types here in the SetType method
class ConditionResultsFinder{
    private conditionType: IConditionType;
    private results: string[][];

    SetType(operator: string){
        
        for (var i = 0; i < ConditionList.length; i++){
            let o: any = ConditionList[i].operator;
            if(o === operator){
                this.conditionType = ConditionList[i].GetType();
                console.log("Type set: " + o);
            }
        }
    }

    RunCondition(testData: TestData<ITestDataProps>, condition: Condition, entity: string): string[][]{
        this.results = this.conditionType.Run(testData, condition, entity);
        return this.results;
    }


}

interface IConditionType{
    operator: string;
    GetType(): IConditionType;
    Run(testData: TestData<ITestDataProps>, condition: Condition, entity: string): string[][];
    ReturnResults(records: string[][], columnnumber: number, value: string): string[][];
}

abstract class ConditionType implements IConditionType{
    abstract operator: string;

    GetType(): any{
        return this;
    }
    
    Run(testData: TestData<ITestDataProps>, condition: Condition, entity: string): string[][] {
        let results: string[][] = new Array<string[]>();
        let value: string = condition["@value"];
        let field: string = condition["@attribute"];
        let recordnumber: number = FindRecordNumber(testData, entity);
        let records: string[][] = testData.data.dataset[recordnumber].records
        let columns: string[] = testData.data.dataset[recordnumber].columns;
        let columnnumber: number = FindColumnNumber(testData, condition["@attribute"], columns);

        results = this.ReturnResults(records, columnnumber, value);
        return results;
    }

    abstract ReturnResults(records: string[][], columnnumber: number, value: string): string[][];
    
}

class ConditionEq extends ConditionType{
    operator: string = "eq";

    ReturnResults(records: string[][], columnnumber: number, value: string): string[][] {
        let results: string[][] = new Array<string[]>();
        for (var i = 0; i < records.length; i++){
            let record: string[] = records[i];
            if (record[columnnumber] === value){
                console.log("Found value!: " + value + record[columnnumber]);
                results.push(record)
            }
        }
        console.log(results);
        return results;
    }
    
}

class ConditionNe extends ConditionType{
    operator: string = "ne";
    
    ReturnResults(records: string[][], columnnumber: number, value: string): string[][] {
        let results: string[][] = new Array<string[]>();
        for (var i = 0; i < records.length; i++){
            let record: string[] = records[i];
            if (record[columnnumber] != value){
                console.log("Record found Ne");
                results.push(record);
            }
        }

        return results;
    }
}

class ConditionLike extends ConditionType{
    operator: string = "like";
    
    ReturnResults(records: string[][], columnnumber: number, value: string): string[][] {
        let results: string[][] = new Array<string[]>();
        for (var i = 0; i < records.length; i++){
            let record: string[] = records[i];
            var v = value.toLowerCase();
            if (record[columnnumber].toLocaleLowerCase().includes(v)){
                console.log("Found Like")
                results.push(record);
            }
        }

        return results;
    }
}

class ConditionNotLike extends ConditionType{
    operator: string = "not-like";
    
    ReturnResults(records: string[][], columnnumber: number, value: string): string[][] {
        let results: string[][] = new Array<string[]>();
        for (var i = 0; i < records.length; i++){
            let record: string[] = records[i];
            var v = value.toLowerCase();
            if (!record[columnnumber].toLocaleLowerCase().includes(v)){
                console.log("Found Not Like")
                results.push(record);
            }
        }

        return results;
    }
}

const ConditionList: any[] = [new ConditionEq(), new ConditionNe(), new ConditionLike(), new ConditionNotLike()];


function OrFilterCheck(result: string[], results: string[][]): boolean{
    let exists: boolean = false;
    for (var i = 0; i < results.length; i++){
        if (results[i] === result){
            exists = true;
        }
    }
    return exists;
}

function AndFilterCheck(filterresults: string[][][], result: string[]): boolean{
    let exists: boolean = false;
    let occurs: number = 0;
    let conditionsnumber: number = filterresults.length;
    console.log("Conditions Number: " + conditionsnumber)

    for (var i = 0; i < filterresults.length; i++){
        let fr: string[][] = filterresults[i];
        for (var ii = 0; ii < fr.length; ii++){
            if (fr[ii] === result){
                occurs = occurs + 1;
            }
        }
    }

    if (occurs === conditionsnumber){
        exists = true;
    }

    return exists;

}

function FindColumnNumber(testData: TestData<ITestDataProps>, field: string, columns: string[]):number{
    let columnnumber: number= 0;
    
    for (var i = 0; i < columns.length; i++){
        if(columns[i] === field){
            columnnumber = i - 1;
        }
    }
    return columnnumber;
}

function FindRecordNumber(testData: TestData<ITestDataProps>, entity: string):number{
    let recordnumber: number = 0;
    for (var i = 0; i < testData.data.dataset.length; i++){
        let e: string = testData.data.dataset[i].columns[0];
        if (e === entity){
            recordnumber = i;
        }
    }
    return recordnumber;
}
