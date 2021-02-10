export class recordset {
    columns: Array<string>
    records: Array<string[]>
    
    constructor(columns: Array<string>, records: Array<string[]>){
        this.columns = columns;
        this.records = records;
    }
}

class dataset {
    dataset: recordset[];

    constructor(dataset: recordset[]){
        this.dataset = dataset;
    };
}

//Currently Many:1 relationships. Add more relationship types
class relationship {
    entityone: string;
    entitytwo: string;
    field: string;
    type?: string;
}

export interface ITestDataProps {
    environment: string;
    recordtypes: string[];
    relationshipsenabled: boolean;
    relationships: relationship[];
    data: dataset;
}

export class TestData <ITestDataProps> {
    environment: string;
    recordtypes: string[];
    relationshipsenabled: boolean;
    relationships: relationship[];
    data: dataset;
//Example Test Data
    static defaultProps = {
        environment: "Test Data Environment",
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

    constructor(environment: string, recordtypes: string[],relationshipsenabled: boolean,relationships: relationship[],data: dataset){
        this.environment = environment;
        this.recordtypes = recordtypes;
        this.relationshipsenabled = relationshipsenabled;
        this.relationships = relationships;
        this.data = data;
    };
    
}

const environment: string = "Test Data Environment";
const recordtypes: string[] = ['contact','account'];
const relationshipsenabled : boolean = true;
const relationships: relationship[] = [
   {
       entityone: "contact",
       entitytwo: "account",
       field: "acc_relationship"
   }];
const tdata: dataset = {dataset: [
   {
       columns: ['contact','contactid','firstname','lastname','acc_relationship'],
       records: [['075e76a5-4d24-44ab-80b3-d4c788b375bf','Matt','Smith','02fbf207-9e8e-4cde-bb23-9a0edec55543'],['79e16aff-a864-483f-b573-be9081f50c4d','Joe','Bloggs','1c9c6f0a-1767-4d43-8e88-419527c4717b']]
   },
   {
       columns: ['account','accountid','name','address1'],
       records: [['02fbf207-9e8e-4cde-bb23-9a0edec55543','SuperSoftware','10 Open Source Road'],['1c9c6f0a-1767-4d43-8e88-419527c4717b','Hardly Hackers','1 Sneak Street']]
   }
]};

export const testData: TestData<ITestDataProps> = new TestData(environment, recordtypes, relationshipsenabled, relationships, tdata);

//Defining the FetchJSON format

export class Condition {
    ['@attribute']: string;
    ['@operator']: string;
    ['@value']: string;
}

export class Filter {
    ['@type']: string;
    condition: Condition[];

}

class Order {
    ['@attribute']: string;
    ['@descending']: string;
}

class Entity {
    ['@name']: string;
    attribute: Object[];
    filter: Filter;
    order: Order;
}

export interface IfetchJSONProps {
    entity: Entity;
}

export class FetchJSON {
    entity: Entity;

    constructor(entity: Entity){
        this.entity = entity;
    }
}

export const FetchJson: FetchJSON = {
    "entity": {
       "@name": "contact",
       "attribute": [
          {
             "@name": "fullname"
          },
          {
             "@name": "telephone1"
          },
          {
             "@name": "contactid"
          }
       ],
       "order": {
          "@attribute": "fullname",
          "@descending": "false"
       },
       "filter": {
          "@type": "and",
          "condition": [
             {
                "@attribute": "firstname",
                "@operator": "eq",
                "@value": "Matt"
             },
             {
                "@attribute": "lastname",
                "@operator": "eq",
                "@value": "Smith"
             }
          ]
       }
    }
 }


