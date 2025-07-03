// assignChildRecords.js
import { LightningElement, api, wire,track } from 'lwc';
import getChildRecords from '@salesforce/apex/ChildRecordController.getChildRecords';
import assignChildRecordsToParent from '@salesforce/apex/ChildRecordController.assignChildRecordsToParent';
import getRecommendationsList from '@salesforce/apex/ChildRecordController.getRecommendations';
import { CurrentPageReference } from 'lightning/navigation';
import deleteRecommendation from '@salesforce/apex/ChildRecordController.deleteRecommendation';
import { refreshApex } from '@salesforce/apex';
export default class AssignChildRecords extends LightningElement {
    showRecommendations = true
    parentId;
    childRecords = [];
    @track recProductList = [];
    @track wiredrecProductList =[];
    selectedChildRecordIds = [];
    @track error;
   // recIdtoDelete;
    @track recordId;
    // parentId: '$parentId'


    connectedCallback() {   
        console.log('connectedCallback is call ')   
        this.getRecordId();
    }
    renderedCallback(){
        console.log('renderedCallback is call ')
    }
    //fetch the view page recordId
    @wire(CurrentPageReference)
    currentPageReference;
    // fetch the recommended records
    @wire(getRecommendationsList, { parentId: '$parentId'}) recResult(result){
            this.wiredrecProductList = result;
        if (result.data) {
            this.recProductList = result.data;
            console.log('line 27 recProductList '+JSON.stringify(this.recProductList))
        } else if (result.error) {
            // Handle error
            this.error = result.error;
            this.recProductList = []
            console.log('line 30 child records'+error)
        }
    }

    // fetch the all product records excluding the parent product and recommendation products
    @wire(getChildRecords, { parentId: '$parentId'})
    wiredChildRecords({ data, error }) {
        if (data) {
            this.childRecords = data;
            console.log('line 38 child records'+JSON.stringify(this.childRecords))
        } else if (error) {
            // Handle error
            console.log('line 41 child records'+error)
        }
    }
  
    getRecordId(){
        this.recordId = this.currentPageReference.attributes.recordId;
        this.parentId = this.recordId;
    }
    handleCheckboxChange(event) {
        const isChecked = event.target.checked;
        const childRecordId = event.target.value;
        console.log('line 26 child records'+this.childRecordId)
        if (isChecked) {
            // Add the selected child record id to the list
            this.selectedChildRecordIds.push(childRecordId);
        } else {
            // Remove the deselected child record id from the list
            const index = this.selectedChildRecordIds.indexOf(childRecordId);
            if (index > -1) {
                this.selectedChildRecordIds.splice(index, 1);
            }
        }
    }

    assignSelected() {
        console.log('Checked: '+this.selectedChildRecordIds)
        console.log('recordId: '+this.recordId)
        if (this.selectedChildRecordIds.length > 0) {
            // Call the Apex method to assign selected child records to the parent
            assignChildRecordsToParent({ childRecordIds: this.selectedChildRecordIds, parentId: this.parentId })
                .then(() => {
                    // Clear the selected child record ids list
                    this.selectedChildRecordIds = [];
                    console.log('line 76 : '+this.selectedChildRecordIds)
                    this.showRecommendations = true;
                   // window.location.reload();
                    // Refresh the child records list
                    refreshApex(this.wiredrecProductList);
                    console.log('line 81 refreshApex calling: ')
                })
                .catch(error => {
                    // Handle error
                    console.log('line 82 error: '+error)
                });
        } else {
            // Display a message to select at least one child record
            console.log('Select atleast one product..!')
            window.alert('Select atleast one product..!');
        }
    }
    handleEdit(){
        this.showRecommendations = false;
        console.log('showRecommendations set to FALSE')
    }
    handleCancel(){
        this.showRecommendations = true;
        console.log('showRecommendations set to TRUE')
    }
    deleteRecommendation(event){
        console.log('delete')
        const recId = event.currentTarget.dataset.id;
        //this.recIdtoDelete = event.currentTarget.dataset.id;
        console.log('del rec '+recId)
        
        if(recId){
            deleteRecommendation({ recordId:  recId })
            .then(()=>{
                console.log('line 111 recommendation deleted')
                refreshApex(this.wiredrecProductList);
            })
            .catch((error)=>{
                console.log('line 82 error: '+error)
            })

            
        }

    }
    // refreshData() { 
    //     console.log('line 124 refresh Data')
    //     return refreshApex(this.wiredrecProductList);
    //     }
}