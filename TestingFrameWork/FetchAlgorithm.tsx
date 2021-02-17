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
        if (operator === "eq"){
            this.conditionType = new ConditionEq;
        }
        else if (operator === "ne"){
            this.conditionType = new ConditionNe;
        }
    }

    RunCondition(testData: TestData<ITestDataProps>, condition: Condition, entity: string): string[][]{
        this.results = this.conditionType.Run(testData, condition, entity);
        return this.results;
    }


}

interface IConditionType{
    Run(testData: TestData<ITestDataProps>, condition: Condition, entity: string): string[][];

}

class ConditionEq implements IConditionType{
    Run(testData: TestData<ITestDataProps>, condition: Condition, entity: string): string[][] {
        let results: string[][] = new Array<string[]>();
        let value: string = condition["@value"];
        let field: string = condition["@attribute"];
        let recordnumber: number = FindRecordNumber(testData, entity);
        let records: string[][] = testData.data.dataset[recordnumber].records
        let columns: string[] = testData.data.dataset[recordnumber].columns;
        let columnnumber: number = FindColumnNumber(testData, condition["@attribute"], columns);

        let matchingrecords: Array<string[]> = new Array<string[]>();

        for (var i = 0; i < records.length; i++){
            let record: string[] = records[i];
            if (record[columnnumber] === value){
                console.log("Found value!: " + value + record[columnnumber]);
                results.push(record)
            }
        }

        console.log("Condition = " + entity + condition["@value"] + condition["@operator"] + condition["@attribute"])
        console.log(results);
        return results;
    }
    
}

class ConditionNe implements IConditionType{
    Run(testData: TestData<ITestDataProps>, condition: Condition, entity: string): string[][] {
        throw new Error("Method not implemented.");
    }
    
}

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