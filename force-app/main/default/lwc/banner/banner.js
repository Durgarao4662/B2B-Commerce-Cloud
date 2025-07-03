import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import communityId from '@salesforce/community/Id';
import getProductCategory from '@salesforce/apex/B2BCategoryInfo.getProductCategory';

export default class Banner extends LightningElement {

    @wire(CurrentPageReference)
	setCurrentPageReference(currentPageReference) {
    this.currentPageReference = currentPageReference;
    this.getRecordId();
        if (this.connected) {
            // We need to have the currentPageReference, and to be connected before
            // we can use NavigationMixin
        } else {
            // NavigationMixin doesn't work before connectedCallback, so if we have 
            // the currentPageReference, but haven't connected yet, queue it up
            this.generateUrlOnConnected = true;            
        }
    };
    
    @track recordId;
    _categorydata;

    @api
	get effectiveAccountId() {
		return this._effectiveAccountId;
	}

    /**
	* Sets the effective account - if any - of the user viewing the product
	* and fetches updated cart information
	*/
	set effectiveAccountId(newId) {
		this._effectiveAccountId = newId;
	}

    getRecordId(){
		this.recordId = this.currentPageReference.attributes.recordId;
        this.getCategoryDetails(this.recordId);
	}

    //This get call at element load.
    connectedCallback() {
        this.connected = true;
        this.getRecordId();   
    }
    disconnectedCallback(){

    }

	// Fetch the other products from the view product category
	getCategoryDetails(recordId){
		getProductCategory({
                communityId: communityId,
				productCategoryId: recordId,
                effectiveAccountId: this.effectiveAccountId
		}).then(result =>{
			this._categorydata = result;
		}).catch(error =>{
				console.log('error:: '+JSON.stringify(error));
		});
	}

    // //CSS update dynamically code. 
    // /* A lifecycle hook that is Called after every render of the component. */
    // renderedCallback() {
    //    this.initCSSVariables();
    //     /* JFYI, use a flag if you only want to run this logic on first render of the component. */
    // }

    // initCSSVariables() {
    //     var css = this.template.host.style;
    //     css.setProperty('--modalHeight', this.height);
    //     css.setProperty('--bgImage', this._categorydata.bannerImage.url);
    //     //css.setProperty('--categoryName', this._categorydata.fields.name);
    // }
}