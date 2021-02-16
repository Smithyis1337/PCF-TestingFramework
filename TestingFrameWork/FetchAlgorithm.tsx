import {TestData, ITestDataProps, FetchJson, FetchJSON, Condition, recordset, Filter} from "./TestData"

// This Class Exists for expansion to use multiple Filters. Change GatherResults to search through multiple filters
export class FetchResults{
    private results: string[][];
    private resultsset: string[][][];
    private resultsGatherer: RetrieveMultipleResults;

    GatherResults(testData: TestData<ITestDataProps>, query: FetchJSON){
        this.resultsGatherer = new RetrieveMultipleResults();
        this.results = this.resultsGatherer.filter(query.entity.filter, testData);
        return this.results;

    }

}

class RetrieveMultipleResults{
    private filterresults: string[][][];
    private results: string[][] = [[]];

    filter(filter: Filter, testData: TestData<ITestDataProps>): string[][]{
        let filtertype: string = filter["@type"];

        for (var i = 0; i < filter.condition.length; i++){
            let r: string[][];
            let conditionResultsFinder: ConditionResultsFinder = new ConditionResultsFinder()
            conditionResultsFinder.SetType(filter.condition[i]["@operator"]);
            r = conditionResultsFinder.RunCondition(testData, filter.condition[i]);
            this.filterresults.push(r);
        }

        if (filtertype === "and"){
            this.results = [[]];
            //Add code for sorting AND results
            return this.results;

        }
        else if (filtertype === "or"){
            this.results = [[]];
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

        }
    }

    RunCondition(testData: TestData<ITestDataProps>, condition: Condition): string[][]{
        this.results = this.conditionType.Run(testData, condition);
        return this.results;
    }


}

interface IConditionType{
    Run(testData: TestData<ITestDataProps>, condition: Condition): string[][];

}

class ConditionEq implements IConditionType{
    Run(testData: TestData<ITestDataProps>, condition: Condition): string[][] {
        let results: string[][] = [[]]
        console.log("Condition = " + condition["@value"] + condition["@operator"] + condition["@attribute"])
        return results;
    }
    
}