import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {TestDiv, updateRecord} from "./TestFramework";
import {TestData, FetchJson, testData, FetchJSON, recordset} from "./TestData";
import {FakeWebAPI} from './FakeWebAPI';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class TestingFrameWork implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	
	private isTest: Boolean = false;
	public context: ComponentFramework.Context<IInputs>;
	private container: HTMLDivElement;
	private testData: object[];
	private testProps: object;
	private webAPI: FakeWebAPI;
	
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.context = context;
		this.webAPI = new FakeWebAPI(context, testData)

		this.container = container;
		let rset: recordset = {
			columns: ["name","address1"],
			records: [["HH","2 Sneak Street"]]

		}
		if (context.parameters.sampleDataSet == null){
			this.isTest = true;
		}

		if(this.isTest = true)
		{
			this.testProps = TestData.defaultProps;
			console.log(this.testProps);

			ReactDOM.render(
				React.createElement(
					TestDiv, this.testProps
				),
				this.container
			)
					
			
			updateRecord(testData, "account", "1c9c6f0a-1767-4d43-8e88-419527c4717b", rset);
		}
		else
		{

		}
		this.webAPI.RetrieveMultiple("", FetchJson, 0);
		this.webAPI.CreateRecord("contact", ['95fe5ef5-1bf5-49e0-9745-ca9c02fac52f','New','Record','02fbf207-9e8e-4cde-bb23-9a0edec55543'])
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

}