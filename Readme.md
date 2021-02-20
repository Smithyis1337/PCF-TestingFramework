## Enhanced PCF Testing Framework Readme

**Introduction**

Welcome to the Enhanced PCF Testing framework. You may be wondering when and why you should use this framework. Let's first take a look at the when:

 - When developing PCF's for Microsoft Dynamics
 - When your PCF includes Web API calls from the context
 - Especially if your PCF is using a Data set

Ok, that's great and all but, why should you use it?

 - The Enhanced Framework allows you to call the Web API when **not** running in a live environment
 - Speeds up your testing as you do not need to build and publish your PCF to fully test
 - Easy and simple to use, simply instantiate the FakeWebAPI class and run your API requests through it. It will automatically detect the environment type (Live or Test) and run accordingly.

## Getting Started

To get going with the basics all you need to do is import the FakeWebAPI and the default Test Data:

    import {FakeWebAPI} from  './FakeWebAPI';
    import {testData} from  "./TestData";
Once imported you can instantiate a new instance of the class in your `init` method:

    private webAPI: FakeWebAPI;
	
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFrameworkDictionary, container:HTMLDivElement){
		this.context = context;
		this.webAPI = new FakeWebAPI(context, testData);
	}

 As you can see above we simply fed the `FakeWebAPI` class both our context and our test data.

**Making API Calls**

Now all we need to do to make a call to the WebAPI is to call it from our new class instead of from context. So instead of:

    this.context.webAPI.createRecord(args);

we will do:

    this.webAPI.CreateRecord(args);

## Flexible Test Data

But how can the Web API function when testing offline? Simple; you can create a fake data set that the Web API can query if the PCF is run in a test environment.

**Basic Data Structure**

An example data set is provided  but can be easily edited. The structure is as follows:

    environment: string;
    recordtypes: string[]
    relationshipsenabled: boolean;
    relationships: relationships[]
    data: dataset;

Of course the dataset class contains the majority of the data, its structure looks like this:

    class dataset {
	    dataset: recordset[];
	}
	
	class recordset {
		columns: Array<string>
		records: Array<string[]>
	}

**Adding a new entity and associated records**

So to add new entities and records for those entities, all you need to do is:

 1. Define a new `recordset` for the entity then add the new `recordset` to your `dataset` and the WebAPI will have access to that entity and its associated records.
 2. Add a string containing the logical name of the entity into the `recordtypes` property of your dataset.

**Important:** The first value in the `columns: Array<string>` property must be the logical name of the entity you wish to add.

**Adding a new 1:N Relationship**

This framework currently supports 1:N Relationships through the `relationships` property. This property contains an array of class `relationship`, which has a simple structure:

    class relationship {
		entityone: string;
		entitytwo: string;
		field: string;
		type?: string;
	}
This should be self explanatory, I would however like to point out the optional `type` property. This property exists so in the future, support for different relationship types can be added. To create a new relationship simply add a new relationship to the `relationships` property in your dataset.


## RetrieveMultiple API Query

So the retrieve multiple API query is a bit more complex than the others and requires a bit more explanation. If you want to run a retrieve multiple query you must provide `webAPI.RetrieveMultiple()` with a query of type `FetchJSON`. This type however is easy to generate, simply create your FetchXML in dynamics and convert it to JSON. Then just define a var/const in the following way:

    const FetchQuery: FetchJSON = {INSERT JSON HERE}

**Important** you only need to provide your query as a `FetchJSON` for querying test data. When running in live provide your query as usual.

**Current Limitations of FetchJSON**
The algorithm which will search your test data based on your `FetchJSON` query only supports the following:

 - One And/Or filter
 - Equals, does not equal, contains and does not contain conditions.

If you wish to add support for other condition types then in the `FetchAlgorithm.tsx` file you can:

 1. Create a new condition class in the following way: `class ConditionNew extends ConditionType{}`.
 2. After creating your new Condition class, add it to the `const ConditionList`

> Written with [StackEdit](https://stackedit.io/).
